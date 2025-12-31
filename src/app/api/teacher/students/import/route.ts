import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
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
 * Verify that the user is a teacher
 */
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId));
  return { isTeacher: user?.role === "teacher", organizationId: user?.organizationId };
}

/**
 * Verify that a class belongs to the teacher
 */
async function verifyClassOwnership(classId: string, teacherId: string): Promise<boolean> {
  const [cls] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(
        eq(classes.id, classId),
        eq(classes.teacherId, teacherId),
        isNull(classes.deletedAt)
      )
    );
  return !!cls;
}

/**
 * POST /api/teacher/students/import - Import students from CSV
 *
 * Requires teacher role.
 * Imports students into the teacher's classes.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check teacher permissions
  const { isTeacher, organizationId } = await verifyTeacher(session.user.id);

  if (!isTeacher) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  if (!organizationId) {
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

    // Validate class ownership if classId is provided
    if (classId) {
      const ownsClass = await verifyClassOwnership(classId, session.user.id);
      if (!ownsClass) {
        return NextResponse.json(
          { error: "Class not found or unauthorized" },
          { status: 403 }
        );
      }
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

    // Check for duplicate names in the batch
    const nameSet = new Set<string>();
    const duplicateNames: string[] = [];
    for (const student of validStudents) {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      if (nameSet.has(fullName)) {
        duplicateNames.push(`${student.firstName} ${student.lastName}`);
      } else {
        nameSet.add(fullName);
      }
    }

    if (duplicateNames.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate students in file",
          duplicates: duplicateNames,
        },
        { status: 400 }
      );
    }

    // Import valid students
    const createdLearners: string[] = [];
    const importErrors: ImportRowError[] = [...rowErrors];

    for (const student of validStudents) {
      try {
        // Check if a learner with the same name already exists in the organization
        const existingLearner = await db
          .select({ id: learners.id })
          .from(learners)
          .where(
            and(
              eq(learners.organizationId, organizationId),
              eq(learners.name, `${student.firstName} ${student.lastName}`),
              isNull(learners.deletedAt)
            )
          )
          .limit(1);

        let learnerId: string;

        if (existingLearner.length > 0) {
          // Use existing learner
          learnerId = existingLearner[0].id;
          logger.info("Using existing learner for import", {
            learnerId,
            name: `${student.firstName} ${student.lastName}`,
          });
        } else {
          // Create new learner record
          const [newLearner] = await db
            .insert(learners)
            .values({
              userId: session.user.id, // Teacher as temporary owner
              organizationId: organizationId,
              name: `${student.firstName} ${student.lastName}`,
              gradeLevel: student.gradeLevel,
              dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
              isActive: true,
              preferences: {},
              parentalControls: {},
            })
            .returning({ id: learners.id });

          learnerId = newLearner.id;
          createdLearners.push(learnerId);

          logger.info("Created new learner", {
            learnerId,
            name: `${student.firstName} ${student.lastName}`,
            gradeLevel: student.gradeLevel,
          });
        }

        // Enroll in class if classId is provided
        if (student.classId) {
          // Check if already enrolled
          const existingEnrollment = await db
            .select({ id: classEnrollments.id })
            .from(classEnrollments)
            .where(
              and(
                eq(classEnrollments.classId, student.classId),
                eq(classEnrollments.learnerId, learnerId)
              )
            )
            .limit(1);

          if (existingEnrollment.length === 0) {
            await db.insert(classEnrollments).values({
              classId: student.classId,
              learnerId: learnerId,
              status: "active",
            });

            logger.info("Enrolled learner in class", {
              learnerId,
              classId: student.classId,
            });
          }
        }
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

    // Email invitations are logged but not sent - email service integration pending
    const invitationsSent = 0;
    if (sendInvitations) {
      logger.info("Invitations requested for imported students", {
        count: createdLearners.length,
      });
    }

    const result: ImportResult = {
      jobId: crypto.randomUUID(),
      status: "completed",
      totalRows: parseResult.data.length,
      successfulRows: validStudents.length - (importErrors.length - rowErrors.length),
      failedRows: importErrors.length,
      errors: importErrors,
      createdLearners,
      invitationsSent,
    };

    logger.info("Teacher bulk import completed", {
      jobId: result.jobId,
      teacherId: session.user.id,
      totalRows: result.totalRows,
      successfulRows: result.successfulRows,
      failedRows: result.failedRows,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Teacher bulk import failed", { error });
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teacher/students/import - Download CSV template
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify teacher role
  const { isTeacher } = await verifyTeacher(session.user.id);
  if (!isTeacher) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
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
