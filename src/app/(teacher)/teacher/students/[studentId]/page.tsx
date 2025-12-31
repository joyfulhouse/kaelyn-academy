"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  Target,
  Calendar,
  Mail,
  MessageSquare,
  StickyNote,
  BarChart3,
  Trophy,
  Flame,
} from "lucide-react";
import Image from "next/image";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  gradeLevel: number;
  enrolledAt: string;
  parentName: string;
  parentEmail: string;
}

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  masteryLevel: number;
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  totalTimeSpent: number;
  lastActivityAt: string | null;
}

interface RecentActivity {
  id: string;
  type: "lesson" | "activity" | "achievement";
  title: string;
  subject: string;
  score?: number;
  passed?: boolean;
  completedAt: string;
}

interface StudentAchievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: string;
  earnedAt: string;
}

interface ClassEnrollment {
  id: string;
  classId: string;
  className: string;
  enrolledAt: string;
  status: string;
}

interface StudentData {
  student: StudentProfile;
  subjectProgress: SubjectProgress[];
  recentActivity: RecentActivity[];
  achievements: StudentAchievement[];
  enrollments: ClassEnrollment[];
  stats: {
    overallProgress: number;
    overallMastery: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number;
    totalAchievements: number;
    totalPoints: number;
  };
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function formatGradeLevel(grade: number): string {
  if (grade === 0) return "Kindergarten";
  return `Grade ${grade}`;
}

function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getProgressColor(value: number): string {
  if (value >= 80) return "text-success";
  if (value >= 50) return "text-warning";
  return "text-destructive";
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher/students/${studentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Student not found");
          return;
        }
        throw new Error("Failed to fetch student");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId, fetchData]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/teacher/students"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{error || "Student not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, subjectProgress, recentActivity, achievements, enrollments, stats } = data;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/teacher/students"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24">
          <AvatarImage src={student.avatarUrl ?? undefined} />
          <AvatarFallback className="text-2xl">
            {student.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <Badge variant="outline">{formatGradeLevel(student.gradeLevel)}</Badge>
            {stats.currentStreak > 0 && (
              <Badge className="bg-warning gap-1">
                <Flame className="h-3 w-3" />
                {stats.currentStreak} day streak
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground space-y-1">
            <p>Parent: {student.parentName}</p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {student.parentEmail}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Enrolled {formatDate(student.enrolledAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message Parent
          </Button>
          <Button variant="outline" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <div className={`text-2xl font-bold ${getProgressColor(stats.overallProgress)}`}>
                  {stats.overallProgress}%
                </div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-success" />
              <div>
                <div className={`text-2xl font-bold ${getProgressColor(stats.overallMastery)}`}>
                  {stats.overallMastery}%
                </div>
                <div className="text-xs text-muted-foreground">Mastery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-warning" />
              <div>
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-info" />
              <div>
                <div className="text-2xl font-bold">{stats.longestStreak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-role-teacher" />
              <div>
                <div className="text-2xl font-bold">{formatTimeSpent(stats.totalTimeSpent)}</div>
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
                <div className="text-2xl font-bold">{stats.totalAchievements}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList>
          <TabsTrigger value="progress">Subject Progress</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements ({achievements.length})</TabsTrigger>
          <TabsTrigger value="classes">Classes ({enrollments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {subjectProgress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No subject progress yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {subjectProgress.map((sp) => (
                    <div key={sp.subjectId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{sp.subjectName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {sp.completedLessons} / {sp.totalLessons} lessons
                            {sp.currentStreak > 0 && (
                              <span className="ml-2 text-warning">
                                {sp.currentStreak}d streak
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getProgressColor(sp.masteryLevel)}`}>
                            {Math.round(sp.masteryLevel)}%
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeSpent(sp.totalTimeSpent)} spent
                          </p>
                        </div>
                      </div>
                      <Progress value={sp.masteryLevel} className="h-2" />
                      {sp.lastActivityAt && (
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatTimeAgo(sp.lastActivityAt)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest learning activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {activity.type === "achievement" ? (
                              <Trophy className="h-4 w-4 text-warning" />
                            ) : activity.type === "lesson" ? (
                              <BookOpen className="h-4 w-4 text-primary" />
                            ) : (
                              <Target className="h-4 w-4 text-info" />
                            )}
                            <span className="font-medium">{activity.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {activity.subject}
                        </TableCell>
                        <TableCell>
                          {activity.type === "achievement" ? (
                            <Badge className="bg-warning">Earned</Badge>
                          ) : activity.passed !== undefined ? (
                            activity.passed ? (
                              <Badge className="bg-success">
                                {activity.score !== undefined ? `${activity.score}%` : "Passed"}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                {activity.score !== undefined ? `${activity.score}%` : "Needs Review"}
                              </Badge>
                            )
                          ) : (
                            <Badge variant="secondary">Completed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTimeAgo(activity.completedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                {achievements.length} achievement{achievements.length !== 1 ? "s" : ""} earned
                ({stats.totalPoints} points)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No achievements yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center p-4 border rounded-lg text-center"
                    >
                      {achievement.iconUrl ? (
                        <Image
                          src={achievement.iconUrl}
                          alt={achievement.name}
                          width={48}
                          height={48}
                          className="mb-2"
                        />
                      ) : (
                        <Award className="h-12 w-12 text-warning mb-2" />
                      )}
                      <h4 className="font-medium text-sm">{achievement.name}</h4>
                      {achievement.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(achievement.earnedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Enrollments</CardTitle>
              <CardDescription>Classes this student is enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Not enrolled in any classes</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <Link
                            href={`/teacher/classes/${enrollment.classId}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {enrollment.className}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={enrollment.status === "active" ? "default" : "secondary"}
                          >
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(enrollment.enrolledAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
