import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { learners, users } from "@/lib/db/schema/users";
import { learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { eq, and, sql, isNull, gte, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher";
}

// GET /api/teacher/students - Get all students across teacher's classes
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    // Get all teacher's classes
    const teacherClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
      })
      .from(classes)
      .where(
        and(
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (teacherClasses.length === 0) {
      return NextResponse.json({
        students: [],
        classes: [],
        summary: {
          total: 0,
          excelling: 0,
          struggling: 0,
          avgProgress: 0,
        },
      });
    }

    const classIds = teacherClasses.map((c) => c.id);
    const classMap = Object.fromEntries(teacherClasses.map((c) => [c.id, c.name]));

    // Get all enrolled students with their class info
    const enrolledStudents = await db
      .select({
        learnerId: classEnrollments.learnerId,
        classId: classEnrollments.classId,
        learnerName: learners.name,
        avatarUrl: learners.avatarUrl,
        gradeLevel: learners.gradeLevel,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          inArray(classEnrollments.classId, classIds),
          eq(classEnrollments.status, "active")
        )
      );

    // Get unique learner IDs for batch queries
    const learnerIds = [...new Set(enrolledStudents.map((s) => s.learnerId))];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Batch query: Get all progress data for all learners at once
    const allProgressData = learnerIds.length > 0
      ? await db
          .select({
            learnerId: learnerSubjectProgress.learnerId,
            avgMastery: sql<number>`coalesce(avg(${learnerSubjectProgress.masteryLevel}), 0)::int`,
            avgProgress: sql<number>`coalesce(avg(
              case
                when ${learnerSubjectProgress.totalLessons} > 0
                then (${learnerSubjectProgress.completedLessons}::float / ${learnerSubjectProgress.totalLessons}) * 100
                else 0
              end
            ), 0)::int`,
            currentStreak: sql<number>`coalesce(max(${learnerSubjectProgress.currentStreak}), 0)::int`,
            lastActivity: sql<string>`max(${learnerSubjectProgress.lastActivityAt})`,
          })
          .from(learnerSubjectProgress)
          .where(inArray(learnerSubjectProgress.learnerId, learnerIds))
          .groupBy(learnerSubjectProgress.learnerId)
      : [];

    const progressByLearner = new Map(
      allProgressData.map((p) => [p.learnerId, p])
    );

    // Batch query: Get recent activity counts (last 7 days) for all learners
    const recentActivityCounts = learnerIds.length > 0
      ? await db
          .select({
            learnerId: activityAttempts.learnerId,
            count: sql<number>`count(*)::int`,
          })
          .from(activityAttempts)
          .where(
            and(
              inArray(activityAttempts.learnerId, learnerIds),
              gte(activityAttempts.createdAt, sevenDaysAgo)
            )
          )
          .groupBy(activityAttempts.learnerId)
      : [];

    const recentActivityByLearner = new Map(
      recentActivityCounts.map((a) => [a.learnerId, a.count])
    );

    // Batch query: Get previous activity counts (7-14 days ago) for all learners
    const previousActivityCounts = learnerIds.length > 0
      ? await db
          .select({
            learnerId: activityAttempts.learnerId,
            count: sql<number>`count(*)::int`,
          })
          .from(activityAttempts)
          .where(
            and(
              inArray(activityAttempts.learnerId, learnerIds),
              gte(activityAttempts.createdAt, fourteenDaysAgo),
              sql`${activityAttempts.createdAt} < ${sevenDaysAgo}`
            )
          )
          .groupBy(activityAttempts.learnerId)
      : [];

    const previousActivityByLearner = new Map(
      previousActivityCounts.map((a) => [a.learnerId, a.count])
    );

    // Map student data using in-memory lookups
    const studentsWithDetails = enrolledStudents.map((student) => {
      const progressData = progressByLearner.get(student.learnerId);
      const recentCount = recentActivityByLearner.get(student.learnerId) || 0;
      const previousCount = previousActivityByLearner.get(student.learnerId) || 0;

      // Calculate trend
      let trend: "up" | "down" | "stable" = "stable";
      if (recentCount > previousCount * 1.2) trend = "up";
      else if (recentCount < previousCount * 0.8) trend = "down";

      const mastery = progressData?.avgMastery || 0;
      const progress = progressData?.avgProgress || 0;
      const streak = progressData?.currentStreak || 0;
      const lastActivityAt = progressData?.lastActivity;

      // Determine status
      let status: "excelling" | "on-track" | "needs-attention" | "struggling" = "on-track";
      if (mastery >= 85) status = "excelling";
      else if (mastery < 50) status = "struggling";
      else if (mastery < 65 || streak === 0) status = "needs-attention";

      return {
        id: student.learnerId,
        name: student.learnerName,
        avatarUrl: student.avatarUrl,
        gradeLevel: student.gradeLevel,
        classId: student.classId,
        className: classMap[student.classId] || "Unknown",
        progress,
        mastery,
        streak,
        trend,
        status,
        lastActive: lastActivityAt ? new Date(lastActivityAt).toISOString() : null,
      };
    });

    // Remove duplicates (student in multiple classes)
    const uniqueStudents = Array.from(
      new Map(studentsWithDetails.map((s) => [s.id, s])).values()
    );

    // Calculate summary
    const summary = {
      total: uniqueStudents.length,
      excelling: uniqueStudents.filter((s) => s.status === "excelling").length,
      struggling: uniqueStudents.filter((s) => s.status === "struggling" || s.status === "needs-attention").length,
      avgProgress: uniqueStudents.length > 0
        ? Math.round(uniqueStudents.reduce((acc, s) => acc + s.progress, 0) / uniqueStudents.length)
        : 0,
    };

    return NextResponse.json({
      students: studentsWithDetails,
      classes: teacherClasses,
      summary,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
