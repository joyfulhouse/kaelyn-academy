"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Download,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCard {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  target?: number;
}

interface SubjectMetric {
  subject: string;
  avgScore: number;
  completion: number;
  engagement: number;
  trend: "up" | "down" | "stable";
}

export default function SchoolMetricsPage() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [subjectMetrics, setSubjectMetrics] = useState<SubjectMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("month");

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/school/metrics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || []);
        setSubjectMetrics(data.subjectMetrics || []);
      } else {
        // Mock data
        setMetrics([
          { id: "1", name: "Active Students", value: 312, unit: "students", change: 5.2, trend: "up", target: 350 },
          { id: "2", name: "Average Score", value: 78, unit: "%", change: 3.1, trend: "up", target: 80 },
          { id: "3", name: "Completion Rate", value: 67, unit: "%", change: -2.4, trend: "down", target: 75 },
          { id: "4", name: "Daily Active Users", value: 245, unit: "users", change: 8.7, trend: "up" },
          { id: "5", name: "Avg. Time per Session", value: 32, unit: "min", change: 1.5, trend: "up", target: 30 },
          { id: "6", name: "Lessons Completed", value: 4523, unit: "lessons", change: 12.3, trend: "up" },
          { id: "7", name: "AI Tutor Sessions", value: 892, unit: "sessions", change: 25.1, trend: "up" },
          { id: "8", name: "At-Risk Students", value: 12, unit: "students", change: -15.0, trend: "up" },
        ]);
        setSubjectMetrics([
          { subject: "Mathematics", avgScore: 76, completion: 72, engagement: 85, trend: "up" },
          { subject: "Reading", avgScore: 81, completion: 68, engagement: 79, trend: "stable" },
          { subject: "Science", avgScore: 74, completion: 65, engagement: 82, trend: "up" },
          { subject: "History", avgScore: 79, completion: 70, engagement: 71, trend: "down" },
          { subject: "Technology", avgScore: 85, completion: 78, engagement: 92, trend: "up" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  const handleExport = () => {
    // Export logic
    console.log("Exporting metrics...");
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (trend: string, isPositive: boolean = true) => {
    if (trend === "up") return isPositive ? "text-green-600" : "text-red-600";
    if (trend === "down") return isPositive ? "text-red-600" : "text-green-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Metrics</h1>
          <p className="text-muted-foreground">
            Key performance indicators and analytics for your school.
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.slice(0, 4).map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value.toLocaleString()} {metric.unit !== "students" && metric.unit !== "users" && metric.unit !== "lessons" && metric.unit !== "sessions" ? metric.unit : ""}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                  {metric.change > 0 ? "+" : ""}{metric.change}% from last period
                </span>
                {metric.target && (
                  <span className="text-xs text-muted-foreground">
                    Target: {metric.target}
                  </span>
                )}
              </div>
              {metric.target && (
                <Progress
                  value={(metric.value / metric.target) * 100}
                  className="mt-2 h-1"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.slice(4).map((metric) => (
          <Card key={metric.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-xl font-bold">
                    {metric.value.toLocaleString()}
                    {metric.unit === "min" ? " min" : metric.unit === "%" ? "%" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-sm ${getTrendColor(metric.trend, metric.name !== "At-Risk Students")}`}>
                    {metric.change > 0 ? "+" : ""}{metric.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>
            Performance metrics broken down by subject area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectMetrics.map((subject) => (
                <TableRow key={subject.subject}>
                  <TableCell className="font-medium">{subject.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={subject.avgScore} className="w-16" />
                      <span>{subject.avgScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={subject.completion} className="w-16" />
                      <span>{subject.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={subject.engagement} className="w-16" />
                      <span>{subject.engagement}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {subject.trend === "up" && (
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Improving
                      </Badge>
                    )}
                    {subject.trend === "down" && (
                      <Badge className="bg-red-100 text-red-800">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Declining
                      </Badge>
                    )}
                    {subject.trend === "stable" && (
                      <Badge variant="outline">Stable</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Technology has highest engagement (92%)</li>
              <li>• Reading maintains best avg score (81%)</li>
              <li>• AI Tutor usage increased 25%</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Areas to Watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Completion rate below target (67% vs 75%)</li>
              <li>• History engagement declining</li>
              <li>• Science completion needs attention</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Focus intervention on at-risk students</li>
              <li>• Review History curriculum pacing</li>
              <li>• Expand AI Tutor for Math support</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
