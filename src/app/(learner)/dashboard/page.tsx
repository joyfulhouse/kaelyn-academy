"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SubjectProgressChart,
  WeeklyActivityChart,
  MasteryPieChart,
  StreakChart,
  CircularProgress,
} from "@/components/dashboard/progress-charts";
import { useTheme } from "@/components/providers/theme-provider";

interface Learner {
  id: string;
  name: string;
}

interface SubjectProgress {
  id: string;
  subjectId: string;
  subjectName: string;
  masteryLevel: number;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalTimeSpent: number;
  lastActivityAt: string;
}

interface RecentAttempt {
  activityTitle: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

interface ProgressSummary {
  summary: {
    subjects: SubjectProgress[];
    recentActivity: RecentAttempt[];
  };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function LearnerDashboard() {
  const { status } = useSession();
  useTheme(); // Apply theme on mount
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [learnerId, setLearnerId] = useState<string | null>(null);
  const [learnerName, setLearnerName] = useState<string>("");

  const fetchLearner = useCallback(async () => {
    try {
      const response = await fetch("/api/learners");
      if (response.ok) {
        const result = await response.json();
        const learners = result.learners as Learner[];
        if (learners && learners.length > 0) {
          setLearnerId(learners[0].id);
          setLearnerName(learners[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch learner:", error);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!learnerId) return;

    try {
      const response = await fetch(`/api/progress?learnerId=${learnerId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    } finally {
      setLoading(false);
    }
  }, [learnerId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLearner();
    }
  }, [status, fetchLearner]);

  useEffect(() => {
    if (learnerId) {
      fetchProgress();
    }
  }, [learnerId, fetchProgress]);

  // Mock data for demo
  const mockSubjects: SubjectProgress[] = data?.summary?.subjects?.length
    ? data.summary.subjects
    : [
        { id: "1", subjectId: "math", subjectName: "Math", masteryLevel: 75, completedLessons: 15, totalLessons: 20, currentStreak: 5, totalTimeSpent: 3600, lastActivityAt: new Date().toISOString() },
        { id: "2", subjectId: "reading", subjectName: "Reading", masteryLevel: 82, completedLessons: 18, totalLessons: 25, currentStreak: 3, totalTimeSpent: 4200, lastActivityAt: new Date().toISOString() },
        { id: "3", subjectId: "science", subjectName: "Science", masteryLevel: 68, completedLessons: 10, totalLessons: 18, currentStreak: 2, totalTimeSpent: 2100, lastActivityAt: new Date().toISOString() },
        { id: "4", subjectId: "history", subjectName: "History", masteryLevel: 55, completedLessons: 7, totalLessons: 15, currentStreak: 0, totalTimeSpent: 1500, lastActivityAt: new Date().toISOString() },
      ];

  const mockWeeklyActivity = [
    { day: "Mon", minutes: 45, lessons: 2 },
    { day: "Tue", minutes: 30, lessons: 1 },
    { day: "Wed", minutes: 60, lessons: 3 },
    { day: "Thu", minutes: 25, lessons: 1 },
    { day: "Fri", minutes: 50, lessons: 2 },
    { day: "Sat", minutes: 15, lessons: 1 },
    { day: "Sun", minutes: 0, lessons: 0 },
  ];

  const masteryBreakdown = [
    { name: "Mastered", value: 45, color: "var(--success)" },
    { name: "Learning", value: 30, color: "var(--primary)" },
    { name: "Needs Review", value: 15, color: "var(--warning)" },
    { name: "Not Started", value: 10, color: "var(--muted)" },
  ];

  const totalMastery = mockSubjects.length
    ? Math.round(mockSubjects.reduce((acc, s) => acc + s.masteryLevel, 0) / mockSubjects.length)
    : 0;

  const totalLessonsCompleted = mockSubjects.reduce((acc, s) => acc + s.completedLessons, 0);
  const totalLessons = mockSubjects.reduce((acc, s) => acc + s.totalLessons, 0);
  const overallProgress = Math.round((totalLessonsCompleted / totalLessons) * 100) || 0;
  const currentStreak = Math.max(...mockSubjects.map((s) => s.currentStreak), 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{learnerName ? `, ${learnerName}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            You&apos;re on a {currentStreak}-day streak. Keep it going!
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/subjects">
            <Play className="h-4 w-4" />
            Continue Learning
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessonsCompleted}</p>
                <p className="text-xs text-muted-foreground">Lessons Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMastery}%</p>
                <p className="text-xs text-muted-foreground">Avg Mastery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Subject Progress
                </CardTitle>
                <CardDescription>Your mastery across all subjects</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/subjects" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SubjectProgressChart data={mockSubjects} />
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Overall Progress
            </CardTitle>
            <CardDescription>Your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <CircularProgress value={overallProgress} label="Completion" color="var(--primary)" />
            <div className="text-center">
              <p className="text-2xl font-bold">
                {totalLessonsCompleted}/{totalLessons}
              </p>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  This Week&apos;s Activity
                </CardTitle>
                <CardDescription>Study time and lessons completed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WeeklyActivityChart data={mockWeeklyActivity} />
          </CardContent>
        </Card>

        {/* Concept Mastery */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Concept Mastery
            </CardTitle>
            <CardDescription>Your understanding breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <MasteryPieChart data={masteryBreakdown} />
            <div className="mt-4 space-y-2">
              {masteryBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Streak */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Study Streak
            </CardTitle>
            <Badge variant="secondary">Keep it going!</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <StreakChart currentStreak={currentStreak} longestStreak={14} />
          <div className="mt-4 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-green-600">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold">14</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/achievements" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data?.summary?.recentActivity || [
              { activityTitle: "Addition Practice", score: 95, passed: true, completedAt: new Date().toISOString() },
              { activityTitle: "Reading Comprehension Quiz", score: 88, passed: true, completedAt: new Date(Date.now() - 86400000).toISOString() },
              { activityTitle: "Science Lab: Plants", score: 100, passed: true, completedAt: new Date(Date.now() - 172800000).toISOString() },
            ]).map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.passed
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {activity.passed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.activityTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{activity.score}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
