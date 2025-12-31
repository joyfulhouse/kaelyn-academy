import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema/users";
import { auth } from "@/lib/auth";
import {
  parseCSV,
  validators,
  type CSVError,
} from "@/lib/import/csv-parser";
import {
  type ImportStudent,
  type ImportResult,
  type ImportRowError,
  REQUIRED_IMPORT_FIELDS,
  buildHeaderMap,
} from "@/lib/import/types";
import { eq, and, isNull } from "drizzle-orm";
import { logger } from "@/lib/logging";

/**
 * POST /api/admin/import - Import students from CSV
 *
 * Requires school_admin or platform_admin role.
 * Imports students into the organization's learner roster.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin permissions
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, session.user.id), isNull(users.deletedAt)),
    columns: { id: true, role: true, organizationId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!["school_admin", "platform_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!user.organizationId) {
    return NextResponse.json(
      { error: "No organization associated with user" },
      { status: 400 }
    );
  }

  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const classId = formData.get("classId") as string | null;
    const sendInvitations = formData.get("sendInvitations") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse CSV
    const parseResult = parseCSV<Record<string, string>>(content, {
      skipEmptyRows: true,
      trimValues: true,
      maxRows: 500, // Limit for bulk import
    });

    if (!parseResult.success && parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: "CSV parsing failed",
          errors: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Build header mapping
    const headerMap = buildHeaderMap(parseResult.headers);

    // Check required fields are mapped
    const mappedFields = Object.values(headerMap);
    const missingFields = REQUIRED_IMPORT_FIELDS.filter(
      (f) => !mappedFields.includes(f)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingFields.join(", ")}`,
          availableColumns: parseResult.headers,
          requiredFields: REQUIRED_IMPORT_FIELDS,
        },
        { status: 400 }
      );
    }

    // Validate and transform rows
    const validStudents: ImportStudent[] = [];
    const rowErrors: ImportRowError[] = [];

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      const rowNum = i + 2; // Account for header row + 1-based indexing

      // Map columns to fields
      const student: Partial<ImportStudent> = {};
      for (const [csvCol, value] of Object.entries(row)) {
        const field = headerMap[csvCol];
        if (field) {
          if (field === "gradeLevel") {
            student.gradeLevel = parseInt(value, 10);
          } else {
            (student as Record<string, string | number>)[field] = value;
          }
        }
      }

      // Validate required fields
      const errors: CSVError[] = [];

      if (!student.firstName?.trim()) {
        errors.push({ row: rowNum, column: "firstName", message: "First name is required" });
      }
      if (!student.lastName?.trim()) {
        errors.push({ row: rowNum, column: "lastName", message: "Last name is required" });
      }
      if (student.gradeLevel === undefined || isNaN(student.gradeLevel)) {
        errors.push({ row: rowNum, column: "gradeLevel", message: "Valid grade level is required" });
      } else if (student.gradeLevel < 0 || student.gradeLevel > 12) {
        errors.push({ row: rowNum, column: "gradeLevel", message: "Grade must be 0 (K) to 12" });
      }

      // Validate optional fields
      if (student.email) {
        const emailError = validators.email(student.email);
        if (emailError) {
          errors.push({ row: rowNum, column: "email", message: emailError, value: student.email });
        }
      }

      if (student.parentEmail) {
        const emailError = validators.email(student.parentEmail);
        if (emailError) {
          errors.push({ row: rowNum, column: "parentEmail", message: emailError, value: student.parentEmail });
        }
      }

      if (student.dateOfBirth) {
        const dateError = validators.date(student.dateOfBirth);
        if (dateError) {
          errors.push({ row: rowNum, column: "dateOfBirth", message: dateError, value: student.dateOfBirth });
        }
      }

      if (errors.length > 0) {
        rowErrors.push(...errors.map((e) => ({
          row: e.row,
          field: e.column,
          message: e.message,
          data: row,
        })));
      } else {
        // Apply class ID if provided
        if (classId) {
          student.classId = classId;
        }
        validStudents.push(student as ImportStudent);
      }
    }

    // If too many errors, abort
    if (rowErrors.length > 10) {
      return NextResponse.json(
        {
          error: "Too many validation errors",
          errors: rowErrors.slice(0, 20),
          totalErrors: rowErrors.length,
        },
        { status: 400 }
      );
    }

    // Import valid students
    const createdLearners: string[] = [];
    const importErrors: ImportRowError[] = [...rowErrors];

    for (const student of validStudents) {
      try {
        // Create learner record
        const [newLearner] = await db
          .insert(learners)
          .values({
            userId: session.user.id, // Temporary - should be linked to parent account
            organizationId: user.organizationId!,
            name: `${student.firstName} ${student.lastName}`,
            gradeLevel: student.gradeLevel,
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
            isActive: true,
            preferences: {},
            parentalControls: {},
          })
          .returning({ id: learners.id });

        createdLearners.push(newLearner.id);

        logger.info("Imported student", {
          learnerId: newLearner.id,
          name: `${student.firstName} ${student.lastName}`,
          gradeLevel: student.gradeLevel,
        });
      } catch (error) {
        logger.error("Failed to import student", {
          student: `${student.firstName} ${student.lastName}`,
          error,
        });
        importErrors.push({
          row: validStudents.indexOf(student) + 2,
          message: "Database error during import",
          data: student as unknown as Record<string, string>,
        });
      }
    }

    // TODO: Send invitation emails if requested
    const invitationsSent = 0;
    if (sendInvitations) {
      // This would integrate with the email service
      // For now, just log the intent
      logger.info("Invitations requested for imported students", {
        count: createdLearners.length,
      });
    }

    const result: ImportResult = {
      jobId: crypto.randomUUID(),
      status: importErrors.length > 0 ? "completed" : "completed",
      totalRows: parseResult.data.length,
      successfulRows: createdLearners.length,
      failedRows: importErrors.length,
      errors: importErrors,
      createdLearners,
      invitationsSent,
    };

    logger.info("Bulk import completed", {
      jobId: result.jobId,
      totalRows: result.totalRows,
      successfulRows: result.successfulRows,
      failedRows: result.failedRows,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Bulk import failed", { error });
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/import/template - Download CSV template
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templateContent = `First Name,Last Name,Email,Grade Level,Date of Birth,Parent Email
John,Smith,john.smith@school.edu,5,2014-03-15,parent@email.com
Jane,Doe,jane.doe@school.edu,3,2016-08-22,guardian@email.com`;

  return new NextResponse(templateContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="student-import-template.csv"',
    },
  });
}
