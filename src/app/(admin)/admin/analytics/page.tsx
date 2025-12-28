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

interface Changes {
  users: string;
  activeUsers: string;
  organizations: string;
  lessonsCompleted: string;
  averageMastery: string;
  totalTimeSpent: string;
}

interface UserGrowthData {
  month: string;
  users: number;
  active: number;
  [key: string]: string | number;
}

interface RoleDistributionData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface DailyActivityData {
  day: number;
  lessons: number;
  time: number;
  [key: string]: string | number;
}

interface OrgPerformanceData {
  name: string;
  students: number;
  mastery: number;
  [key: string]: string | number;
}

interface SubjectEngagementData {
  subject: string;
  sessions: number;
  avgTime: number;
}

interface AIUsageData {
  tutorSessions: number;
  problemsGenerated: number;
  helpfulRating: number;
  avgSessionDuration: number;
}

interface AnalyticsData {
  stats: PlatformStats;
  changes: Changes;
  userGrowth: UserGrowthData[];
  roleDistribution: RoleDistributionData[];
  dailyActivity: DailyActivityData[];
  organizationPerformance: OrgPerformanceData[];
  subjectEngagement: SubjectEngagementData[];
  aiUsage: AIUsageData;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const { stats, changes, userGrowth, roleDistribution, dailyActivity, organizationPerformance, subjectEngagement, aiUsage } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">
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
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(stats.totalUsers)}
            </div>
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className={`text-xs mt-1 ${changes.users.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {changes.users} from last period
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(stats.activeUsers)}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
            <div className={`text-xs mt-1 ${changes.activeUsers.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {changes.activeUsers} from last period
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.totalOrganizations}
            </div>
            <div className="text-sm text-muted-foreground">Organizations</div>
            <div className={`text-xs mt-1 ${changes.organizations.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {changes.organizations} this period
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(stats.totalLessonsCompleted)}
            </div>
            <div className="text-sm text-muted-foreground">Lessons Done</div>
            <div className={`text-xs mt-1 ${changes.lessonsCompleted.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {changes.lessonsCompleted} from last period
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.averageMastery}%
            </div>
            <div className="text-sm text-muted-foreground">Avg. Mastery</div>
            <div className={`text-xs mt-1 ${changes.averageMastery.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {changes.averageMastery} from last period
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(Math.round(stats.totalTimeSpent / 60))}h
            </div>
            <div className="text-sm text-muted-foreground">Total Study Time</div>
            <div className={`text-xs mt-1 ${changes.totalTimeSpent.startsWith("+") ? "text-success" : "text-destructive"}`}>
              {changes.totalTimeSpent} from last period
            </div>
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
            <CardDescription>
              Lessons completed and study time over the last {dateRange === "7d" ? "7" : dateRange === "30d" ? "30" : "90"} days
            </CardDescription>
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
                      name === "lessons" ? numValue : formatTime(numValue),
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
                  name="lessons"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="time"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="time"
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
          {organizationPerformance.length > 0 && organizationPerformance[0].students > 0 ? (
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
                <Bar dataKey="mastery" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="mastery" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No organization data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Engagement */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Subject Engagement</CardTitle>
          <CardDescription>Sessions and average time by subject</CardDescription>
        </CardHeader>
        <CardContent>
          {subjectEngagement.length > 0 ? (
            <div className="space-y-4">
              {subjectEngagement.map((subject) => {
                const maxSessions = Math.max(...subjectEngagement.map((s) => s.sessions), 1);
                return (
                  <div key={subject.subject} className="flex items-center gap-4">
                    <div className="w-20 font-medium text-foreground">{subject.subject}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-muted rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-lg"
                          style={{ width: `${(subject.sessions / maxSessions) * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-sm font-medium text-foreground">
                            {formatNumber(subject.sessions)} sessions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <div className="text-sm font-medium text-foreground">{formatTime(subject.avgTime)}</div>
                      <div className="text-xs text-muted-foreground">avg. session</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No subject engagement data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Usage Stats */}
      <Card className="border-0 shadow-md border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            AI Agent Usage
          </CardTitle>
          <CardDescription>AI tutoring and assistance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {formatNumber(aiUsage.tutorSessions)}
              </div>
              <div className="text-sm text-muted-foreground">Tutor Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {formatNumber(aiUsage.problemsGenerated)}
              </div>
              <div className="text-sm text-muted-foreground">Practice Problems Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {aiUsage.helpfulRating > 0 ? `${aiUsage.helpfulRating}%` : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">Helpful Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {aiUsage.avgSessionDuration > 0 ? `${aiUsage.avgSessionDuration}min` : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Session Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
