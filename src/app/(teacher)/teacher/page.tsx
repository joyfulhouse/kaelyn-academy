"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  const [classes] = useState<ClassSummary[]>([
    { id: "1", name: "3rd Grade - Section A", gradeLevel: 3, studentCount: 24, averageProgress: 72, averageMastery: 78 },
    { id: "2", name: "3rd Grade - Section B", gradeLevel: 3, studentCount: 22, averageProgress: 68, averageMastery: 71 },
    { id: "3", name: "4th Grade - Section A", gradeLevel: 4, studentCount: 25, averageProgress: 75, averageMastery: 80 },
  ]);

  const [alerts] = useState<StudentAlert[]>([
    { id: "1", studentName: "Alex M.", type: "struggling", subject: "Math", message: "Struggling with fractions for 3 days" },
    { id: "2", studentName: "Jordan K.", type: "inactive", subject: "All", message: "No activity in the last 5 days" },
    { id: "3", studentName: "Sam P.", type: "excelling", subject: "Science", message: "Completed all units ahead of schedule" },
    { id: "4", studentName: "Taylor R.", type: "struggling", subject: "Reading", message: "Below 50% mastery in comprehension" },
  ]);

  const fetchData = useCallback(async () => {
    // TODO: Fetch data from API
    setLoading(false);
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

  const subjectDistribution = [
    { name: "Math", value: 28, color: "#3b82f6" },
    { name: "Reading", value: 25, color: "#10b981" },
    { name: "Science", value: 22, color: "#8b5cf6" },
    { name: "History", value: 15, color: "#f59e0b" },
    { name: "Art", value: 10, color: "#ec4899" },
  ];

  const totalStudents = classes.reduce((acc, c) => acc + c.studentCount, 0);
  const averageProgress = Math.round(
    classes.reduce((acc, c) => acc + c.averageProgress, 0) / classes.length
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, Teacher!</h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s an overview of your classes and students
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            Export Reports
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{totalStudents}</div>
            <div className="text-indigo-100 text-sm">Total Students</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-violet-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{classes.length}</div>
            <div className="text-violet-100 text-sm">Classes</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{averageProgress}%</div>
            <div className="text-purple-100 text-sm">Avg. Progress</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{alerts.filter((a) => a.type === "struggling").length}</div>
            <div className="text-fuchsia-100 text-sm">Need Attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
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
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value ?? 0}%`, "Time"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {subjectDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Alerts */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔔 Student Alerts
            <span className="text-sm font-normal text-gray-500">
              ({alerts.length} alerts)
            </span>
          </CardTitle>
          <CardDescription>Students who need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  alert.type === "struggling"
                    ? "bg-red-50 border-red-200"
                    : alert.type === "inactive"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.type === "struggling"
                        ? "bg-red-100 text-red-600"
                        : alert.type === "inactive"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {alert.type === "struggling"
                      ? "⚠"
                      : alert.type === "inactive"
                      ? "⏰"
                      : "⭐"}
                  </div>
                  <div>
                    <div className="font-medium">{alert.studentName}</div>
                    <div className="text-sm text-gray-600">
                      {alert.subject} • {alert.message}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    alert.type === "struggling"
                      ? "border-red-300 text-red-700 hover:bg-red-100"
                      : alert.type === "inactive"
                      ? "border-amber-300 text-amber-700 hover:bg-amber-100"
                      : "border-green-300 text-green-700 hover:bg-green-100"
                  }
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classes Overview */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Quick overview of all your classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">{cls.name}</div>
                    <div className="text-sm text-gray-500">
                      Grade {cls.gradeLevel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      {cls.studentCount}
                    </div>
                    <div className="text-xs text-gray-500">students</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{cls.averageProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full"
                        style={{ width: `${cls.averageMastery}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
