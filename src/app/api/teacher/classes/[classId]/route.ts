import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { users, learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, and, sql, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ classId: string }>;
}

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher";
}

// GET /api/teacher/classes/[classId] - Get a single class with details
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  const { classId } = await context.params;

  try {
    // Verify teacher owns this class
    const [cls] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get enrolled students with their progress
    const enrolledStudents = await db
      .select({
        learnerId: classEnrollments.learnerId,
        learnerName: learners.name,
        learnerGrade: learners.gradeLevel,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.status, "active")
        )
      );

    // Get progress for each student
    const studentsWithProgress = await Promise.all(
      enrolledStudents.map(async (student) => {
        const progressData = await db
          .select({
            avgMastery: sql<number>`coalesce(avg(${learnerSubjectProgress.masteryLevel}), 0)::int`,
            avgCompletion: sql<number>`coalesce(avg(
              case
                when ${learnerSubjectProgress.totalLessons} > 0
                then (${learnerSubjectProgress.completedLessons}::float / ${learnerSubjectProgress.totalLessons}) * 100
                else 0
              end
            ), 0)::int`,
          })
          .from(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, student.learnerId));

        return {
          id: student.learnerId,
          name: student.learnerName,
          gradeLevel: student.learnerGrade,
          enrolledAt: student.enrolledAt,
          averageMastery: progressData[0]?.avgMastery || 0,
          averageProgress: progressData[0]?.avgCompletion || 0,
        };
      })
    );

    // Calculate class averages
    const avgProgress = studentsWithProgress.length > 0
      ? Math.round(studentsWithProgress.reduce((acc, s) => acc + s.averageProgress, 0) / studentsWithProgress.length)
      : 0;
    const avgMastery = studentsWithProgress.length > 0
      ? Math.round(studentsWithProgress.reduce((acc, s) => acc + s.averageMastery, 0) / studentsWithProgress.length)
      : 0;

    return NextResponse.json({
      class: {
        ...cls,
        studentCount: studentsWithProgress.length,
        averageProgress: avgProgress,
        averageMastery: avgMastery,
      },
      students: studentsWithProgress,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// Schema for updating a class
const updateClassSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  gradeLevel: z.number().int().min(0).max(12).optional(),
  academicYear: z.string().optional(),
  subjectIds: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/teacher/classes/[classId] - Update a class
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  const { classId } = await context.params;

  try {
    // Verify teacher owns this class
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = updateClassSchema.parse(body);

    const [updatedClass] = await db
      .update(classes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, classId))
      .returning();

    return NextResponse.json({ class: updatedClass });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/classes/[classId] - Soft delete (archive) a class
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  const { classId } = await context.params;

  try {
    // Verify teacher owns this class
    const [existingClass] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Soft delete the class
    await db
      .update(classes)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, classId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving class:", error);
    return NextResponse.json(
      { error: "Failed to archive class" },
      { status: 500 }
    );
  }
}
