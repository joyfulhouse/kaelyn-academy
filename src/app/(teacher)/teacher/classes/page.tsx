import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Plus,
  MoreVertical,
  Calendar,
  BookOpen,
  TrendingUp,
  Search,
  Filter,
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
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Classes | Teacher Dashboard | Kaelyn's Academy",
  description: "Manage your classes and students",
};

// Mock data - in production, this would come from the database
const classes = [
  {
    id: "1",
    name: "5th Grade Math - Section A",
    gradeLevel: 5,
    academicYear: "2024-2025",
    studentCount: 24,
    averageProgress: 72,
    averageMastery: 78,
    subjects: ["Math"],
    isActive: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  },
  {
    id: "2",
    name: "5th Grade Math - Section B",
    gradeLevel: 5,
    academicYear: "2024-2025",
    studentCount: 22,
    averageProgress: 68,
    averageMastery: 71,
    subjects: ["Math"],
    isActive: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    name: "5th Grade Science",
    gradeLevel: 5,
    academicYear: "2024-2025",
    studentCount: 25,
    averageProgress: 75,
    averageMastery: 80,
    subjects: ["Science"],
    isActive: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "4",
    name: "4th Grade Reading",
    gradeLevel: 4,
    academicYear: "2024-2025",
    studentCount: 20,
    averageProgress: 65,
    averageMastery: 68,
    subjects: ["Reading"],
    isActive: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
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

export default async function ClassesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "teacher") {
    redirect("/login");
  }

  const totalStudents = classes.reduce((acc, c) => acc + c.studentCount, 0);
  const activeClasses = classes.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your classes and track student progress
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Class
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeClasses}</div>
                <div className="text-sm text-muted-foreground">Active Classes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(classes.reduce((acc, c) => acc + c.averageProgress, 0) / classes.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">2024-2025</div>
                <div className="text-sm text-muted-foreground">Academic Year</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search classes..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>
            Click on a class to view details and manage students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Mastery</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/teacher/classes/${cls.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {cls.name}
                    </Link>
                    <div className="flex gap-1 mt-1">
                      {cls.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>Grade {cls.gradeLevel}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {cls.studentCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={cls.averageProgress} className="h-2 w-16" />
                      <span className="text-sm">{cls.averageProgress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={cls.averageMastery} className="h-2 w-16" />
                      <span className="text-sm">{cls.averageMastery}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimeAgo(cls.lastActivity)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/teacher/classes/${cls.id}`} className="w-full">
                            View Class
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Class</DropdownMenuItem>
                        <DropdownMenuItem>Add Students</DropdownMenuItem>
                        <DropdownMenuItem>Create Assignment</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Archive Class
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
    </div>
  );
}
