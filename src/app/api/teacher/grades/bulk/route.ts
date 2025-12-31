import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  grades,
  gradeHistory,
  classes,
  classEnrollments,
} from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher" || user?.role === "admin";
}

// Letter grade conversion
function calculateLetterGrade(percentage: number | null): string | null {
  if (percentage === null) return null;
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
}

// Schema for bulk grade updates (spreadsheet cell edits)
const bulkUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid(),
      pointsEarned: z.number().min(0).nullable(),
      feedback: z.string().max(5000).optional(),
    })
  ),
  changeReason: z.string().max(500).optional(),
});

// Schema for bulk grade creation (creating grades for all students for an assignment)
const bulkCreateSchema = z.object({
  classId: z.string().uuid(),
  category: z.string().max(50).default("assignment"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  pointsPossible: z.number().min(0).default(100),
  weight: z.number().min(0).default(1.0),
  dueDate: z.string().datetime().optional(),
  assignmentId: z.string().uuid().optional(),
  // Optional: initial grades for specific students
  initialGrades: z
    .array(
      z.object({
        learnerId: z.string().uuid(),
        pointsEarned: z.number().min(0).nullable(),
        feedback: z.string().max(5000).optional(),
      })
    )
    .optional(),
});

// PATCH /api/teacher/grades/bulk - Bulk update existing grades
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = bulkUpdateSchema.parse(body);

    if (data.updates.length === 0) {
      return NextResponse.json({ updated: 0, grades: [] });
    }

    const gradeIds = data.updates.map((u) => u.id);

    // Verify all grades belong to classes owned by this teacher
    const existingGrades = await db
      .select({
        grade: grades,
        class: classes,
      })
      .from(grades)
      .innerJoin(classes, eq(grades.classId, classes.id))
      .where(
        and(
          inArray(grades.id, gradeIds),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    const existingGradeMap = new Map(
      existingGrades.map((g) => [g.grade.id, g.grade])
    );

    // Only update grades that exist and belong to this teacher
    const validUpdates = data.updates.filter((u) =>
      existingGradeMap.has(u.id)
    );

    if (validUpdates.length === 0) {
      return NextResponse.json(
        { error: "No valid grades to update" },
        { status: 400 }
      );
    }

    const updatedGrades: (typeof grades.$inferSelect)[] = [];

    // Process each update
    for (const update of validUpdates) {
      const existingGrade = existingGradeMap.get(update.id);
      if (!existingGrade) continue;

      const pointsPossible = existingGrade.pointsPossible ?? 100;

      // Calculate new percentage and letter grade
      let percentage: number | null = null;
      let letterGrade: string | null = null;
      if (update.pointsEarned !== null) {
        percentage =
          pointsPossible > 0
            ? Math.round((update.pointsEarned / pointsPossible) * 100 * 100) /
              100
            : 0;
        letterGrade = calculateLetterGrade(percentage);
      }

      // Record history if points or feedback changed
      const hasPointsChanged =
        update.pointsEarned !== existingGrade.pointsEarned;
      const hasFeedbackChanged =
        update.feedback !== undefined &&
        update.feedback !== existingGrade.feedback;

      if (hasPointsChanged || hasFeedbackChanged) {
        await db.insert(gradeHistory).values({
          gradeId: update.id,
          changedBy: session.user.id,
          previousPointsEarned: existingGrade.pointsEarned,
          previousLetterGrade: existingGrade.letterGrade,
          previousFeedback: existingGrade.feedback,
          newPointsEarned: update.pointsEarned,
          newLetterGrade: letterGrade,
          newFeedback: update.feedback ?? existingGrade.feedback,
          changeReason: data.changeReason,
        });
      }

      // Update the grade
      const [updatedGrade] = await db
        .update(grades)
        .set({
          pointsEarned: update.pointsEarned,
          percentage,
          letterGrade,
          feedback: update.feedback ?? existingGrade.feedback,
          gradedAt:
            update.pointsEarned !== null ? new Date() : existingGrade.gradedAt,
          updatedAt: new Date(),
        })
        .where(eq(grades.id, update.id))
        .returning();

      updatedGrades.push(updatedGrade);
    }

    return NextResponse.json({
      updated: updatedGrades.length,
      grades: updatedGrades,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error bulk updating grades:", error);
    return NextResponse.json(
      { error: "Failed to bulk update grades" },
      { status: 500 }
    );
  }
}

// POST /api/teacher/grades/bulk - Create grades for all students in a class
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = bulkCreateSchema.parse(body);

    // Verify teacher owns this class
    const [cls] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, data.classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get all active enrollments for this class
    const enrollments = await db
      .select({
        learnerId: classEnrollments.learnerId,
      })
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, data.classId),
          eq(classEnrollments.status, "active")
        )
      );

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "No students enrolled in this class" },
        { status: 400 }
      );
    }

    // Create a map of initial grades if provided
    const initialGradesMap = new Map(
      (data.initialGrades ?? []).map((g) => [g.learnerId, g])
    );

    // Create grade entries for all enrolled students
    const gradesToCreate = enrollments.map((enrollment) => {
      const initialGrade = initialGradesMap.get(enrollment.learnerId);
      const pointsEarned = initialGrade?.pointsEarned ?? null;

      let percentage: number | null = null;
      let letterGrade: string | null = null;
      if (pointsEarned !== null) {
        percentage =
          data.pointsPossible > 0
            ? Math.round((pointsEarned / data.pointsPossible) * 100 * 100) / 100
            : 0;
        letterGrade = calculateLetterGrade(percentage);
      }

      return {
        classId: data.classId,
        learnerId: enrollment.learnerId,
        teacherId: session.user.id,
        category: data.category,
        name: data.name,
        description: data.description,
        pointsEarned,
        pointsPossible: data.pointsPossible,
        percentage,
        letterGrade,
        weight: data.weight,
        feedback: initialGrade?.feedback,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignmentId: data.assignmentId,
      };
    });

    const createdGrades = await db
      .insert(grades)
      .values(gradesToCreate)
      .returning();

    return NextResponse.json(
      {
        created: createdGrades.length,
        grades: createdGrades,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error bulk creating grades:", error);
    return NextResponse.json(
      { error: "Failed to bulk create grades" },
      { status: 500 }
    );
  }
}
