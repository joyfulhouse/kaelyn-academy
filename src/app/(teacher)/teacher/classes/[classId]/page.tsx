import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Award,
  Mail,
  UserPlus,
  ClipboardList,
  AlertTriangle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ClassDetailPageProps {
  params: Promise<{ classId: string }>;
}

// Mock data - in production, this would come from the database
const classData = {
  id: "1",
  name: "5th Grade Math - Section A",
  description: "Core mathematics curriculum for 5th grade students, covering fractions, decimals, geometry, and algebraic thinking.",
  gradeLevel: 5,
  academicYear: "2024-2025",
  subjects: ["Math"],
  isActive: true,
  createdAt: new Date("2024-08-15"),
};

const students = [
  { id: "1", name: "Alex Martinez", email: "alex.m@school.edu", progress: 85, mastery: 88, streak: 12, status: "active", lastActive: new Date(Date.now() - 1000 * 60 * 15), trend: "up" },
  { id: "2", name: "Jordan Kim", email: "jordan.k@school.edu", progress: 72, mastery: 75, streak: 5, status: "active", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), trend: "stable" },
  { id: "3", name: "Sam Patel", email: "sam.p@school.edu", progress: 45, mastery: 48, streak: 0, status: "struggling", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 72), trend: "down" },
  { id: "4", name: "Taylor Rodriguez", email: "taylor.r@school.edu", progress: 92, mastery: 95, streak: 21, status: "excelling", lastActive: new Date(Date.now() - 1000 * 60 * 30), trend: "up" },
  { id: "5", name: "Morgan Chen", email: "morgan.c@school.edu", progress: 68, mastery: 70, streak: 3, status: "active", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), trend: "up" },
  { id: "6", name: "Casey Johnson", email: "casey.j@school.edu", progress: 55, mastery: 58, streak: 1, status: "needs-attention", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48), trend: "down" },
];

const assignments = [
  { id: "1", title: "Fractions Practice", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48), submitted: 18, total: 24, avgScore: 82 },
  { id: "2", title: "Decimals Quiz", dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), submitted: 5, total: 24, avgScore: null },
  { id: "3", title: "Geometry Review", dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), submitted: 24, total: 24, avgScore: 78 },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "excelling":
      return <Badge className="bg-green-500">Excelling</Badge>;
    case "struggling":
      return <Badge variant="destructive">Struggling</Badge>;
    case "needs-attention":
      return <Badge className="bg-amber-500">Needs Attention</Badge>;
    default:
      return <Badge variant="secondary">Active</Badge>;
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}

export async function generateMetadata({
  params,
}: ClassDetailPageProps): Promise<Metadata> {
  const { classId } = await params;
  // In production, fetch class data from database
  return {
    title: `${classData.name} | Teacher Dashboard | Kaelyn's Academy`,
    description: classData.description,
  };
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "teacher") {
    redirect("/login");
  }

  const { classId } = await params;
  // In production, verify teacher owns this class
  if (!classId) {
    notFound();
  }

  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length);
  const avgMastery = Math.round(students.reduce((acc, s) => acc + s.mastery, 0) / students.length);
  const strugglingCount = students.filter((s) => s.status === "struggling" || s.status === "needs-attention").length;

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
              <Badge variant="outline">Grade {classData.gradeLevel}</Badge>
              {classData.isActive && (
                <Badge className="bg-green-500">Active</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{classData.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Students
            </Button>
            <Button className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Create Assignment
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
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{avgProgress}%</div>
                <div className="text-xs text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{avgMastery}%</div>
                <div className="text-xs text-muted-foreground">Avg Mastery</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-purple-500" />
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
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{strugglingCount}</div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Mastery</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Last Active</TableHead>
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
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progress} className="h-2 w-16" />
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.mastery} className="h-2 w-16" />
                          <span className="text-sm">{student.mastery}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          🔥 {student.streak}
                        </div>
                      </TableCell>
                      <TableCell>{getTrendIcon(student.trend)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatTimeAgo(student.lastActive)}
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
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Assignment
              </Button>
            </CardHeader>
            <CardContent>
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
                    const isPastDue = assignment.dueDate < new Date();
                    const isComplete = assignment.submitted === assignment.total;

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.title}
                        </TableCell>
                        <TableCell>
                          <div className={isPastDue ? "text-muted-foreground" : ""}>
                            {assignment.dueDate.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(assignment.submitted / assignment.total) * 100}
                              className="h-2 w-16"
                            />
                            <span className="text-sm">
                              {assignment.submitted}/{assignment.total}
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
                            <Badge className="bg-green-500">Complete</Badge>
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
                              <DropdownMenuItem>View Submissions</DropdownMenuItem>
                              <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                              <DropdownMenuItem>Grade All</DropdownMenuItem>
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
                  <p className="text-muted-foreground">Grade {classData.gradeLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Academic Year</label>
                  <p className="text-muted-foreground">{classData.academicYear}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-muted-foreground">
                    {classData.createdAt.toLocaleDateString()}
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
