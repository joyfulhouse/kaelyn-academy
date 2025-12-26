import { Metadata } from "next";
import Link from "next/link";
import {
  UserPlus,
  Settings,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Children | Parent Dashboard | Kaelyn's Academy",
  description: "Manage your children's accounts and progress",
};

// Mock data - in production, this would come from the database
const children = [
  {
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
      totalTime: 4320, // minutes
      achievements: 8,
    },
    subjects: [
      { name: "Math", progress: 85, mastery: 88 },
      { name: "Reading", progress: 92, mastery: 90 },
      { name: "Science", progress: 70, mastery: 72 },
      { name: "History", progress: 65, mastery: 68 },
    ],
    controls: {
      dailyLimit: 60,
      weekendLimit: 90,
      contentFiltering: "strict",
    },
  },
  {
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
      totalTime: 2940, // minutes
      achievements: 5,
    },
    subjects: [
      { name: "Math", progress: 72, mastery: 70 },
      { name: "Reading", progress: 68, mastery: 65 },
      { name: "Science", progress: 58, mastery: 60 },
      { name: "History", progress: 55, mastery: 58 },
    ],
    controls: {
      dailyLimit: 90,
      weekendLimit: 120,
      contentFiltering: "moderate",
    },
  },
];

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

export default async function ChildrenPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "parent") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Children</h1>
          <p className="text-muted-foreground mt-1">
            Manage your children's accounts and monitor their progress
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Child
        </Button>
      </div>

      {/* Children Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={child.avatarUrl || undefined} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {child.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                    <CardDescription>
                      Grade {child.gradeLevel} • Age {child.age}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Active {formatTimeAgo(child.lastActive)}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/parent/children/${child.id}`}>
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/parent/children/${child.id}/controls`}>
                        <Shield className="h-4 w-4 mr-2" />
                        Parental Controls
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Remove Child
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {child.progress.overall}%
                  </div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    🔥 {child.progress.streak}
                  </div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {child.progress.totalLessons}
                  </div>
                  <div className="text-xs text-muted-foreground">Lessons</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    🏆 {child.progress.achievements}
                  </div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
              </div>

              {/* Subject Progress */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Subject Progress</h4>
                {child.subjects.map((subject) => (
                  <div key={subject.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{subject.name}</span>
                      <span className="text-muted-foreground">
                        {subject.mastery}% mastery
                      </span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                ))}
              </div>

              {/* Controls Summary */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Daily limit: {child.controls.dailyLimit} min
                  </span>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {child.controls.contentFiltering} filtering
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/parent/children/${child.id}`}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/parent/children/${child.id}/controls`}>
                    <Shield className="h-4 w-4 mr-2" />
                    Controls
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Child CTA */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-1">Add Another Child</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a learner account for another child
          </p>
          <Button>Add Child</Button>
        </CardContent>
      </Card>
    </div>
  );
}
