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
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  totalLessonsCompleted: number;
  averageMastery: number;
  totalTimeSpent: number;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Mock platform stats
  const [stats] = useState<PlatformStats>({
    totalUsers: 2847,
    activeUsers: 1523,
    totalOrganizations: 42,
    totalLessonsCompleted: 48392,
    averageMastery: 74,
    totalTimeSpent: 892340,
  });

  const fetchData = useCallback(async () => {
    // TODO: Fetch from API based on dateRange
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, dateRange]);

  // Mock trend data
  const userGrowth = [
    { month: "Aug", users: 1200, active: 890 },
    { month: "Sep", users: 1580, active: 1100 },
    { month: "Oct", users: 1920, active: 1250 },
    { month: "Nov", users: 2340, active: 1380 },
    { month: "Dec", users: 2847, active: 1523 },
  ];

  const dailyActivity = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    lessons: Math.floor(Math.random() * 500) + 1000,
    time: Math.floor(Math.random() * 5000) + 20000,
  }));

  const roleDistribution = [
    { name: "Learners", value: 2150, color: "#3b82f6" },
    { name: "Parents", value: 420, color: "#10b981" },
    { name: "Teachers", value: 185, color: "#8b5cf6" },
    { name: "Admins", value: 92, color: "#f59e0b" },
  ];

  const organizationPerformance = [
    { name: "Lincoln Elementary", students: 320, mastery: 82 },
    { name: "Washington Middle", students: 280, mastery: 76 },
    { name: "Jefferson High", students: 245, mastery: 71 },
    { name: "Roosevelt Academy", students: 198, mastery: 79 },
    { name: "Adams Charter", students: 165, mastery: 84 },
  ];

  const subjectEngagement = [
    { subject: "Math", sessions: 12400, avgTime: 28 },
    { subject: "Reading", sessions: 10800, avgTime: 32 },
    { subject: "Science", sessions: 8200, avgTime: 25 },
    { subject: "History", sessions: 6500, avgTime: 22 },
    { subject: "Art", sessions: 4100, avgTime: 35 },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">
            Platform-wide metrics and insights
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(range)}
              className={dateRange === range ? "bg-blue-600" : ""}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalUsers)}
            </div>
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-xs text-green-600 mt-1">+12% from last month</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.activeUsers)}
            </div>
            <div className="text-sm text-gray-500">Active Users</div>
            <div className="text-xs text-green-600 mt-1">+8% from last month</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalOrganizations}
            </div>
            <div className="text-sm text-gray-500">Organizations</div>
            <div className="text-xs text-green-600 mt-1">+5 this month</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalLessonsCompleted)}
            </div>
            <div className="text-sm text-gray-500">Lessons Done</div>
            <div className="text-xs text-green-600 mt-1">+15% from last month</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {stats.averageMastery}%
            </div>
            <div className="text-sm text-gray-500">Avg. Mastery</div>
            <div className="text-xs text-green-600 mt-1">+3% from last month</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(Math.round(stats.totalTimeSpent / 60))}h
            </div>
            <div className="text-sm text-gray-500">Total Study Time</div>
            <div className="text-xs text-green-600 mt-1">+18% from last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatNumber(Number(value ?? 0)), "Users"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {roleDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card className="md:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Lessons completed and study time over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => {
                    const numValue = Number(value ?? 0);
                    return [
                      name === "lessons" ? numValue : `${Math.round(numValue / 60)} hours`,
                      name === "lessons" ? "Lessons" : "Study Time",
                    ];
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="lessons"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Lessons"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="time"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Study Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Organization Performance */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Top Organizations</CardTitle>
          <CardDescription>Performance by organization</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={organizationPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  name === "mastery" ? `${value ?? 0}%` : (value ?? 0),
                  name === "mastery" ? "Mastery" : "Students",
                ]}
              />
              <Bar dataKey="mastery" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Mastery" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subject Engagement */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Subject Engagement</CardTitle>
          <CardDescription>Sessions and average time by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectEngagement.map((subject) => (
              <div key={subject.subject} className="flex items-center gap-4">
                <div className="w-20 font-medium">{subject.subject}</div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg"
                      style={{ width: `${(subject.sessions / 12400) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-sm font-medium text-gray-700">
                        {formatNumber(subject.sessions)} sessions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right">
                  <div className="text-sm font-medium">{formatTime(subject.avgTime)}</div>
                  <div className="text-xs text-gray-500">avg. session</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Usage Stats */}
      <Card className="border-0 shadow-md border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Agent Usage
          </CardTitle>
          <CardDescription>AI tutoring and assistance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">12,847</div>
              <div className="text-sm text-gray-500">Tutor Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4,521</div>
              <div className="text-sm text-gray-500">Practice Problems Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-500">Helpful Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">3.2min</div>
              <div className="text-sm text-gray-500">Avg. Session Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
