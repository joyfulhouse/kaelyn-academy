import { Metadata } from "next";
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
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Achievements | Kaelyn's Academy",
  description: "View your earned badges and achievements",
};

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

// Sample achievements data - in production, this would come from the database
const allAchievements = [
  // Streak achievements
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Learn for 3 days in a row",
    icon: "flame",
    type: "streak",
    points: 50,
    criteria: { type: "streak_days", threshold: 3 },
    color: "#f59e0b",
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Learn for 7 days in a row",
    icon: "flame",
    type: "streak",
    points: 100,
    criteria: { type: "streak_days", threshold: 7 },
    color: "#f59e0b",
  },
  {
    id: "streak-30",
    name: "Monthly Champion",
    description: "Learn for 30 days in a row",
    icon: "crown",
    type: "streak",
    points: 500,
    criteria: { type: "streak_days", threshold: 30 },
    color: "#eab308",
  },
  // Completion achievements
  {
    id: "first-lesson",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "star",
    type: "completion",
    points: 25,
    criteria: { type: "lessons_completed", threshold: 1 },
    color: "#3b82f6",
  },
  {
    id: "lessons-10",
    name: "Eager Learner",
    description: "Complete 10 lessons",
    icon: "book",
    type: "completion",
    points: 100,
    criteria: { type: "lessons_completed", threshold: 10 },
    color: "#3b82f6",
  },
  {
    id: "lessons-50",
    name: "Knowledge Seeker",
    description: "Complete 50 lessons",
    icon: "trophy",
    type: "completion",
    points: 300,
    criteria: { type: "lessons_completed", threshold: 50 },
    color: "#3b82f6",
  },
  {
    id: "lessons-100",
    name: "Century Club",
    description: "Complete 100 lessons",
    icon: "award",
    type: "completion",
    points: 1000,
    criteria: { type: "lessons_completed", threshold: 100 },
    color: "#8b5cf6",
  },
  // Mastery achievements
  {
    id: "mastery-first",
    name: "Concept Master",
    description: "Master your first concept",
    icon: "target",
    type: "mastery",
    points: 50,
    criteria: { type: "mastery_level", threshold: 1 },
    color: "#10b981",
  },
  {
    id: "mastery-perfect",
    name: "Perfect Score",
    description: "Get 100% on a quiz",
    icon: "sparkles",
    type: "mastery",
    points: 75,
    criteria: { type: "custom", threshold: 100 },
    color: "#10b981",
  },
  // Subject achievements
  {
    id: "math-explorer",
    name: "Math Explorer",
    description: "Complete 5 math lessons",
    icon: "medal",
    type: "subject",
    points: 100,
    criteria: { type: "lessons_completed", threshold: 5, subjectId: "math" },
    color: "#ec4899",
  },
  {
    id: "science-explorer",
    name: "Science Explorer",
    description: "Complete 5 science lessons",
    icon: "zap",
    type: "subject",
    points: 100,
    criteria: { type: "lessons_completed", threshold: 5, subjectId: "science" },
    color: "#14b8a6",
  },
  // Special achievements
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Start learning before 7 AM",
    icon: "star",
    type: "special",
    points: 25,
    criteria: { type: "custom", threshold: 7 },
    color: "#f97316",
  },
];

// Simulated earned achievements - in production, this would come from the database
const earnedAchievementIds = ["first-lesson", "streak-3", "mastery-first"];

function AchievementCard({
  achievement,
  earned,
  earnedAt,
}: {
  achievement: typeof allAchievements[0];
  earned: boolean;
  earnedAt?: string;
}) {
  const IconComponent = achievementIcons[achievement.icon] || Award;

  return (
    <Card className={`relative ${earned ? "" : "opacity-60"}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              earned ? "" : "grayscale"
            }`}
            style={{
              backgroundColor: earned ? `${achievement.color}20` : undefined,
            }}
          >
            {earned ? (
              <div style={{ color: achievement.color }}>
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
                variant={earned ? "default" : "secondary"}
                className="text-xs"
              >
                {achievement.points} pts
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            {earned && earnedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Earned on {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      {earned && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: achievement.color }}
        >
          <Star className="h-3 w-3 text-white fill-white" />
        </div>
      )}
    </Card>
  );
}

export default async function AchievementsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Calculate stats
  const totalPoints = allAchievements
    .filter((a) => earnedAchievementIds.includes(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  const totalPossiblePoints = allAchievements.reduce((sum, a) => sum + a.points, 0);

  const earnedCount = earnedAchievementIds.length;
  const totalCount = allAchievements.length;

  // Group achievements by type
  const streakAchievements = allAchievements.filter((a) => a.type === "streak");
  const completionAchievements = allAchievements.filter((a) => a.type === "completion");
  const masteryAchievements = allAchievements.filter((a) => a.type === "mastery");
  const subjectAchievements = allAchievements.filter((a) => a.type === "subject");
  const specialAchievements = allAchievements.filter((a) => a.type === "special");

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
                  {totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {earnedCount}/{totalCount}
                </div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">
                  0
                </div>
                <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
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
              {Math.round((earnedCount / totalCount) * 100)}%
            </span>
          </div>
          <Progress value={(earnedCount / totalCount) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {totalCount - earnedCount} more achievements to unlock
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
            {allAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={earnedAchievementIds.includes(achievement.id)}
                earnedAt={
                  earnedAchievementIds.includes(achievement.id)
                    ? "2024-12-01"
                    : undefined
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streak" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {streakAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={earnedAchievementIds.includes(achievement.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completion" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completionAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={earnedAchievementIds.includes(achievement.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mastery" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {masteryAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={earnedAchievementIds.includes(achievement.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subject" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjectAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={earnedAchievementIds.includes(achievement.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specialAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                earned={earnedAchievementIds.includes(achievement.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Next Achievement to Unlock */}
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
              style={{ backgroundColor: "#f59e0b20" }}
            >
              <Flame className="h-8 w-8 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Week Warrior</h3>
              <p className="text-sm text-muted-foreground">
                Learn for 7 days in a row - You're 3 days away!
              </p>
              <Progress value={57} className="h-2 mt-2" />
            </div>
            <Badge variant="secondary">+100 pts</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
