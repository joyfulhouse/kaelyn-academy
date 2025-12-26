"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Mail,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Users,
  GraduationCap,
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const students = [
  {
    id: "1",
    name: "Alex Martinez",
    email: "alex.m@school.edu",
    class: "5th Grade Math - A",
    progress: 85,
    mastery: 88,
    streak: 15,
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    status: "excelling",
    trend: "up",
  },
  {
    id: "2",
    name: "Jordan Kim",
    email: "jordan.k@school.edu",
    class: "5th Grade Math - A",
    progress: 72,
    mastery: 75,
    streak: 8,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "on-track",
    trend: "stable",
  },
  {
    id: "3",
    name: "Sam Patel",
    email: "sam.p@school.edu",
    class: "5th Grade Math - B",
    progress: 45,
    mastery: 48,
    streak: 0,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    status: "struggling",
    trend: "down",
  },
  {
    id: "4",
    name: "Taylor Rodriguez",
    email: "taylor.r@school.edu",
    class: "5th Grade Math - A",
    progress: 92,
    mastery: 95,
    streak: 22,
    lastActive: new Date(Date.now() - 1000 * 60 * 45),
    status: "excelling",
    trend: "up",
  },
  {
    id: "5",
    name: "Morgan Chen",
    email: "morgan.c@school.edu",
    class: "5th Grade Math - B",
    progress: 68,
    mastery: 70,
    streak: 5,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: "on-track",
    trend: "up",
  },
  {
    id: "6",
    name: "Casey Johnson",
    email: "casey.j@school.edu",
    class: "4th Grade Reading",
    progress: 55,
    mastery: 58,
    streak: 2,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "needs-attention",
    trend: "down",
  },
  {
    id: "7",
    name: "Riley Brown",
    email: "riley.b@school.edu",
    class: "4th Grade Reading",
    progress: 78,
    mastery: 80,
    streak: 10,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3),
    status: "on-track",
    trend: "stable",
  },
  {
    id: "8",
    name: "Dakota Smith",
    email: "dakota.s@school.edu",
    class: "5th Grade Math - B",
    progress: 62,
    mastery: 65,
    streak: 7,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 8),
    status: "on-track",
    trend: "up",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "excelling":
      return <Badge className="bg-green-500">Excelling</Badge>;
    case "struggling":
      return <Badge variant="destructive">Struggling</Badge>;
    case "needs-attention":
      return <Badge className="bg-amber-500">Needs Attention</Badge>;
    default:
      return <Badge variant="secondary">On Track</Badge>;
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

export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.class === classFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const stats = {
    total: students.length,
    excelling: students.filter((s) => s.status === "excelling").length,
    struggling: students.filter((s) => s.status === "struggling" || s.status === "needs-attention").length,
    avgProgress: Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Message All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.excelling}</div>
                <div className="text-xs text-muted-foreground">Excelling</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.struggling}</div>
                <div className="text-xs text-muted-foreground">Need Help</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgProgress}%</div>
                <div className="text-xs text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="5th Grade Math - A">5th Grade Math - A</SelectItem>
            <SelectItem value="5th Grade Math - B">5th Grade Math - B</SelectItem>
            <SelectItem value="4th Grade Reading">4th Grade Reading</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="excelling">Excelling</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
            <SelectItem value="struggling">Struggling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Mastery</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{student.class}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="h-2 w-16" />
                      <span className="text-sm">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.mastery}%</TableCell>
                  <TableCell>
                    {student.streak > 0 ? (
                      <span className="text-orange-500">{student.streak}d</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getTrendIcon(student.trend)}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimeAgo(student.lastActive)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Progress</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Contact Parent</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No students found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
