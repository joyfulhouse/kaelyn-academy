"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Trophy,
  Star,
  Flame,
  Target,
  BookOpen,
  Medal,
  Zap,
  Crown,
  Shield,
  Sparkles,
  Lock,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Achievement icon mapping
const achievementIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  trophy: Trophy,
  star: Star,
  flame: Flame,
  target: Target,
  book: BookOpen,
  medal: Medal,
  zap: Zap,
  crown: Crown,
  shield: Shield,
  sparkles: Sparkles,
};

// Color mapping for achievement types
const typeColors: Record<string, string> = {
  streak: "#f59e0b",
  completion: "#3b82f6",
  mastery: "#10b981",
  subject: "#ec4899",
  special: "#f97316",
};

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: string;
  points: number | null;
  criteria: {
    type: string;
    threshold: number;
    subjectId?: string;
  } | null;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
}

interface AchievementsData {
  achievements: Achievement[];
  stats: {
    earned: number;
    total: number;
    totalPoints: number;
    totalPossiblePoints: number;
    currentStreak: number;
    longestStreak: number;
  };
  nextAchievement: Achievement | null;
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  // Map iconUrl to icon component, fallback to type-based icon
  const iconName = achievement.iconUrl?.replace("icon:", "") || "award";
  const IconComponent = achievementIcons[iconName] || Award;
  const color = typeColors[achievement.type] || "#6b7280";

  return (
    <Card className={`relative ${achievement.earned ? "" : "opacity-60"}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              achievement.earned ? "" : "grayscale"
            }`}
            style={{
              backgroundColor: achievement.earned ? `${color}20` : undefined,
            }}
          >
            {achievement.earned ? (
              <div style={{ color }}>
                <IconComponent className="h-8 w-8" />
              </div>
            ) : (
              <Lock className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">
                {achievement.name}
              </h3>
              <Badge
                variant={achievement.earned ? "default" : "secondary"}
                className="text-xs"
              >
                {achievement.points} pts
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            {!achievement.earned && achievement.progress > 0 && (
              <div className="mt-2">
                <Progress value={achievement.progress} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.progress}% complete
                </p>
              </div>
            )}
            {achievement.earned && achievement.earnedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      {achievement.earned && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Star className="h-3 w-3 text-white fill-white" />
        </div>
      )}
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-28" />
          ))}
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}

// Default achievements to show when database is empty
const defaultAchievements: Achievement[] = [
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Learn for 3 days in a row",
    iconUrl: "icon:flame",
    type: "streak",
    points: 50,
    criteria: { type: "streak_days", threshold: 3 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Learn for 7 days in a row",
    iconUrl: "icon:flame",
    type: "streak",
    points: 100,
    criteria: { type: "streak_days", threshold: 7 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "streak-30",
    name: "Monthly Champion",
    description: "Learn for 30 days in a row",
    iconUrl: "icon:crown",
    type: "streak",
    points: 500,
    criteria: { type: "streak_days", threshold: 30 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "first-lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    iconUrl: "icon:star",
    type: "completion",
    points: 25,
    criteria: { type: "lessons_completed", threshold: 1 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "lessons-10",
    name: "Eager Learner",
    description: "Complete 10 lessons",
    iconUrl: "icon:book",
    type: "completion",
    points: 100,
    criteria: { type: "lessons_completed", threshold: 10 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "lessons-50",
    name: "Knowledge Seeker",
    description: "Complete 50 lessons",
    iconUrl: "icon:trophy",
    type: "completion",
    points: 300,
    criteria: { type: "lessons_completed", threshold: 50 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "mastery-first",
    name: "Concept Master",
    description: "Master your first concept",
    iconUrl: "icon:target",
    type: "mastery",
    points: 50,
    criteria: { type: "mastery_level", threshold: 1 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "mastery-perfect",
    name: "Perfect Score",
    description: "Get 100% on a quiz",
    iconUrl: "icon:sparkles",
    type: "mastery",
    points: 75,
    criteria: { type: "custom", threshold: 100 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "math-explorer",
    name: "Math Explorer",
    description: "Complete 5 math lessons",
    iconUrl: "icon:medal",
    type: "subject",
    points: 100,
    criteria: { type: "lessons_completed", threshold: 5, subjectId: "math" },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "science-explorer",
    name: "Science Explorer",
    description: "Complete 5 science lessons",
    iconUrl: "icon:zap",
    type: "subject",
    points: 100,
    criteria: { type: "lessons_completed", threshold: 5, subjectId: "science" },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Start learning before 7 AM",
    iconUrl: "icon:star",
    type: "special",
    points: 25,
    criteria: { type: "custom", threshold: 7 },
    earned: false,
    earnedAt: null,
    progress: 0,
  },
];

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AchievementsData | null>(null);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch("/api/achievements");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Use API data or fallback to defaults
  const achievements = data?.achievements?.length
    ? data.achievements
    : defaultAchievements;

  const stats = data?.stats || {
    earned: 0,
    total: defaultAchievements.length,
    totalPoints: 0,
    totalPossiblePoints: defaultAchievements.reduce((sum, a) => sum + (a.points || 0), 0),
    currentStreak: 0,
    longestStreak: 0,
  };

  const nextAchievement = data?.nextAchievement || achievements.find((a) => !a.earned);

  // Group achievements by type
  const streakAchievements = achievements.filter((a) => a.type === "streak");
  const completionAchievements = achievements.filter((a) => a.type === "completion");
  const masteryAchievements = achievements.filter((a) => a.type === "mastery");
  const subjectAchievements = achievements.filter((a) => a.type === "subject");
  const specialAchievements = achievements.filter((a) => a.type === "special");

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Earn badges and points as you learn. Keep up the great work!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {stats.earned}/{stats.total}
                </div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Overall Achievement Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={stats.total > 0 ? (stats.earned / stats.total) * 100 : 0}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {stats.total - stats.earned} more achievements to unlock
          </p>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="streak">Streaks</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
          <TabsTrigger value="subject">Subjects</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streak" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {streakAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completion" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completionAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mastery" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {masteryAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subject" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjectAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specialAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Next Achievement to Unlock */}
      {nextAchievement && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Next Achievement to Unlock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${typeColors[nextAchievement.type] || "#6b7280"}20` }}
              >
                {(() => {
                  const iconName = nextAchievement.iconUrl?.replace("icon:", "") || "award";
                  const Icon = achievementIcons[iconName] || Award;
                  return (
                    <div style={{ color: typeColors[nextAchievement.type] || "#6b7280" }}>
                      <Icon className="h-8 w-8" />
                    </div>
                  );
                })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{nextAchievement.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {nextAchievement.description}
                  {nextAchievement.progress > 0 && ` - ${nextAchievement.progress}% complete!`}
                </p>
                <Progress value={nextAchievement.progress} className="h-2 mt-2" />
              </div>
              <Badge variant="secondary">+{nextAchievement.points} pts</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
