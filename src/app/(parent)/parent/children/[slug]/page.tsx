import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Trophy,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Settings,
  Shield,
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
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, lessonProgress, learnerAchievements } from "@/lib/db/schema/progress";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc, gte, sql } from "drizzle-orm";

interface ChildData {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
  avatarUrl: string | null;
  createdAt: Date;
  lastActivityAt: Date | null;
  slug: string;
  progress: {
    overall: number;
    streak: number;
    totalLessons: number;
    totalTime: number;
    achievements: number;
  };
  subjectProgress: Array<{
    subjectId: string;
    name: string;
    progress: number;
    mastery: number;
    lessonsCompleted: number;
    totalLessons: number;
    color: string;
  }>;
  recentActivity: Array<{
    type: "lesson" | "achievement";
    title: string;
    subjectName: string;
    date: Date;
    score?: number;
  }>;
  weeklyProgress: Array<{
    day: string;
    minutes: number;
    lessons: number;
  }>;
}

async function getChildData(slug: string, parentUserId: string): Promise<ChildData | null> {
  // Find the learner by slug where the parent owns the learner profile
  // Learners are directly owned by parent users via learners.userId
  const learnerResult = await db
    .select({
      learnerId: learners.id,
      userId: learners.userId,
      gradeLevel: learners.gradeLevel,
      createdAt: learners.createdAt,
      learnerName: learners.name,
      avatarUrl: learners.avatarUrl,
    })
    .from(learners)
    .where(
      and(
        eq(learners.userId, parentUserId),
        isNull(learners.deletedAt),
        // Match slug by converting name to slug format
        sql`lower(replace(${learners.name}, ' ', '-')) = ${slug.toLowerCase()}`
      )
    )
    .limit(1);

  if (learnerResult.length === 0) {
    return null;
  }

  const learner = learnerResult[0];

  // Get subject progress for this learner
  const subjectProgressData = await db
    .select({
      subjectId: learnerSubjectProgress.subjectId,
      completedLessons: learnerSubjectProgress.completedLessons,
      totalLessons: learnerSubjectProgress.totalLessons,
      masteryLevel: learnerSubjectProgress.masteryLevel,
      currentStreak: learnerSubjectProgress.currentStreak,
      longestStreak: learnerSubjectProgress.longestStreak,
      totalTimeSpent: learnerSubjectProgress.totalTimeSpent,
      lastActivityAt: learnerSubjectProgress.lastActivityAt,
      subjectName: subjects.name,
      subjectColor: subjects.color,
    })
    .from(learnerSubjectProgress)
    .innerJoin(subjects, eq(subjects.id, learnerSubjectProgress.subjectId))
    .where(eq(learnerSubjectProgress.learnerId, learner.learnerId));

  // Calculate overall stats
  const totalLessonsCompleted = subjectProgressData.reduce(
    (sum, sp) => sum + (sp.completedLessons ?? 0), 0
  );
  const totalTimeSpent = subjectProgressData.reduce(
    (sum, sp) => sum + (sp.totalTimeSpent ?? 0), 0
  );
  const maxStreak = Math.max(
    ...subjectProgressData.map(sp => sp.currentStreak ?? 0),
    0
  );
  const lastActivityAt = subjectProgressData
    .map(sp => sp.lastActivityAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  // Calculate overall progress (average of all subject masteries)
  const avgMastery = subjectProgressData.length > 0
    ? subjectProgressData.reduce((sum, sp) => sum + (sp.masteryLevel ?? 0), 0) / subjectProgressData.length
    : 0;

  // Get achievement count
  const [achievementCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(learnerAchievements)
    .where(eq(learnerAchievements.learnerId, learner.learnerId));

  // Get recent lesson activity
  const recentLessons = await db
    .select({
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
      completedAt: lessonProgress.completedAt,
      updatedAt: lessonProgress.updatedAt,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.learnerId, learner.learnerId))
    .orderBy(desc(lessonProgress.updatedAt))
    .limit(10);

  // Build recent activity list
  const recentActivity: ChildData["recentActivity"] = recentLessons.map(lp => ({
    type: "lesson" as const,
    title: `Lesson ${lp.lessonId.slice(-4)}`, // Simplified - would need lesson join for real title
    subjectName: "Learning", // Would need subject join
    date: lp.completedAt ?? lp.updatedAt ?? new Date(),
  }));

  // Get weekly progress (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyLessons = await db
    .select({
      completedAt: lessonProgress.completedAt,
      timeSpent: lessonProgress.timeSpent,
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.learnerId, learner.learnerId),
        eq(lessonProgress.status, "completed"),
        gte(lessonProgress.completedAt, sevenDaysAgo)
      )
    );

  // Group by day of week
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyProgressMap = new Map<string, { minutes: number; lessons: number }>();

  // Initialize all days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weeklyProgressMap.set(dayNames[d.getDay()], { minutes: 0, lessons: 0 });
  }

  // Aggregate lesson data
  for (const lesson of weeklyLessons) {
    if (lesson.completedAt) {
      const dayName = dayNames[lesson.completedAt.getDay()];
      const existing = weeklyProgressMap.get(dayName) || { minutes: 0, lessons: 0 };
      existing.lessons += 1;
      existing.minutes += Math.round((lesson.timeSpent ?? 0) / 60); // Convert seconds to minutes
      weeklyProgressMap.set(dayName, existing);
    }
  }

  // Convert to ordered array (starting from today - 6 days)
  const weeklyProgress: ChildData["weeklyProgress"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = dayNames[d.getDay()];
    const data = weeklyProgressMap.get(dayName) || { minutes: 0, lessons: 0 };
    weeklyProgress.push({ day: dayName, ...data });
  }

  return {
    id: learner.learnerId,
    name: learner.learnerName ?? "Unknown",
    email: "", // Learners don't have their own email, managed by parent
    gradeLevel: learner.gradeLevel ?? 5,
    avatarUrl: learner.avatarUrl,
    createdAt: learner.createdAt ?? new Date(),
    lastActivityAt,
    slug,
    progress: {
      overall: Math.round(avgMastery),
      streak: maxStreak,
      totalLessons: totalLessonsCompleted,
      totalTime: Math.round(totalTimeSpent / 60), // Convert to minutes
      achievements: achievementCount?.count ?? 0,
    },
    subjectProgress: subjectProgressData.map(sp => ({
      subjectId: sp.subjectId,
      name: sp.subjectName,
      progress: Math.round(
        ((sp.completedLessons ?? 0) / Math.max(sp.totalLessons ?? 1, 1)) * 100
      ),
      mastery: Math.round(sp.masteryLevel ?? 0),
      lessonsCompleted: sp.completedLessons ?? 0,
      totalLessons: sp.totalLessons ?? 0,
      color: sp.subjectColor ?? "#6b7280",
    })),
    recentActivity,
    weeklyProgress,
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins}m`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Child Profile | Parent Dashboard | Kaelyn's Academy`,
    description: `View your child's learning progress and achievements`,
  };
}

