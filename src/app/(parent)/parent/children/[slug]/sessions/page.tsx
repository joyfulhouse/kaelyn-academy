import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Clock,
  BookOpen,
  Target,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MonitorSmartphone,
  Laptop,
  Tablet,
  Timer,
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
import { learningSessions } from "@/lib/db/schema/progress";
import { lessons, activities, subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc, gte, sql } from "drizzle-orm";

interface SessionData {
  id: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  totalActiveTime: number | null;
  totalPausedTime: number | null;
  activitiesCompleted: number | null;
  lessonsViewed: number | null;
  deviceType: string | null;
  currentLessonTitle: string | null;
  currentActivityTitle: string | null;
  currentSubjectName: string | null;
  currentSubjectColor: string | null;
}

interface ChildInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
  gradeLevel: number;
  slug: string;
}

interface PageData {
  child: ChildInfo;
  sessions: SessionData[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalSessions: number;
    totalActiveTime: number;
    totalActivities: number;
    totalLessons: number;
    avgSessionLength: number;
  };
}

async function getSessionsData(
  slug: string,
  parentUserId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PageData | null> {
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

  // Get sessions with related data
  const sessionsData = await db
    .select({
      id: learningSessions.id,
      status: learningSessions.status,
      startedAt: learningSessions.startedAt,
      endedAt: learningSessions.endedAt,
      totalActiveTime: learningSessions.totalActiveTime,
      totalPausedTime: learningSessions.totalPausedTime,
      activitiesCompleted: learningSessions.activitiesCompleted,
      lessonsViewed: learningSessions.lessonsViewed,
      deviceType: learningSessions.deviceType,
      currentLessonTitle: lessons.title,
      currentActivityTitle: activities.title,
      currentSubjectName: subjects.name,
      currentSubjectColor: subjects.color,
    })
    .from(learningSessions)
    .leftJoin(lessons, eq(learningSessions.currentLessonId, lessons.id))
    .leftJoin(activities, eq(learningSessions.currentActivityId, activities.id))
    .leftJoin(subjects, eq(learningSessions.currentSubjectId, subjects.id))
    .where(eq(learningSessions.learnerId, learner.learnerId))
    .orderBy(desc(learningSessions.startedAt))
    .limit(pageSize)
    .offset(offset);

  // Get total count for pagination
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(learningSessions)
    .where(eq(learningSessions.learnerId, learner.learnerId));

  // Calculate stats (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [statsData] = await db
    .select({
      totalSessions: sql<number>`count(*)::int`,
      totalActiveTime: sql<number>`COALESCE(SUM(${learningSessions.totalActiveTime}), 0)::int`,
      totalActivities: sql<number>`COALESCE(SUM(${learningSessions.activitiesCompleted}), 0)::int`,
      totalLessons: sql<number>`COALESCE(SUM(${learningSessions.lessonsViewed}), 0)::int`,
    })
    .from(learningSessions)
    .where(and(
      eq(learningSessions.learnerId, learner.learnerId),
      gte(learningSessions.startedAt, thirtyDaysAgo)
    ));

  const avgSessionLength =
    statsData && statsData.totalSessions > 0
      ? Math.round(statsData.totalActiveTime / statsData.totalSessions)
      : 0;

  return {
    child: {
      id: learner.learnerId,
      name: learner.learnerName ?? "Unknown",
      avatarUrl: learner.avatarUrl,
      gradeLevel: learner.gradeLevel ?? 5,
      slug,
    },
    sessions: sessionsData,
    pagination: {
      page,
      pageSize,
      total: countResult?.count ?? 0,
      totalPages: Math.ceil((countResult?.count ?? 0) / pageSize),
    },
    stats: {
      totalSessions: statsData?.totalSessions ?? 0,
      totalActiveTime: statsData?.totalActiveTime ?? 0,
      totalActivities: statsData?.totalActivities ?? 0,
      totalLessons: statsData?.totalLessons ?? 0,
      avgSessionLength,
    },
  };
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0m";
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

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType) {
    case "mobile":
      return <MonitorSmartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Laptop className="h-4 w-4" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-success gap-1">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          Active
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="outline" className="border-warning text-warning gap-1">
          <Pause className="h-3 w-3" />
          Paused
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="border-success text-success gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "abandoned":
      return (
        <Badge variant="outline" className="border-muted-foreground gap-1">
          <XCircle className="h-3 w-3" />
          Abandoned
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export async function generateMetadata({
  params: _params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  void _params;
  return {
    title: `Session History | Parent Dashboard | Kaelyn's Academy`,
    description: `View your child's learning session history`,
  };
}

export default async function SessionHistoryPage({
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

  const data = await getSessionsData(slug, session.user.id, page);

  if (!data) {
    notFound();
  }

  const { child, sessions: sessionList, pagination, stats } = data;

  // Group sessions by date
  const groupedSessions = sessionList.reduce(
    (groups, session) => {
      const dateKey = formatDate(session.startedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
      return groups;
    },
    {} as Record<string, SessionData[]>
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
              <AvatarFallback className="bg-role-parent/10 text-role-parent">
                {child.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Session History</h1>
              <p className="text-muted-foreground">
                {child.name} &middot; Grade {child.gradeLevel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats (Last 30 Days) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-role-parent/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-role-parent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(stats.totalActiveTime)}
                </div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <div className="text-xs text-muted-foreground">Activities</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalLessons}</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(stats.avgSessionLength)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Session</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session Timeline</CardTitle>
              <CardDescription>
                Showing {sessionList.length} of {pagination.total} sessions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessionList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions recorded yet</p>
              <p className="text-sm">Sessions will appear here as {child.name} learns</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSessions).map(([date, daySessions]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-muted-foreground">{date}</h3>
                  </div>
                  <div className="space-y-3 ml-6 border-l-2 border-muted pl-6">
                    {daySessions.map((session) => {
                      const duration = session.endedAt
                        ? Math.floor(
                            (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
                          )
                        : Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

                      return (
                        <div
                          key={session.id}
                          className="relative flex items-start gap-4 pb-4"
                        >
                          <div className="absolute -left-[30px] p-1.5 rounded-full bg-background border-2 border-muted">
                            {session.status === "active" ? (
                              <Play className="h-4 w-4 text-success" />
                            ) : (
                              <Activity className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">
                                    {session.currentSubjectName || "General Learning"}
                                  </p>
                                  {getStatusBadge(session.status)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <span>{formatTime(session.startedAt)}</span>
                                  {session.endedAt && (
                                    <>
                                      <span>-</span>
                                      <span>{formatTime(session.endedAt)}</span>
                                    </>
                                  )}
                                  <span>&middot;</span>
                                  {getDeviceIcon(session.deviceType)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(duration)}
                              </Badge>
                              {session.lessonsViewed !== null && session.lessonsViewed > 0 && (
                                <Badge variant="outline" className="gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {session.lessonsViewed} lessons
                                </Badge>
                              )}
                              {session.activitiesCompleted !== null &&
                                session.activitiesCompleted > 0 && (
                                  <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30">
                                    <Target className="h-3 w-3" />
                                    {session.activitiesCompleted} activities
                                  </Badge>
                                )}
                            </div>
                            {(session.currentLessonTitle || session.currentActivityTitle) && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Last viewed:{" "}
                                {session.currentLessonTitle || session.currentActivityTitle}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
              <Link href={`/parent/children/${slug}/sessions?page=${pagination.page - 1}`}>
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
              <Link href={`/parent/children/${slug}/sessions?page=${pagination.page + 1}`}>
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
