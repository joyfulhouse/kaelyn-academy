import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { grades, gradeHistory, classes } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull, desc } from "drizzle-orm";
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

// GET /api/teacher/grades/history - Get grade history for a specific grade
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidSchema = z.string().uuid();
    const validatedGradeId = uuidSchema.parse(gradeId);

    // Verify ownership via class
    const [gradeData] = await db
      .select({
        grade: grades,
        class: classes,
      })
      .from(grades)
      .innerJoin(classes, eq(grades.classId, classes.id))
      .where(
        and(
          eq(grades.id, validatedGradeId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!gradeData) {
      return NextResponse.json(
        { error: "Grade not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get all history entries for this grade
    const history = await db
      .select({
        id: gradeHistory.id,
        gradeId: gradeHistory.gradeId,
        changedBy: gradeHistory.changedBy,
        changedByName: users.name,
        previousPointsEarned: gradeHistory.previousPointsEarned,
        previousLetterGrade: gradeHistory.previousLetterGrade,
        previousFeedback: gradeHistory.previousFeedback,
        newPointsEarned: gradeHistory.newPointsEarned,
        newLetterGrade: gradeHistory.newLetterGrade,
        newFeedback: gradeHistory.newFeedback,
        changeReason: gradeHistory.changeReason,
        changedAt: gradeHistory.changedAt,
      })
      .from(gradeHistory)
      .innerJoin(users, eq(gradeHistory.changedBy, users.id))
      .where(eq(gradeHistory.gradeId, validatedGradeId))
      .orderBy(desc(gradeHistory.changedAt));

    return NextResponse.json({
      grade: {
        id: gradeData.grade.id,
        name: gradeData.grade.name,
        category: gradeData.grade.category,
        pointsEarned: gradeData.grade.pointsEarned,
        pointsPossible: gradeData.grade.pointsPossible,
        letterGrade: gradeData.grade.letterGrade,
      },
      history,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid grade ID format" },
        { status: 400 }
      );
    }
    console.error("Error fetching grade history:", error);
    return NextResponse.json(
      { error: "Failed to fetch grade history" },
      { status: 500 }
    );
  }
}
