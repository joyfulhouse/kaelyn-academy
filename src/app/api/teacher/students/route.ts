import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { eq, and, sql, isNull, desc, gte, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/teacher/students - Get all students across teacher's classes
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get progress and activity data for each student
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const studentsWithDetails = await Promise.all(
      enrolledStudents.map(async (student) => {
        // Get overall progress
        const progressData = await db
          .select({
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
          .where(eq(learnerSubjectProgress.learnerId, student.learnerId));

        // Get activity count for trend calculation (last 7 days vs previous 7 days)
        const recentActivityCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(activityAttempts)
          .where(
            and(
              eq(activityAttempts.learnerId, student.learnerId),
              gte(activityAttempts.createdAt, sevenDaysAgo)
            )
          );

        const previousActivityCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(activityAttempts)
          .where(
            and(
              eq(activityAttempts.learnerId, student.learnerId),
              gte(activityAttempts.createdAt, fourteenDaysAgo),
              sql`${activityAttempts.createdAt} < ${sevenDaysAgo}`
            )
          );

        const recentCount = recentActivityCount[0]?.count || 0;
        const previousCount = previousActivityCount[0]?.count || 0;

        // Calculate trend
        let trend: "up" | "down" | "stable" = "stable";
        if (recentCount > previousCount * 1.2) trend = "up";
        else if (recentCount < previousCount * 0.8) trend = "down";

        const mastery = progressData[0]?.avgMastery || 0;
        const progress = progressData[0]?.avgProgress || 0;
        const streak = progressData[0]?.currentStreak || 0;
        const lastActivityAt = progressData[0]?.lastActivity;

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
      })
    );

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
