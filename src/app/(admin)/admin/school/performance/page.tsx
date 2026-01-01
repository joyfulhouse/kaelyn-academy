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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  Download,
  GraduationCap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface PerformanceData {
  overview: {
    averageProgress: number;
    averageScore: number;
    lessonsCompleted: number;
    activeStudents: number;
    atRiskCount: number;
  };
  byGrade: {
    grade: string;
    students: number;
    avgProgress: number;
    avgScore: number;
    trend: "up" | "down" | "stable";
  }[];
  bySubject: {
    subject: string;
    avgProgress: number;
    avgScore: number;
    lessonsCompleted: number;
  }[];
  topPerformers: {
    id: string;
    name: string;
    grade: string;
    progress: number;
    score: number;
  }[];
}

export default function PerformanceAnalyticsPage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [gradeFilter, setGradeFilter] = useState("all");

  const fetchPerformanceData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ timeRange, grade: gradeFilter });
      const res = await fetch(`/api/admin/school/performance?${params}`);
      if (res.ok) {
        const responseData = await res.json();
        setData(responseData);
      } else {
        // Mock data
        setData({
          overview: {
            averageProgress: 67,
            averageScore: 78,
            lessonsCompleted: 4250,
            activeStudents: 312,
            atRiskCount: 12,
          },
          byGrade: [
            { grade: "K", students: 45, avgProgress: 72, avgScore: 85, trend: "up" },
            { grade: "1", students: 52, avgProgress: 68, avgScore: 79, trend: "up" },
            { grade: "2", students: 48, avgProgress: 71, avgScore: 82, trend: "stable" },
            { grade: "3", students: 55, avgProgress: 65, avgScore: 76, trend: "down" },
            { grade: "4", students: 50, avgProgress: 63, avgScore: 74, trend: "stable" },
            { grade: "5", students: 62, avgProgress: 66, avgScore: 77, trend: "up" },
          ],
          bySubject: [
            { subject: "Math", avgProgress: 65, avgScore: 76, lessonsCompleted: 1200 },
            { subject: "Reading", avgProgress: 72, avgScore: 81, lessonsCompleted: 1100 },
            { subject: "Science", avgProgress: 64, avgScore: 75, lessonsCompleted: 850 },
            { subject: "History", avgProgress: 68, avgScore: 79, lessonsCompleted: 600 },
            { subject: "Technology", avgProgress: 78, avgScore: 85, lessonsCompleted: 500 },
          ],
          topPerformers: [
            { id: "1", name: "Emma Johnson", grade: "4", progress: 95, score: 98 },
            { id: "2", name: "Liam Williams", grade: "5", progress: 92, score: 96 },
            { id: "3", name: "Sophia Chen", grade: "3", progress: 91, score: 94 },
            { id: "4", name: "Noah Davis", grade: "4", progress: 90, score: 93 },
            { id: "5", name: "Olivia Brown", grade: "5", progress: 89, score: 92 },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, gradeFilter]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
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
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">
            School-wide performance metrics and insights.
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="K">Kindergarten</SelectItem>
              <SelectItem value="1">1st Grade</SelectItem>
              <SelectItem value="2">2nd Grade</SelectItem>
              <SelectItem value="3">3rd Grade</SelectItem>
              <SelectItem value="4">4th Grade</SelectItem>
              <SelectItem value="5">5th Grade</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageProgress}%</div>
            <Progress value={data.overview.averageProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Assessment average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.lessonsCompleted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeStudents}</div>
            <p className="text-xs text-muted-foreground">Logged in this week</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.overview.atRiskCount}</div>
            <Link href="/admin/school/at-risk" className="text-xs text-primary hover:underline">
              View details →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades">
            <GraduationCap className="h-4 w-4 mr-2" />
            By Grade
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" />
            By Subject
          </TabsTrigger>
          <TabsTrigger value="top">
            <Award className="h-4 w-4 mr-2" />
            Top Performers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Grade</CardTitle>
              <CardDescription>
                Compare progress and scores across grade levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Avg. Progress</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byGrade.map((grade) => (
                    <TableRow key={grade.grade}>
                      <TableCell className="font-medium">
                        {grade.grade === "K" ? "Kindergarten" : `${grade.grade}${["st", "nd", "rd"][parseInt(grade.grade) - 1] || "th"} Grade`}
                      </TableCell>
                      <TableCell>{grade.students}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={grade.avgProgress} className="w-20" />
                          <span className="text-sm">{grade.avgProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{grade.avgScore}%</TableCell>
                      <TableCell>
                        {grade.trend === "up" && (
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Up
                          </Badge>
                        )}
                        {grade.trend === "down" && (
                          <Badge className="bg-red-100 text-red-800">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Down
                          </Badge>
                        )}
                        {grade.trend === "stable" && (
                          <Badge variant="outline">Stable</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/school/grades/compare?grade=${grade.grade}`}>
                            Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Subject</CardTitle>
              <CardDescription>
                Subject-level performance breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Avg. Progress</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Lessons Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bySubject.map((subject) => (
                    <TableRow key={subject.subject}>
                      <TableCell className="font-medium">{subject.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={subject.avgProgress} className="w-20" />
                          <span className="text-sm">{subject.avgProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{subject.avgScore}%</TableCell>
                      <TableCell>{subject.lessonsCompleted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Students with the highest progress and scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Avg. Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topPerformers.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.grade}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="w-20" />
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.score}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
