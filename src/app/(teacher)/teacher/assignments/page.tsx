import { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Assignments | Teacher Dashboard | Kaelyn's Academy",
  description: "Create and manage assignments for your classes",
};

// Mock data - in production, this would come from the database
const assignments = [
  {
    id: "1",
    title: "Fractions Practice",
    className: "5th Grade Math - Section A",
    classId: "1",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    totalPoints: 100,
    submissions: { submitted: 18, total: 24, graded: 12 },
    avgScore: 82,
    status: "active",
  },
  {
    id: "2",
    title: "Decimals Quiz",
    className: "5th Grade Math - Section A",
    classId: "1",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    totalPoints: 50,
    submissions: { submitted: 5, total: 24, graded: 0 },
    avgScore: null,
    status: "active",
  },
  {
    id: "3",
    title: "Geometry Review",
    className: "5th Grade Math - Section B",
    classId: "2",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    totalPoints: 100,
    submissions: { submitted: 22, total: 22, graded: 22 },
    avgScore: 78,
    status: "completed",
  },
  {
    id: "4",
    title: "Addition & Subtraction Practice",
    className: "4th Grade Math",
    classId: "3",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    assignedAt: new Date(Date.now()),
    totalPoints: 75,
    submissions: { submitted: 0, total: 20, graded: 0 },
    avgScore: null,
    status: "active",
  },
  {
    id: "5",
    title: "Reading Comprehension",
    className: "4th Grade Reading",
    classId: "4",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    totalPoints: 100,
    submissions: { submitted: 18, total: 20, graded: 18 },
    avgScore: 85,
    status: "completed",
  },
];

function getStatusBadge(status: string, dueDate: Date, submitted: number, total: number) {
  const isPastDue = dueDate < new Date();
  const isComplete = submitted === total && status === "completed";

  if (isComplete) {
    return <Badge className="bg-green-500">Completed</Badge>;
  }
  if (isPastDue) {
    return <Badge variant="destructive">Past Due</Badge>;
  }
  return <Badge variant="secondary">Active</Badge>;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d ago`;
  }
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Tomorrow";
  }
  return `In ${diffDays}d`;
}

export default async function AssignmentsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "teacher") {
    redirect("/login");
  }

  const activeAssignments = assignments.filter((a) => a.status === "active");
  const completedAssignments = assignments.filter((a) => a.status === "completed");
  const needsGrading = assignments.filter(
    (a) => a.submissions.submitted > a.submissions.graded
  );

  const totalSubmissions = assignments.reduce((acc, a) => acc + a.submissions.submitted, 0);
  const totalStudents = assignments.reduce((acc, a) => acc + a.submissions.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage assignments across all your classes
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/teacher/assignments/new">
            <Plus className="h-4 w-4" />
            Create Assignment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeAssignments.length}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{needsGrading.length}</div>
                <div className="text-xs text-muted-foreground">Need Grading</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((totalSubmissions / totalStudents) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search assignments..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="needs-grading">
            Needs Grading ({needsGrading.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
        </TabsList>

        {["active", "needs-grading", "completed", "all"].map((tabValue) => {
          let filteredAssignments = assignments;
          if (tabValue === "active") {
            filteredAssignments = activeAssignments;
          } else if (tabValue === "needs-grading") {
            filteredAssignments = needsGrading;
          } else if (tabValue === "completed") {
            filteredAssignments = completedAssignments;
          }

          return (
            <TabsContent key={tabValue} value={tabValue} className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Graded</TableHead>
                        <TableHead>Avg Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <Link
                              href={`/teacher/assignments/${assignment.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {assignment.title}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {assignment.totalPoints} points
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/teacher/classes/${assignment.classId}`}
                              className="hover:text-primary transition-colors"
                            >
                              {assignment.className}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(assignment.dueDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={
                                  (assignment.submissions.submitted /
                                    assignment.submissions.total) *
                                  100
                                }
                                className="h-2 w-16"
                              />
                              <span className="text-sm">
                                {assignment.submissions.submitted}/
                                {assignment.submissions.total}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={
                                  assignment.submissions.submitted > 0
                                    ? (assignment.submissions.graded /
                                        assignment.submissions.submitted) *
                                      100
                                    : 0
                                }
                                className="h-2 w-16"
                              />
                              <span className="text-sm">
                                {assignment.submissions.graded}/
                                {assignment.submissions.submitted}
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
                            {getStatusBadge(
                              assignment.status,
                              assignment.dueDate,
                              assignment.submissions.submitted,
                              assignment.submissions.total
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
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Grade Submissions</DropdownMenuItem>
                                <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Delete Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
