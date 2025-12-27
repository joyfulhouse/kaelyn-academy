import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { users, learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, and, sql, isNull, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher";
}

// GET /api/teacher/classes - Get all classes for the current teacher
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    // Fetch classes where the current user is the teacher
    const teacherClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        gradeLevel: classes.gradeLevel,
        academicYear: classes.academicYear,
        isActive: classes.isActive,
        createdAt: classes.createdAt,
      })
      .from(classes)
      .where(
        and(
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      )
      .orderBy(desc(classes.createdAt));

    const classIds = teacherClasses.map((c) => c.id);

    // Batch query: Get all enrollments for all classes at once
    const allEnrollments = classIds.length > 0
      ? await db
          .select({
            classId: classEnrollments.classId,
            learnerId: classEnrollments.learnerId,
          })
          .from(classEnrollments)
          .where(
            and(
              inArray(classEnrollments.classId, classIds),
              eq(classEnrollments.status, "active")
            )
          )
      : [];

    // Group enrollments by classId
    const enrollmentsByClass = new Map<string, string[]>();
    for (const enrollment of allEnrollments) {
      const learners = enrollmentsByClass.get(enrollment.classId) || [];
      learners.push(enrollment.learnerId);
      enrollmentsByClass.set(enrollment.classId, learners);
    }

    // Get all unique learner IDs for progress query
    const allLearnerIds = [...new Set(allEnrollments.map((e) => e.learnerId))];

    // Batch query: Get progress for all learners at once
    const allProgressData = allLearnerIds.length > 0
      ? await db
          .select({
            learnerId: learnerSubjectProgress.learnerId,
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
          .where(inArray(learnerSubjectProgress.learnerId, allLearnerIds))
          .groupBy(learnerSubjectProgress.learnerId)
      : [];

    const progressByLearner = new Map(
      allProgressData.map((p) => [p.learnerId, { avgMastery: p.avgMastery, avgCompletion: p.avgCompletion }])
    );

    // Calculate class stats using in-memory data
    const classesWithStats = teacherClasses.map((cls) => {
      const learnerIds = enrollmentsByClass.get(cls.id) || [];
      const studentCount = learnerIds.length;

      let averageProgress = 0;
      let averageMastery = 0;

      if (studentCount > 0) {
        const progressValues = learnerIds
          .map((id) => progressByLearner.get(id))
          .filter(Boolean) as { avgMastery: number; avgCompletion: number }[];

        if (progressValues.length > 0) {
          averageMastery = Math.round(
            progressValues.reduce((acc, p) => acc + p.avgMastery, 0) / progressValues.length
          );
          averageProgress = Math.round(
            progressValues.reduce((acc, p) => acc + p.avgCompletion, 0) / progressValues.length
          );
        }
      }

      return {
        ...cls,
        studentCount,
        averageProgress,
        averageMastery,
      };
    });

    // Calculate total students across all classes
    const totalStudents = classesWithStats.reduce((acc, c) => acc + c.studentCount, 0);
    const overallProgress = classesWithStats.length > 0
      ? Math.round(classesWithStats.reduce((acc, c) => acc + c.averageProgress, 0) / classesWithStats.length)
      : 0;

    return NextResponse.json({
      classes: classesWithStats,
      summary: {
        totalClasses: classesWithStats.length,
        totalStudents,
        averageProgress: overallProgress,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// Schema for creating a class
const createClassSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  gradeLevel: z.number().int().min(0).max(12),
  academicYear: z.string().optional(),
  subjectIds: z.array(z.string().uuid()).optional(),
});

// POST /api/teacher/classes - Create a new class
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createClassSchema.parse(body);

    // Get the user's organization
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "User must belong to an organization to create classes" },
        { status: 400 }
      );
    }

    const [newClass] = await db
      .insert(classes)
      .values({
        organizationId: user.organizationId,
        teacherId: session.user.id,
        name: data.name,
        description: data.description,
        gradeLevel: data.gradeLevel,
        academicYear: data.academicYear,
        subjectIds: data.subjectIds,
      })
      .returning();

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
