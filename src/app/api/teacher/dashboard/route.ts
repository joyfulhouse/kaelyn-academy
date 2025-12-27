import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, and, sql, isNull, lt, gte } from "drizzle-orm";
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

    // Calculate class stats
    const classesWithStats = await Promise.all(
      teacherClasses.map(async (cls) => {
        const classStudents = enrolledStudents.filter((e) => e.classId === cls.id);
        const studentCount = classStudents.length;

        let averageProgress = 0;
        let averageMastery = 0;

        if (studentCount > 0) {
          const studentIds = classStudents.map((s) => s.learnerId);
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
            .where(sql`${learnerSubjectProgress.learnerId} = ANY(${studentIds})`);

          averageMastery = progressData[0]?.avgMastery || 0;
          averageProgress = progressData[0]?.avgCompletion || 0;
        }

        return {
          id: cls.id,
          name: cls.name,
          gradeLevel: cls.gradeLevel,
          studentCount,
          averageProgress,
          averageMastery,
        };
      })
    );

    // Generate alerts for students who need attention
    const alerts: StudentAlert[] = [];
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    for (const student of enrolledStudents) {
      // Check for struggling students (mastery < 50%)
      const progress = await db
        .select({
          subjectName: subjects.name,
          masteryLevel: learnerSubjectProgress.masteryLevel,
        })
        .from(learnerSubjectProgress)
        .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
        .where(
          and(
            eq(learnerSubjectProgress.learnerId, student.learnerId),
            lt(learnerSubjectProgress.masteryLevel, 50)
          )
        );

      for (const p of progress) {
        if (p.masteryLevel !== null) {
          alerts.push({
            id: `struggling-${student.learnerId}-${p.subjectName}`,
            studentName: student.learnerName,
            type: "struggling",
            subject: p.subjectName,
            message: `Below 50% mastery in ${p.subjectName.toLowerCase()}`,
            learnerId: student.learnerId,
          });
        }
      }

      // Check for inactive students (no activity in 5 days)
      const recentActivity = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(activityAttempts)
        .where(
          and(
            eq(activityAttempts.learnerId, student.learnerId),
            gte(activityAttempts.createdAt, fiveDaysAgo)
          )
        );

      if (recentActivity[0]?.count === 0) {
        alerts.push({
          id: `inactive-${student.learnerId}`,
          studentName: student.learnerName,
          type: "inactive",
          subject: "All",
          message: "No activity in the last 5 days",
          learnerId: student.learnerId,
        });
      }

      // Check for excelling students (mastery > 90%)
      const excellingProgress = await db
        .select({
          subjectName: subjects.name,
          masteryLevel: learnerSubjectProgress.masteryLevel,
        })
        .from(learnerSubjectProgress)
        .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
        .where(
          and(
            eq(learnerSubjectProgress.learnerId, student.learnerId),
            gte(learnerSubjectProgress.masteryLevel, 90)
          )
        );

      for (const p of excellingProgress) {
        if (p.masteryLevel !== null) {
          alerts.push({
            id: `excelling-${student.learnerId}-${p.subjectName}`,
            studentName: student.learnerName,
            type: "excelling",
            subject: p.subjectName,
            message: `Excellent mastery (${Math.round(p.masteryLevel)}%) in ${p.subjectName.toLowerCase()}`,
            learnerId: student.learnerId,
          });
        }
      }
    }

    // Calculate subject distribution
    const subjectData = await db
      .select({
        subjectName: subjects.name,
        totalTime: sql<number>`sum(${learnerSubjectProgress.totalTimeSpent})::int`,
      })
      .from(learnerSubjectProgress)
      .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
      .where(sql`${learnerSubjectProgress.learnerId} = ANY(${learnerIds.length > 0 ? learnerIds : [""]})`)
      .groupBy(subjects.name);

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
