"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Award,
  Mail,
  UserPlus,
  ClipboardList,
  AlertTriangle,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  gradeLevel: number;
  academicYear: string | null;
  isActive: boolean;
  createdAt: string;
  studentCount: number;
  averageProgress: number;
  averageMastery: number;
}

interface Student {
  id: string;
  name: string;
  gradeLevel: number;
  averageMastery: number;
  averageProgress: number;
  enrolledAt: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string | null;
  totalPoints: number;
  submissions: {
    submitted: number;
    total: number;
    graded: number;
  };
  avgScore: number | null;
  status: string;
}

function formatTimeAgo(dateStr: string): string {
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

function getStatusBadge(mastery: number) {
  if (mastery >= 85) return <Badge className="bg-success">Excelling</Badge>;
  if (mastery < 50) return <Badge variant="destructive">Struggling</Badge>;
  if (mastery < 65) return <Badge className="bg-warning">Needs Attention</Badge>;
  return <Badge variant="secondary">Active</Badge>;
}

function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch class details and students
      const classResponse = await fetch(`/api/teacher/classes/${classId}`);
      if (!classResponse.ok) {
        if (classResponse.status === 404) {
          setError("Class not found");
          return;
        }
        throw new Error("Failed to fetch class");
      }
      const classResult = await classResponse.json();
      setClassData(classResult.class);
      setStudents(classResult.students || []);

      // Fetch assignments for this class
      const assignmentsResponse = await fetch("/api/teacher/assignments");
      if (assignmentsResponse.ok) {
        const assignmentsResult = await assignmentsResponse.json();
        // Filter assignments for this class
        const classAssignments = (assignmentsResult.assignments || []).filter(
          (a: Assignment & { classId: string }) => a.classId === classId
        );
        setAssignments(classAssignments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      fetchData();
    }
  }, [classId, fetchData]);

  if (loading) {
    return <ClassDetailSkeleton />;
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              {error || "Class not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const strugglingCount = students.filter((s) => s.averageMastery < 50).length;
  const needsAttentionCount = students.filter(
    (s) => s.averageMastery >= 50 && s.averageMastery < 65
  ).length;

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{classData.name}</h1>
              <Badge variant="outline">
                Grade {classData.gradeLevel === 0 ? "K" : classData.gradeLevel}
              </Badge>
              {classData.isActive && (
                <Badge className="bg-success">Active</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{classData.description || "No description"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Students
            </Button>
            <Button className="gap-2" asChild>
              <Link href={`/teacher/assignments/new?classId=${classId}`}>
                <ClipboardList className="h-4 w-4" />
                Create Assignment
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{students.length}</div>
                <div className="text-xs text-muted-foreground">Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-info" />
              <div>
                <div className="text-2xl font-bold">{classData.averageProgress}%</div>
                <div className="text-xs text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold">{classData.averageMastery}%</div>
                <div className="text-xs text-muted-foreground">Avg Mastery</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-role-teacher" />
              <div>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <div className="text-xs text-muted-foreground">Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <div className="text-2xl font-bold">{strugglingCount + needsAttentionCount}</div>
                <div className="text-xs text-muted-foreground">Need Help</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>
                Track individual student progress and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No students enrolled in this class yet.</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Students
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Mastery</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {student.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Grade {student.gradeLevel === 0 ? "K" : student.gradeLevel}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.averageMastery)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.averageProgress} className="h-2 w-16" />
                            <span className="text-sm">{student.averageProgress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.averageMastery} className="h-2 w-16" />
                            <span className="text-sm">{student.averageMastery}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatTimeAgo(student.enrolledAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Progress</DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Parent
                              </DropdownMenuItem>
                              <DropdownMenuItem>Add Note</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove from Class
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>
                  Manage assignments and track submissions
                </CardDescription>
              </div>
              <Button className="gap-2" asChild>
                <Link href={`/teacher/assignments/new?classId=${classId}`}>
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No assignments for this class yet.</p>
                  <Button className="mt-4 gap-2" asChild>
                    <Link href={`/teacher/assignments/new?classId=${classId}`}>
                      <Plus className="h-4 w-4" />
                      Create Assignment
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => {
                      const isPastDue = assignment.dueDate
                        ? new Date(assignment.dueDate) < new Date()
                        : false;
                      const isComplete =
                        assignment.submissions.submitted === assignment.submissions.total &&
                        assignment.submissions.total > 0;

                      return (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/teacher/assignments/${assignment.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {assignment.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className={isPastDue ? "text-muted-foreground" : ""}>
                              {assignment.dueDate
                                ? new Date(assignment.dueDate).toLocaleDateString()
                                : "No due date"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={
                                  assignment.submissions.total > 0
                                    ? (assignment.submissions.submitted /
                                        assignment.submissions.total) *
                                      100
                                    : 0
                                }
                                className="h-2 w-16"
                              />
                              <span className="text-sm">
                                {assignment.submissions.submitted}/{assignment.submissions.total}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {assignment.avgScore !== null ? (
                              <span className="font-medium">{assignment.avgScore}%</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isComplete ? (
                              <Badge className="bg-success">Complete</Badge>
                            ) : isPastDue ? (
                              <Badge variant="destructive">Past Due</Badge>
                            ) : (
                              <Badge variant="secondary">In Progress</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/teacher/assignments/${assignment.id}`}>
                                    View Submissions
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                                    Edit Assignment
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/teacher/assignments/${assignment.id}/grade`}>
                                    Grade All
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Delete Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Settings</CardTitle>
              <CardDescription>
                Configure class details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Class Name</label>
                  <p className="text-muted-foreground">{classData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Grade Level</label>
                  <p className="text-muted-foreground">
                    Grade {classData.gradeLevel === 0 ? "K" : classData.gradeLevel}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Academic Year</label>
                  <p className="text-muted-foreground">{classData.academicYear || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-muted-foreground">
                    {new Date(classData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Edit Class</Button>
                <Button variant="destructive">Archive Class</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
