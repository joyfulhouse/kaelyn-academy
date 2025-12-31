import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Target,
  Trophy,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import {
  activityAttempts,
  learnerAchievements,
  achievements,
} from "@/lib/db/schema/progress";
import { activities, lessons, units, subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc, sql } from "drizzle-orm";

interface ActivityItem {
  id: string;
  type: "activity" | "lesson" | "achievement";
  title: string;
  subjectName: string;
  subjectColor: string | null;
  score?: number;
  maxScore?: number;
  passed?: boolean;
  timeSpent?: number;
  completedAt: Date;
  details?: {
    attemptNumber?: number;
    questionsCorrect?: number;
    totalQuestions?: number;
  };
}

interface ChildInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
  gradeLevel: number;
  slug: string;
}

interface ActivityData {
  child: ChildInfo;
  activities: ActivityItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalActivities: number;
    totalTimeSpent: number;
    avgScore: number;
    passRate: number;
  };
}

async function getActivityData(
  slug: string,
  parentUserId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ActivityData | null> {
  // Find the learner by slug
  const learnerResult = await db
    .select({
      learnerId: learners.id,
      learnerName: learners.name,
      avatarUrl: learners.avatarUrl,
      gradeLevel: learners.gradeLevel,
    })
    .from(learners)
    .where(
      and(
        eq(learners.userId, parentUserId),
        isNull(learners.deletedAt),
        sql`lower(replace(${learners.name}, ' ', '-')) = ${slug.toLowerCase()}`
      )
    )
    .limit(1);

  if (learnerResult.length === 0) {
    return null;
  }

  const learner = learnerResult[0];
  const offset = (page - 1) * pageSize;

  // Get activity attempts with full details
  const activityData = await db
    .select({
      id: activityAttempts.id,
      activityTitle: activities.title,
      activityType: activities.type,
      score: activityAttempts.score,
      maxScore: activityAttempts.maxScore,
      passed: activityAttempts.passed,
      timeSpent: activityAttempts.timeSpent,
      completedAt: activityAttempts.completedAt,
      attemptNumber: activityAttempts.attemptNumber,
      answers: activityAttempts.answers,
      subjectName: subjects.name,
      subjectColor: subjects.color,
    })
    .from(activityAttempts)
    .innerJoin(activities, eq(activityAttempts.activityId, activities.id))
    .innerJoin(lessons, eq(activities.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(subjects, eq(units.subjectId, subjects.id))
    .where(eq(activityAttempts.learnerId, learner.learnerId))
    .orderBy(desc(activityAttempts.completedAt))
    .limit(pageSize)
    .offset(offset);

  // Get total count for pagination
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activityAttempts)
    .where(eq(activityAttempts.learnerId, learner.learnerId));

  // Get achievements for timeline
  const achievementData = await db
    .select({
      id: learnerAchievements.id,
      achievementName: achievements.name,
      achievementType: achievements.type,
      earnedAt: learnerAchievements.earnedAt,
    })
    .from(learnerAchievements)
    .innerJoin(achievements, eq(learnerAchievements.achievementId, achievements.id))
    .where(eq(learnerAchievements.learnerId, learner.learnerId))
    .orderBy(desc(learnerAchievements.earnedAt))
    .limit(10);

  // Combine and sort activities
  const allActivities: ActivityItem[] = [
    ...activityData.map((a) => {
      const answers = a.answers as Array<{ correct: boolean }> | null;
      const correctAnswers = answers?.filter((ans) => ans.correct).length ?? 0;
      const totalAnswers = answers?.length ?? 0;

      return {
        id: a.id,
        type: "activity" as const,
        title: a.activityTitle,
        subjectName: a.subjectName,
        subjectColor: a.subjectColor,
        score: a.score !== null ? Math.round(a.score) : undefined,
        maxScore: a.maxScore !== null ? Math.round(a.maxScore) : undefined,
        passed: a.passed ?? undefined,
        timeSpent: a.timeSpent ?? undefined,
        completedAt: a.completedAt ?? new Date(),
        details: {
          attemptNumber: a.attemptNumber,
          questionsCorrect: correctAnswers,
          totalQuestions: totalAnswers,
        },
      };
    }),
    ...achievementData.map((a) => ({
      id: a.id,
      type: "achievement" as const,
      title: a.achievementName,
      subjectName: a.achievementType,
      subjectColor: null,
      completedAt: a.earnedAt,
    })),
  ].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  // Calculate stats
  const statsData = await db
    .select({
      totalActivities: sql<number>`count(*)::int`,
      totalTimeSpent: sql<number>`COALESCE(SUM(${activityAttempts.timeSpent}), 0)::int`,
      avgScore: sql<number>`COALESCE(AVG(${activityAttempts.score}), 0)::float`,
      passCount: sql<number>`COUNT(CASE WHEN ${activityAttempts.passed} = true THEN 1 END)::int`,
    })
    .from(activityAttempts)
    .where(eq(activityAttempts.learnerId, learner.learnerId));

  const stats = statsData[0];
  const passRate =
    stats.totalActivities > 0
      ? Math.round((stats.passCount / stats.totalActivities) * 100)
      : 0;

  return {
    child: {
      id: learner.learnerId,
      name: learner.learnerName ?? "Unknown",
      avatarUrl: learner.avatarUrl,
      gradeLevel: learner.gradeLevel ?? 5,
      slug,
    },
    activities: allActivities,
    pagination: {
      page,
      pageSize,
      total: countResult?.count ?? 0,
      totalPages: Math.ceil((countResult?.count ?? 0) / pageSize),
    },
    stats: {
      totalActivities: stats.totalActivities,
      totalTimeSpent: stats.totalTimeSpent,
      avgScore: Math.round(stats.avgScore),
      passRate,
    },
  };
}

function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getActivityIcon(type: string) {
  switch (type) {
    case "achievement":
      return <Trophy className="h-4 w-4 text-warning" />;
    case "lesson":
      return <BookOpen className="h-4 w-4 text-info" />;
    default:
      return <Target className="h-4 w-4 text-primary" />;
  }
}

export async function generateMetadata({
  params: _params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  void _params;
  return {
    title: `Activity History | Parent Dashboard | Kaelyn's Academy`,
    description: `View your child's complete learning activity history`,
  };
}

export default async function ActivityHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "parent") {
    redirect("/login");
  }

  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1", 10);

  const data = await getActivityData(slug, session.user.id, page);

  if (!data) {
    notFound();
  }

  const { child, activities: activityList, pagination, stats } = data;

  // Group activities by date
  const groupedActivities = activityList.reduce(
    (groups, activity) => {
      const dateKey = formatDate(activity.completedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
      return groups;
    },
    {} as Record<string, ActivityItem[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/parent/children/${slug}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={child.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {child.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Activity History</h1>
              <p className="text-muted-foreground">
                {child.name} &middot; Grade {child.gradeLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <div className="text-xs text-muted-foreground">Total Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-info" />
              <div>
                <div className="text-2xl font-bold">
                  {formatTimeSpent(stats.totalTimeSpent)}
                </div>
                <div className="text-xs text-muted-foreground">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-warning" />
              <div>
                <div className="text-2xl font-bold">{stats.avgScore}%</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold">{stats.passRate}%</div>
                <div className="text-xs text-muted-foreground">Pass Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Showing {activityList.length} of {pagination.total} activities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activityList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity recorded yet</p>
              <p className="text-sm">Activities will appear here as your child learns</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-muted-foreground">{date}</h3>
                  </div>
                  <div className="space-y-3 ml-6 border-l-2 border-muted pl-6">
                    {dayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="relative flex items-start gap-4 pb-4"
                      >
                        <div className="absolute -left-[30px] p-1.5 rounded-full bg-background border-2 border-muted">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{activity.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span
                                  className="inline-block w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      activity.subjectColor ?? "var(--muted)",
                                  }}
                                />
                                <span>{activity.subjectName}</span>
                                <span>&middot;</span>
                                <span>{formatTime(activity.completedAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {activity.timeSpent !== undefined && (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeSpent(activity.timeSpent)}
                                </Badge>
                              )}
                              {activity.passed !== undefined && (
                                <Badge
                                  variant={activity.passed ? "default" : "destructive"}
                                  className={activity.passed ? "bg-success" : ""}
                                >
                                  {activity.score !== undefined
                                    ? `${activity.score}%`
                                    : activity.passed
                                      ? "Passed"
                                      : "Needs Review"}
                                </Badge>
                              )}
                              {activity.type === "achievement" && (
                                <Badge className="bg-warning">Earned</Badge>
                              )}
                            </div>
                          </div>
                          {activity.details &&
                            activity.details.totalQuestions !== undefined &&
                            activity.details.totalQuestions > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.details.questionsCorrect} of{" "}
                              {activity.details.totalQuestions} questions correct
                              {activity.details.attemptNumber !== undefined &&
                                activity.details.attemptNumber > 1 &&
                                ` (Attempt ${activity.details.attemptNumber})`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            asChild={pagination.page > 1}
          >
            {pagination.page > 1 ? (
              <Link href={`/parent/children/${slug}/activity?page=${pagination.page - 1}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            asChild={pagination.page < pagination.totalPages}
          >
            {pagination.page < pagination.totalPages ? (
              <Link href={`/parent/children/${slug}/activity?page=${pagination.page + 1}`}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
