"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Award,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GradeComparison {
  grade: string;
  students: number;
  avgProgress: number;
  avgScore: number;
  lessonsCompleted: number;
  atRiskCount: number;
  topSubject: string;
  weakestSubject: string;
  trend: "up" | "down" | "stable";
}

export default function GradeComparisonPage() {
  const searchParams = useSearchParams();
  const initialGrade = searchParams.get("grade") || "all";

  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [comparisons, setComparisons] = useState<GradeComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisons();
  }, []);

  const fetchComparisons = async () => {
    try {
      const res = await fetch("/api/admin/school/grades/compare");
      if (res.ok) {
        const data = await res.json();
        setComparisons(data.comparisons || []);
      } else {
        // Mock data
        setComparisons([
          { grade: "K", students: 45, avgProgress: 72, avgScore: 85, lessonsCompleted: 680, atRiskCount: 1, topSubject: "Reading", weakestSubject: "Math", trend: "up" },
          { grade: "1", students: 52, avgProgress: 68, avgScore: 79, lessonsCompleted: 920, atRiskCount: 2, topSubject: "Math", weakestSubject: "Science", trend: "up" },
          { grade: "2", students: 48, avgProgress: 71, avgScore: 82, lessonsCompleted: 1050, atRiskCount: 1, topSubject: "Reading", weakestSubject: "History", trend: "stable" },
          { grade: "3", students: 55, avgProgress: 65, avgScore: 76, lessonsCompleted: 1320, atRiskCount: 4, topSubject: "Science", weakestSubject: "Math", trend: "down" },
          { grade: "4", students: 50, avgProgress: 63, avgScore: 74, lessonsCompleted: 1180, atRiskCount: 3, topSubject: "History", weakestSubject: "Reading", trend: "stable" },
          { grade: "5", students: 62, avgProgress: 66, avgScore: 77, lessonsCompleted: 1550, atRiskCount: 1, topSubject: "Technology", weakestSubject: "Math", trend: "up" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch grade comparisons:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComparisons = selectedGrade === "all"
    ? comparisons
    : comparisons.filter((c) => c.grade === selectedGrade);

  const totals = {
    students: comparisons.reduce((sum, c) => sum + c.students, 0),
    avgProgress: Math.round(comparisons.reduce((sum, c) => sum + c.avgProgress, 0) / comparisons.length),
    avgScore: Math.round(comparisons.reduce((sum, c) => sum + c.avgScore, 0) / comparisons.length),
    atRisk: comparisons.reduce((sum, c) => sum + c.atRiskCount, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold">Grade Comparison</h1>
          <p className="text-muted-foreground">
            Compare performance metrics across grade levels.
          </p>
        </div>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {comparisons.map((c) => (
              <SelectItem key={c.grade} value={c.grade}>
                {c.grade === "K" ? "Kindergarten" : `Grade ${c.grade}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.avgProgress}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.avgScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totals.atRisk}</div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grade-by-Grade Comparison</CardTitle>
          <CardDescription>
            Detailed metrics for each grade level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Top Subject</TableHead>
                <TableHead>Needs Work</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>At-Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComparisons.map((comparison) => (
                <TableRow key={comparison.grade}>
                  <TableCell className="font-medium">
                    {comparison.grade === "K" ? "Kindergarten" : `Grade ${comparison.grade}`}
                  </TableCell>
                  <TableCell>{comparison.students}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={comparison.avgProgress} className="w-16" />
                      <span className="text-sm">{comparison.avgProgress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{comparison.avgScore}%</TableCell>
                  <TableCell>{comparison.lessonsCompleted}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {comparison.topSubject}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {comparison.weakestSubject}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {comparison.trend === "up" && (
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Up
                      </Badge>
                    )}
                    {comparison.trend === "down" && (
                      <Badge className="bg-red-100 text-red-800">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Down
                      </Badge>
                    )}
                    {comparison.trend === "stable" && (
                      <Badge variant="outline">Stable</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {comparison.atRiskCount > 0 ? (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {comparison.atRiskCount}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">0</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
