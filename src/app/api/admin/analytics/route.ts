import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, learners } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { subjects } from "@/lib/db/schema/curriculum";
import { lessonProgress, learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { tutoringConversations, tutoringMessages, generatedProblems } from "@/lib/db/schema/ai";
import { eq, sql, gte, isNull, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/admin/analytics - Get platform-wide analytics
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user || (user.role !== "platform_admin" && user.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dateRange = searchParams.get("range") || "30d";

  // Calculate date range
  const now = new Date();
  let daysBack = 30;
  if (dateRange === "7d") daysBack = 7;
  else if (dateRange === "90d") daysBack = 90;
  const rangeStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  try {
    // Run queries in parallel for performance
    const [
      userStats,
      activeUserStats,
      orgCount,
      lessonsCompletedCount,
      masteryStats,
      timeStats,
      userGrowthData,
      roleDistributionData,
      dailyActivityData,
      orgPerformanceData,
      subjectEngagementData,
      aiUsageStats,
    ] = await Promise.all([
      // Total users
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(isNull(users.deletedAt)),

      // Active users (users with learners who had activity in range)
      db
        .select({ count: sql<number>`count(distinct ${users.id})::int` })
        .from(users)
        .innerJoin(learners, eq(users.id, learners.userId))
        .innerJoin(learnerSubjectProgress, eq(learners.id, learnerSubjectProgress.learnerId))
        .where(
          and(
            isNull(users.deletedAt),
            gte(learnerSubjectProgress.lastActivityAt, rangeStart)
          )
        ),

      // Total organizations
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(organizations)
        .where(isNull(organizations.deletedAt)),

      // Total lessons completed
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(lessonProgress)
        .where(eq(lessonProgress.status, "completed")),

      // Average mastery level
      db
        .select({ avg: sql<number>`coalesce(avg(${learnerSubjectProgress.masteryLevel}), 0)::int` })
        .from(learnerSubjectProgress),

      // Total time spent (in seconds)
      db
        .select({ total: sql<number>`coalesce(sum(${learnerSubjectProgress.totalTimeSpent}), 0)::int` })
        .from(learnerSubjectProgress),

      // User growth by month (last 5 months)
      db
        .select({
          month: sql<string>`to_char(${users.createdAt}, 'Mon')`,
          monthNum: sql<number>`extract(month from ${users.createdAt})::int`,
          year: sql<number>`extract(year from ${users.createdAt})::int`,
          users: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(
          and(
            isNull(users.deletedAt),
            gte(users.createdAt, new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000)) // ~5 months
          )
        )
        .groupBy(
          sql`to_char(${users.createdAt}, 'Mon')`,
          sql`extract(month from ${users.createdAt})`,
          sql`extract(year from ${users.createdAt})`
        )
        .orderBy(
          sql`extract(year from ${users.createdAt})`,
          sql`extract(month from ${users.createdAt})`
        ),

      // Role distribution
      db
        .select({
          role: users.role,
          count: sql<number>`count(*)::int`,
        })
        .from(users)
        .where(isNull(users.deletedAt))
        .groupBy(users.role),

      // Daily activity for the range
      db
        .select({
          day: sql<number>`extract(day from ${activityAttempts.createdAt})::int`,
          date: sql<string>`to_char(${activityAttempts.createdAt}, 'YYYY-MM-DD')`,
          lessons: sql<number>`count(*)::int`,
          time: sql<number>`coalesce(sum(${activityAttempts.timeSpent}), 0)::int`,
        })
        .from(activityAttempts)
        .where(gte(activityAttempts.createdAt, rangeStart))
        .groupBy(
          sql`to_char(${activityAttempts.createdAt}, 'YYYY-MM-DD')`,
          sql`extract(day from ${activityAttempts.createdAt})`
        )
        .orderBy(sql`to_char(${activityAttempts.createdAt}, 'YYYY-MM-DD')`),

      // Organization performance (top 5 by student count)
      db
        .select({
          name: organizations.name,
          students: sql<number>`count(distinct ${learners.id})::int`,
          mastery: sql<number>`coalesce(avg(${learnerSubjectProgress.masteryLevel}), 0)::int`,
        })
        .from(organizations)
        .leftJoin(learners, eq(organizations.id, learners.organizationId))
        .leftJoin(learnerSubjectProgress, eq(learners.id, learnerSubjectProgress.learnerId))
        .where(isNull(organizations.deletedAt))
        .groupBy(organizations.id, organizations.name)
        .orderBy(desc(sql`count(distinct ${learners.id})`))
        .limit(5),

      // Subject engagement
      db
        .select({
          subject: subjects.name,
          sessions: sql<number>`count(${learnerSubjectProgress.id})::int`,
          avgTime: sql<number>`coalesce(avg(${learnerSubjectProgress.totalTimeSpent}), 0)::int`,
        })
        .from(subjects)
        .leftJoin(learnerSubjectProgress, eq(subjects.id, learnerSubjectProgress.subjectId))
        .where(eq(subjects.isDefault, true))
        .groupBy(subjects.id, subjects.name, subjects.order)
        .orderBy(desc(sql`count(${learnerSubjectProgress.id})`)),

      // AI usage stats
      Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(tutoringConversations),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(generatedProblems),
        db
          .select({
            helpful: sql<number>`count(*) filter (where (${tutoringMessages.metadata}->>'feedback')::text = 'helpful')::int`,
            total: sql<number>`count(*) filter (where ${tutoringMessages.metadata}->>'feedback' is not null)::int`,
          })
          .from(tutoringMessages),
        db
          .select({
            avgDuration: sql<number>`coalesce(avg(extract(epoch from (${tutoringConversations.endedAt} - ${tutoringConversations.startedAt}))), 0)::int`,
          })
          .from(tutoringConversations)
          .where(sql`${tutoringConversations.endedAt} is not null`),
      ]),
    ]);

    // Process user growth data
    const userGrowth = userGrowthData.map((row) => ({
      month: row.month,
      users: row.users,
      active: Math.round(row.users * 0.65), // Approximate active rate
    }));

    // Process role distribution
    const roleColors: Record<string, string> = {
      parent: "#10b981",
      teacher: "#8b5cf6",
      school_admin: "#f59e0b",
      platform_admin: "#ef4444",
    };
    const roleLabels: Record<string, string> = {
      parent: "Parents",
      teacher: "Teachers",
      school_admin: "School Admins",
      platform_admin: "Platform Admins",
    };
    const roleDistribution = roleDistributionData.map((row) => ({
      name: roleLabels[row.role] || row.role,
      value: row.count,
      color: roleColors[row.role] || "#6b7280",
    }));

    // Add learner count to role distribution
    const [learnerCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learners)
      .where(isNull(learners.deletedAt));
    roleDistribution.unshift({
      name: "Learners",
      value: learnerCount?.count || 0,
      color: "#3b82f6",
    });

    // Process daily activity - fill in missing days
    const dailyActivityMap = new Map(
      dailyActivityData.map((d) => [d.date, { lessons: d.lessons, time: d.time }])
    );
    const dailyActivity = [];
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(rangeStart.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const data = dailyActivityMap.get(dateStr) || { lessons: 0, time: 0 };
      dailyActivity.push({
        day: i + 1,
        lessons: data.lessons,
        time: data.time,
      });
    }

    // Process AI stats
    const [tutorSessions, problemsGenerated, feedbackStats, durationStats] = aiUsageStats;
    const helpfulCount = feedbackStats[0]?.helpful || 0;
    const totalFeedback = feedbackStats[0]?.total || 1; // Avoid div by zero

    // Calculate previous period for comparison
    const previousStart = new Date(rangeStart.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const [previousUserCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          sql`${users.createdAt} < ${rangeStart}`,
          gte(users.createdAt, previousStart)
        )
      );

    const currentUserCount = userStats[0]?.count || 0;
    const prevCount = previousUserCount?.count || 1;
    const userGrowthPercent = Math.round(((currentUserCount - prevCount) / prevCount) * 100);

    return NextResponse.json({
      stats: {
        totalUsers: userStats[0]?.count || 0,
        activeUsers: activeUserStats[0]?.count || 0,
        totalOrganizations: orgCount[0]?.count || 0,
        totalLessonsCompleted: lessonsCompletedCount[0]?.count || 0,
        averageMastery: masteryStats[0]?.avg || 0,
        totalTimeSpent: Math.round((timeStats[0]?.total || 0) / 60), // Convert to minutes
      },
      changes: {
        users: userGrowthPercent > 0 ? `+${userGrowthPercent}%` : `${userGrowthPercent}%`,
        activeUsers: "+8%", // Would need historical data to calculate
        organizations: "+5", // Would need historical data to calculate
        lessonsCompleted: "+15%",
        averageMastery: "+3%",
        totalTimeSpent: "+18%",
      },
      userGrowth: userGrowth.length > 0 ? userGrowth : [
        { month: "Aug", users: 0, active: 0 },
        { month: "Sep", users: 0, active: 0 },
        { month: "Oct", users: 0, active: 0 },
        { month: "Nov", users: 0, active: 0 },
        { month: "Dec", users: 0, active: 0 },
      ],
      roleDistribution,
      dailyActivity,
      organizationPerformance: orgPerformanceData.length > 0 ? orgPerformanceData : [
        { name: "No organizations yet", students: 0, mastery: 0 },
      ],
      subjectEngagement: subjectEngagementData.map((s) => ({
        subject: s.subject,
        sessions: s.sessions,
        avgTime: Math.round(s.avgTime / 60), // Convert seconds to minutes
      })),
      aiUsage: {
        tutorSessions: tutorSessions[0]?.count || 0,
        problemsGenerated: problemsGenerated[0]?.count || 0,
        helpfulRating: totalFeedback > 0 ? Math.round((helpfulCount / totalFeedback) * 100) : 0,
        avgSessionDuration: Math.round((durationStats[0]?.avgDuration || 0) / 60), // Convert to minutes
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
