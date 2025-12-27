"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Plus, AlertTriangle, Clock, Star, Users, BookOpen, TrendingUp } from "lucide-react";

interface ClassSummary {
  id: string;
  name: string;
  gradeLevel: number;
  studentCount: number;
  averageProgress: number;
  averageMastery: number;
}

interface StudentAlert {
  id: string;
  studentName: string;
  type: "struggling" | "inactive" | "excelling";
  subject: string;
  message: string;
  learnerId: string;
}

interface SubjectDistribution {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface DashboardSummary {
  totalStudents: number;
  totalClasses: number;
  averageProgress: number;
  needAttention: number;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [alerts, setAlerts] = useState<StudentAlert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalStudents: 0,
    totalClasses: 0,
    averageProgress: 0,
    needAttention: 0,
  });
  const [subjectDistribution, setSubjectDistribution] = useState<SubjectDistribution[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/dashboard");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        setAlerts(data.alerts || []);
        setSummary(data.summary || {
          totalStudents: 0,
          totalClasses: 0,
          averageProgress: 0,
          needAttention: 0,
        });
        setSubjectDistribution(data.subjectDistribution || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const classPerformanceData = classes.map((c) => ({
    name: c.name.split(" - ")[1] || c.name,
    progress: c.averageProgress,
    mastery: c.averageMastery,
    students: c.studentCount,
  }));

  // Default subject distribution if none from API
  const displaySubjectDistribution = subjectDistribution.length > 0
    ? subjectDistribution
    : [
        { name: "Math", value: 0, color: "#3b82f6" },
        { name: "Reading", value: 0, color: "#10b981" },
        { name: "Science", value: 0, color: "#8b5cf6" },
        { name: "History", value: 0, color: "#f59e0b" },
      ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  const userName = session?.user?.name?.split(" ")[0] || "Teacher";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {userName}!</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your classes and students
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/teacher/assignments/new">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-indigo-100 text-sm">Total Students</span>
            </div>
            <div className="text-3xl font-bold">{summary.totalStudents}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-violet-100 text-sm">Classes</span>
            </div>
            <div className="text-3xl font-bold">{summary.totalClasses}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-purple-100 text-sm">Avg. Progress</span>
            </div>
            <div className="text-3xl font-bold">{summary.averageProgress}%</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-fuchsia-100 text-sm">Need Attention</span>
            </div>
            <div className="text-3xl font-bold">{summary.needAttention}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      {classes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Classes Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first class to start managing students
            </p>
            <Button asChild>
              <Link href="/teacher/classes">
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Class Performance */}
          <Card className="md:col-span-2 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Class Performance</CardTitle>
              <CardDescription>Average progress and mastery by class</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-foreground" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="fill-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      `${value ?? 0}%`,
                      name === "progress" ? "Progress" : "Mastery",
                    ]}
                  />
                  <Bar dataKey="progress" fill="#818cf8" radius={[4, 4, 0, 0]} name="Progress" />
                  <Bar dataKey="mastery" fill="#6366f1" radius={[4, 4, 0, 0]} name="Mastery" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Subject Focus</CardTitle>
              <CardDescription>Time spent by subject</CardDescription>
            </CardHeader>
            <CardContent>
              {displaySubjectDistribution.every((s) => s.value === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No subject data available yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={displaySubjectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {displaySubjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => [`${value ?? 0}%`, "Time"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {displaySubjectDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Alerts */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Student Alerts
            <span className="text-sm font-normal text-muted-foreground">
              ({alerts.length} alerts)
            </span>
          </CardTitle>
          <CardDescription>Students who need attention</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No alerts at this time. All students are doing well!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    alert.type === "struggling"
                      ? "bg-destructive/5 border-destructive/20"
                      : alert.type === "inactive"
                      ? "bg-yellow-500/5 border-yellow-500/20"
                      : "bg-green-500/5 border-green-500/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.type === "struggling"
                          ? "bg-destructive/10 text-destructive"
                          : alert.type === "inactive"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {alert.type === "struggling" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : alert.type === "inactive" ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <Star className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{alert.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.subject} • {alert.message}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className={
                      alert.type === "struggling"
                        ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                        : alert.type === "inactive"
                        ? "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
                        : "border-green-500/30 text-green-600 hover:bg-green-500/10"
                    }
                  >
                    <Link href={`/teacher/students?id=${alert.learnerId}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classes Overview */}
      {classes.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Quick overview of all your classes</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/teacher/classes">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/teacher/classes/${cls.id}`}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold">{cls.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Grade {cls.gradeLevel === 0 ? "K" : cls.gradeLevel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {cls.studentCount}
                      </div>
                      <div className="text-xs text-muted-foreground">students</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{cls.averageProgress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"
                          style={{ width: `${cls.averageProgress}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mastery</span>
                        <span>{cls.averageMastery}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full"
                          style={{ width: `${cls.averageMastery}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
