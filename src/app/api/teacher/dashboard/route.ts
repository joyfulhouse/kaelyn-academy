import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { users, learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, and, sql, isNull, lt, gte, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface StudentAlert {
  id: string;
  studentName: string;
  type: "struggling" | "inactive" | "excelling";
  subject: string;
  message: string;
  learnerId: string;
}

// GET /api/teacher/dashboard - Get dashboard summary data
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is a teacher
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    // Fetch teacher's classes
    const teacherClasses = await db
      .select({
        id: classes.id,
        name: classes.name,
        gradeLevel: classes.gradeLevel,
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
        classes: [],
        alerts: [],
        summary: {
          totalStudents: 0,
          totalClasses: 0,
          averageProgress: 0,
          needAttention: 0,
        },
        subjectDistribution: [],
      });
    }

    const classIds = teacherClasses.map((c) => c.id);

    // Get all enrolled students
    const enrolledStudents = await db
      .select({
        learnerId: classEnrollments.learnerId,
        classId: classEnrollments.classId,
        learnerName: learners.name,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          sql`${classEnrollments.classId} = ANY(${classIds})`,
          eq(classEnrollments.status, "active")
        )
      );

    const learnerIds = [...new Set(enrolledStudents.map((e) => e.learnerId))];
    const totalStudents = learnerIds.length;

    // Build learner name map for alert generation
    const learnerNameMap = new Map(
      enrolledStudents.map((e) => [e.learnerId, e.learnerName])
    );

    // Batch query: Get all progress data for all learners at once
    const allProgressData = learnerIds.length > 0
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
          .where(inArray(learnerSubjectProgress.learnerId, learnerIds))
          .groupBy(learnerSubjectProgress.learnerId)
      : [];

    // Create a map of learnerId -> progress stats
    const progressByLearner = new Map(
      allProgressData.map((p) => [p.learnerId, { avgMastery: p.avgMastery, avgCompletion: p.avgCompletion }])
    );

    // Calculate class stats using in-memory data
    const classesWithStats = teacherClasses.map((cls) => {
      const classStudents = enrolledStudents.filter((e) => e.classId === cls.id);
      const studentCount = classStudents.length;

      let averageProgress = 0;
      let averageMastery = 0;

      if (studentCount > 0) {
        const progressValues = classStudents
          .map((s) => progressByLearner.get(s.learnerId))
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
        id: cls.id,
        name: cls.name,
        gradeLevel: cls.gradeLevel,
        studentCount,
        averageProgress,
        averageMastery,
      };
    });

    // Generate alerts using batch queries instead of per-student queries
    const alerts: StudentAlert[] = [];
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    if (learnerIds.length > 0) {
      // Batch query: Get all struggling students (mastery < 50%)
      const strugglingProgress = await db
        .select({
          learnerId: learnerSubjectProgress.learnerId,
          subjectName: subjects.name,
          masteryLevel: learnerSubjectProgress.masteryLevel,
        })
        .from(learnerSubjectProgress)
        .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
        .where(
          and(
            inArray(learnerSubjectProgress.learnerId, learnerIds),
            lt(learnerSubjectProgress.masteryLevel, 50)
          )
        );

      for (const p of strugglingProgress) {
        if (p.masteryLevel !== null) {
          const studentName = learnerNameMap.get(p.learnerId) || "Unknown";
          alerts.push({
            id: `struggling-${p.learnerId}-${p.subjectName}`,
            studentName,
            type: "struggling",
            subject: p.subjectName,
            message: `Below 50% mastery in ${p.subjectName.toLowerCase()}`,
            learnerId: p.learnerId,
          });
        }
      }

      // Batch query: Get recent activity counts for all learners
      const activityCounts = await db
        .select({
          learnerId: activityAttempts.learnerId,
          count: sql<number>`count(*)::int`,
        })
        .from(activityAttempts)
        .where(
          and(
            inArray(activityAttempts.learnerId, learnerIds),
            gte(activityAttempts.createdAt, fiveDaysAgo)
          )
        )
        .groupBy(activityAttempts.learnerId);

      const activityByLearner = new Map(
        activityCounts.map((a) => [a.learnerId, a.count])
      );

      // Find inactive students (those with no recent activity)
      for (const learnerId of learnerIds) {
        if (!activityByLearner.has(learnerId) || activityByLearner.get(learnerId) === 0) {
          const studentName = learnerNameMap.get(learnerId) || "Unknown";
          alerts.push({
            id: `inactive-${learnerId}`,
            studentName,
            type: "inactive",
            subject: "All",
            message: "No activity in the last 5 days",
            learnerId,
          });
        }
      }

      // Batch query: Get all excelling students (mastery >= 90%)
      const excellingProgress = await db
        .select({
          learnerId: learnerSubjectProgress.learnerId,
          subjectName: subjects.name,
          masteryLevel: learnerSubjectProgress.masteryLevel,
        })
        .from(learnerSubjectProgress)
        .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
        .where(
          and(
            inArray(learnerSubjectProgress.learnerId, learnerIds),
            gte(learnerSubjectProgress.masteryLevel, 90)
          )
        );

      for (const p of excellingProgress) {
        if (p.masteryLevel !== null) {
          const studentName = learnerNameMap.get(p.learnerId) || "Unknown";
          alerts.push({
            id: `excelling-${p.learnerId}-${p.subjectName}`,
            studentName,
            type: "excelling",
            subject: p.subjectName,
            message: `Excellent mastery (${Math.round(p.masteryLevel)}%) in ${p.subjectName.toLowerCase()}`,
            learnerId: p.learnerId,
          });
        }
      }
    }

    // Calculate subject distribution
    const subjectData = learnerIds.length > 0
      ? await db
          .select({
            subjectName: subjects.name,
            totalTime: sql<number>`sum(${learnerSubjectProgress.totalTimeSpent})::int`,
          })
          .from(learnerSubjectProgress)
          .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
          .where(inArray(learnerSubjectProgress.learnerId, learnerIds))
          .groupBy(subjects.name)
      : [];

    const totalTime = subjectData.reduce((acc, s) => acc + (s.totalTime || 0), 0);
    const subjectDistribution = subjectData.map((s, index) => {
      const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];
      return {
        name: s.subjectName,
        value: totalTime > 0 ? Math.round(((s.totalTime || 0) / totalTime) * 100) : 0,
        color: colors[index % colors.length],
      };
    });

    const overallProgress = classesWithStats.length > 0
      ? Math.round(classesWithStats.reduce((acc, c) => acc + c.averageProgress, 0) / classesWithStats.length)
      : 0;

    return NextResponse.json({
      classes: classesWithStats,
      alerts: alerts.slice(0, 10), // Limit to 10 alerts
      summary: {
        totalStudents,
        totalClasses: teacherClasses.length,
        averageProgress: overallProgress,
        needAttention: alerts.filter((a) => a.type === "struggling").length,
      },
      subjectDistribution,
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
