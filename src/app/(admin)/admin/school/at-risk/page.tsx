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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  Search,
  Mail,
  FileText,
  Eye,
  Users,
  BookOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AtRiskStudent {
  id: string;
  name: string;
  grade: string;
  teacher: string;
  riskLevel: "high" | "medium" | "low";
  progress: number;
  avgScore: number;
  lastActive: string;
  daysInactive: number;
  concerns: string[];
}

export default function AtRiskStudentsPage() {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  const fetchAtRiskStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (riskFilter !== "all") params.set("risk", riskFilter);
      if (gradeFilter !== "all") params.set("grade", gradeFilter);

      const res = await fetch(`/api/admin/school/at-risk?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      } else {
        // Mock data
        setStudents([
          {
            id: "1",
            name: "Alex Thompson",
            grade: "3",
            teacher: "Mrs. Miller",
            riskLevel: "high",
            progress: 23,
            avgScore: 45,
            lastActive: "2025-12-20",
            daysInactive: 11,
            concerns: ["Low engagement", "Failing assessments", "Inactivity"],
          },
          {
            id: "2",
            name: "Jamie Rodriguez",
            grade: "4",
            teacher: "Mr. Chen",
            riskLevel: "high",
            progress: 28,
            avgScore: 52,
            lastActive: "2025-12-25",
            daysInactive: 6,
            concerns: ["Struggling with math", "Low progress"],
          },
          {
            id: "3",
            name: "Morgan Lee",
            grade: "2",
            teacher: "Ms. Wilson",
            riskLevel: "medium",
            progress: 42,
            avgScore: 61,
            lastActive: "2025-12-28",
            daysInactive: 3,
            concerns: ["Declining scores", "Needs reading support"],
          },
          {
            id: "4",
            name: "Taylor Kim",
            grade: "5",
            teacher: "Mr. Brown",
            riskLevel: "medium",
            progress: 38,
            avgScore: 58,
            lastActive: "2025-12-29",
            daysInactive: 2,
            concerns: ["Science struggles", "Inconsistent participation"],
          },
          {
            id: "5",
            name: "Jordan Patel",
            grade: "3",
            teacher: "Mrs. Miller",
            riskLevel: "low",
            progress: 51,
            avgScore: 65,
            lastActive: "2025-12-30",
            daysInactive: 1,
            concerns: ["Slight decline in math"],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch at-risk students:", error);
    } finally {
      setLoading(false);
    }
  }, [riskFilter, gradeFilter]);

  useEffect(() => {
    fetchAtRiskStudents();
  }, [fetchAtRiskStudents]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const highRiskCount = students.filter((s) => s.riskLevel === "high").length;
  const mediumRiskCount = students.filter((s) => s.riskLevel === "medium").length;
  const lowRiskCount = students.filter((s) => s.riskLevel === "low").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">At-Risk Students</h1>
          <p className="text-muted-foreground">
            Identify and support students who need additional attention.
          </p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total At-Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Students identified</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">Immediate attention needed</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">Early warning signs</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students List</CardTitle>
          <CardDescription>
            Students flagged based on progress, scores, and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {["K", "1", "2", "3", "4", "5"].map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade === "K" ? "Kindergarten" : `Grade ${grade}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead>Days Inactive</TableHead>
                <TableHead>Concerns</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.teacher}</TableCell>
                  <TableCell>{getRiskBadge(student.riskLevel)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={student.progress}
                        className={`w-16 ${
                          student.progress < 30
                            ? "[&>div]:bg-red-500"
                            : student.progress < 50
                            ? "[&>div]:bg-yellow-500"
                            : ""
                        }`}
                      />
                      <span className="text-sm">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={student.avgScore < 60 ? "text-red-600" : ""}>
                      {student.avgScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={student.daysInactive > 7 ? "text-red-600 font-medium" : ""}>
                      {student.daysInactive} days
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {student.concerns.slice(0, 2).map((concern, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {concern}
                        </Badge>
                      ))}
                      {student.concerns.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.concerns.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" title="View profile">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Contact parent">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Intervention Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Interventions</CardTitle>
          <CardDescription>
            Suggested actions for at-risk students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Parent Outreach</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {highRiskCount + mediumRiskCount} students would benefit from parent conferences
              </p>
              <Button variant="link" className="p-0 h-auto mt-2">
                Send batch emails →
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Tutoring Support</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {highRiskCount} students recommended for 1-on-1 AI tutoring
              </p>
              <Button variant="link" className="p-0 h-auto mt-2">
                Enable tutoring →
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Progress Reports</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate detailed reports for all at-risk students
              </p>
              <Button variant="link" className="p-0 h-auto mt-2">
                Generate reports →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
