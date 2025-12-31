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
import { Skeleton } from "@/components/ui/skeleton";
import {
  SubjectProgressChart,
  WeeklyActivityChart,
  MasteryPieChart,
  CircularProgress,
  type MasteryBreakdown,
} from "@/components/dashboard/progress-charts";
import {
  DifficultyVisualization,
  type AdaptiveDifficultyData,
} from "@/components/dashboard/difficulty-visualization";
import { RecommendationsWidget } from "@/components/dashboard/recommendations-widget";
import { StreakWidget } from "@/components/dashboard/streak-widget";
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

interface WeeklyActivity {
  day: string;
  minutes: number;
  lessons: number;
}

interface ProgressSummary {
  summary: {
    subjects: SubjectProgress[];
    recentActivity: RecentAttempt[];
    achievementCount: number;
    weeklyActivity: WeeklyActivity[];
    masteryBreakdown: MasteryBreakdown[];
    currentStreak: number;
    longestStreak: number;
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
  const [difficultyData, setDifficultyData] = useState<AdaptiveDifficultyData | null>(null);

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

  const fetchDifficulty = useCallback(async () => {
    if (!learnerId) return;

    try {
      const response = await fetch(`/api/learner/difficulty?learnerId=${learnerId}`);
      if (response.ok) {
        const result = await response.json();
        setDifficultyData(result);
      }
    } catch (error) {
      console.error("Failed to fetch difficulty:", error);
    }
  }, [learnerId]);

  const handleDifficultyAdjustment = useCallback(
    async (subjectId: string, direction: "easier" | "harder") => {
      if (!learnerId) return;

      try {
        const response = await fetch("/api/learner/difficulty", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ learnerId, subjectId, direction }),
        });

        if (response.ok) {
          // Refetch difficulty data
          fetchDifficulty();
        }
      } catch (error) {
        console.error("Failed to adjust difficulty:", error);
      }
    },
    [learnerId, fetchDifficulty]
  );

  useEffect(() => {
    if (status === "authenticated") {
      fetchLearner();
    }
  }, [status, fetchLearner]);

  useEffect(() => {
    if (learnerId) {
      fetchProgress();
      fetchDifficulty();
    }
  }, [learnerId, fetchProgress, fetchDifficulty]);

  // Use real data from API with fallback to empty state
  const subjects: SubjectProgress[] = data?.summary?.subjects || [];

  const weeklyActivity: WeeklyActivity[] = data?.summary?.weeklyActivity || [
    { day: "Mon", minutes: 0, lessons: 0 },
    { day: "Tue", minutes: 0, lessons: 0 },
    { day: "Wed", minutes: 0, lessons: 0 },
    { day: "Thu", minutes: 0, lessons: 0 },
    { day: "Fri", minutes: 0, lessons: 0 },
    { day: "Sat", minutes: 0, lessons: 0 },
    { day: "Sun", minutes: 0, lessons: 0 },
  ];

  const masteryBreakdown: MasteryBreakdown[] = data?.summary?.masteryBreakdown?.length
    ? data.summary.masteryBreakdown
    : [
        { name: "Mastered", value: 0, color: "var(--success)" },
        { name: "Learning", value: 0, color: "var(--primary)" },
        { name: "Needs Review", value: 0, color: "var(--warning)" },
      ];

  const achievementCount = data?.summary?.achievementCount || 0;

  const totalMastery = subjects.length
    ? Math.round(subjects.reduce((acc, s) => acc + (s.masteryLevel || 0), 0) / subjects.length)
    : 0;

  const totalLessonsCompleted = subjects.reduce((acc, s) => acc + (s.completedLessons || 0), 0);
  const totalLessons = subjects.reduce((acc, s) => acc + (s.totalLessons || 0), 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0;
  const currentStreak = data?.summary?.currentStreak || 0;
  // longestStreak is now handled by the StreakWidget component

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
            <Flame className="h-4 w-4 text-warning" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{achievementCount}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Recommendations */}
      <RecommendationsWidget />

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
            <SubjectProgressChart data={subjects} />
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
            <WeeklyActivityChart data={weeklyActivity} />
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

      {/* Study Streak - Enhanced with freeze/repair functionality */}
      <StreakWidget />

      {/* Adaptive Difficulty */}
      {difficultyData && (
        <DifficultyVisualization
          data={difficultyData}
          onRequestAdjustment={handleDifficultyAdjustment}
        />
      )}

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
            {(data?.summary?.recentActivity || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No activity yet. Start learning to see your progress!
              </p>
            ) : null}
            {(data?.summary?.recentActivity || []).map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.passed
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
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