export default async function ChildProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "parent") {
    redirect("/login");
  }

  const { slug } = await params;
  const child = await getChildData(slug, session.user.id);

  if (!child) {
    notFound();
  }

  const totalWeeklyMinutes = child.weeklyProgress.reduce((sum, day) => sum + day.minutes, 0);
  const totalWeeklyLessons = child.weeklyProgress.reduce((sum, day) => sum + day.lessons, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parent/children">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={child.avatarUrl || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {child.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{child.name}</h1>
              <p className="text-muted-foreground">
                Grade {child.gradeLevel}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/parent/children/${slug}/controls`}>
              <Shield className="h-4 w-4 mr-2" />
              Controls
            </Link>
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{child.progress.overall}%</div>
                <div className="text-xs text-muted-foreground">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-500/10">
                <Trophy className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{child.progress.streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{child.progress.totalLessons}</div>
                <div className="text-xs text-muted-foreground">Lessons Done</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatMinutes(child.progress.totalTime)}</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{child.progress.achievements}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* This Week */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>Learning activity over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total time</span>
                  <span className="font-medium">{formatMinutes(totalWeeklyMinutes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lessons completed</span>
                  <span className="font-medium">{totalWeeklyLessons}</span>
                </div>
                <div className="flex gap-1 h-20 items-end">
                  {child.weeklyProgress.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary/80 rounded-t"
                        style={{ height: `${Math.max((day.minutes / 60) * 100, 4)}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest learning sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {child.recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity yet
                  </p>
                ) : (
                  child.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === "lesson" ? "bg-blue-500/10" :
                        "bg-yellow-500/10"
                      }`}>
                        {activity.type === "lesson" && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {activity.type === "achievement" && <Award className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.subjectName}</p>
                      </div>
                      <div className="text-right">
                        {activity.score && (
                          <Badge variant="secondary" className="mb-1">{activity.score}%</Badge>
                        )}
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {child.subjectProgress.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No subject progress recorded yet</p>
              </CardContent>
            </Card>
          ) : (
            child.subjectProgress.map((subject) => (
              <Card key={subject.subjectId}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subject.lessonsCompleted} of {subject.totalLessons} lessons completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{subject.mastery}%</div>
                      <div className="text-xs text-muted-foreground">Mastery</div>
                    </div>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Complete learning history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {child.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activity recorded yet
                </p>
              ) : (
                child.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`p-2 rounded-full ${
                      activity.type === "lesson" ? "bg-blue-500/10" :
                      "bg-yellow-500/10"
                    }`}>
                      {activity.type === "lesson" && <BookOpen className="h-4 w-4 text-blue-500" />}
                      {activity.type === "achievement" && <Award className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subjectName}</p>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <Badge variant="secondary" className="mb-1">{activity.score}%</Badge>
                      )}
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(activity.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
