import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
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

// Mock data - in production, this would come from the database
const childrenData: Record<string, {
  id: string;
  name: string;
  email: string;
  gradeLevel: number;
  age: number;
  avatarUrl: string | null;
  createdAt: Date;
  lastActive: Date;
  progress: {
    overall: number;
    streak: number;
    totalLessons: number;
    totalTime: number;
    achievements: number;
  };
  subjects: Array<{
    name: string;
    progress: number;
    mastery: number;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
  recentActivity: Array<{
    type: "lesson" | "achievement" | "quiz";
    title: string;
    subject: string;
    date: Date;
    score?: number;
  }>;
  weeklyProgress: Array<{
    day: string;
    minutes: number;
    lessons: number;
  }>;
}> = {
  emma: {
    id: "1",
    name: "Emma Johnson",
    email: "emma.j@example.com",
    gradeLevel: 3,
    age: 8,
    avatarUrl: null,
    createdAt: new Date("2024-08-15"),
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    progress: {
      overall: 78,
      streak: 12,
      totalLessons: 156,
      totalTime: 4320,
      achievements: 8,
    },
    subjects: [
      { name: "Math", progress: 85, mastery: 88, lessonsCompleted: 42, totalLessons: 50 },
      { name: "Reading", progress: 92, mastery: 90, lessonsCompleted: 46, totalLessons: 50 },
      { name: "Science", progress: 70, mastery: 72, lessonsCompleted: 35, totalLessons: 50 },
      { name: "History", progress: 65, mastery: 68, lessonsCompleted: 33, totalLessons: 50 },
    ],
    recentActivity: [
      { type: "lesson", title: "Multiplication Tables", subject: "Math", date: new Date(Date.now() - 1000 * 60 * 30) },
      { type: "achievement", title: "Math Master", subject: "Math", date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { type: "quiz", title: "Reading Comprehension", subject: "Reading", date: new Date(Date.now() - 1000 * 60 * 60 * 24), score: 95 },
      { type: "lesson", title: "Plant Life Cycles", subject: "Science", date: new Date(Date.now() - 1000 * 60 * 60 * 48) },
    ],
    weeklyProgress: [
      { day: "Mon", minutes: 45, lessons: 3 },
      { day: "Tue", minutes: 60, lessons: 4 },
      { day: "Wed", minutes: 30, lessons: 2 },
      { day: "Thu", minutes: 55, lessons: 3 },
      { day: "Fri", minutes: 40, lessons: 2 },
      { day: "Sat", minutes: 20, lessons: 1 },
      { day: "Sun", minutes: 15, lessons: 1 },
    ],
  },
  liam: {
    id: "2",
    name: "Liam Johnson",
    email: "liam.j@example.com",
    gradeLevel: 5,
    age: 10,
    avatarUrl: null,
    createdAt: new Date("2024-08-15"),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    progress: {
      overall: 65,
      streak: 5,
      totalLessons: 98,
      totalTime: 2940,
      achievements: 5,
    },
    subjects: [
      { name: "Math", progress: 72, mastery: 70, lessonsCompleted: 36, totalLessons: 50 },
      { name: "Reading", progress: 68, mastery: 65, lessonsCompleted: 34, totalLessons: 50 },
      { name: "Science", progress: 58, mastery: 60, lessonsCompleted: 14, totalLessons: 50 },
      { name: "History", progress: 55, mastery: 58, lessonsCompleted: 14, totalLessons: 50 },
    ],
    recentActivity: [
      { type: "lesson", title: "Fractions & Decimals", subject: "Math", date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      { type: "quiz", title: "American Revolution", subject: "History", date: new Date(Date.now() - 1000 * 60 * 60 * 48), score: 78 },
      { type: "lesson", title: "Weather Patterns", subject: "Science", date: new Date(Date.now() - 1000 * 60 * 60 * 72) },
    ],
    weeklyProgress: [
      { day: "Mon", minutes: 30, lessons: 2 },
      { day: "Tue", minutes: 45, lessons: 3 },
      { day: "Wed", minutes: 0, lessons: 0 },
      { day: "Thu", minutes: 40, lessons: 2 },
      { day: "Fri", minutes: 35, lessons: 2 },
      { day: "Sat", minutes: 0, lessons: 0 },
      { day: "Sun", minutes: 0, lessons: 0 },
    ],
  },
};

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
  const child = childrenData[slug];

  if (!child) {
    return { title: "Child Not Found | Kaelyn's Academy" };
  }

  return {
    title: `${child.name} | Parent Dashboard | Kaelyn's Academy`,
    description: `View ${child.name}'s learning progress and achievements`,
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
  const child = childrenData[slug];

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
                Grade {child.gradeLevel} &bull; Age {child.age}
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
                {child.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === "lesson" ? "bg-blue-500/10" :
                      activity.type === "achievement" ? "bg-yellow-500/10" :
                      "bg-green-500/10"
                    }`}>
                      {activity.type === "lesson" && <BookOpen className="h-4 w-4 text-blue-500" />}
                      {activity.type === "achievement" && <Award className="h-4 w-4 text-yellow-500" />}
                      {activity.type === "quiz" && <Target className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.subject}</p>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <Badge variant="secondary" className="mb-1">{activity.score}%</Badge>
                      )}
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {child.subjects.map((subject) => (
            <Card key={subject.name}>
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
          ))}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Complete learning history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {child.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-full ${
                    activity.type === "lesson" ? "bg-blue-500/10" :
                    activity.type === "achievement" ? "bg-yellow-500/10" :
                    "bg-green-500/10"
                  }`}>
                    {activity.type === "lesson" && <BookOpen className="h-4 w-4 text-blue-500" />}
                    {activity.type === "achievement" && <Award className="h-4 w-4 text-yellow-500" />}
                    {activity.type === "quiz" && <Target className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.subject}</p>
                  </div>
                  <div className="text-right">
                    {activity.score && (
                      <Badge variant="secondary" className="mb-1">{activity.score}%</Badge>
                    )}
                    <p className="text-sm text-muted-foreground">{formatTimeAgo(activity.date)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
