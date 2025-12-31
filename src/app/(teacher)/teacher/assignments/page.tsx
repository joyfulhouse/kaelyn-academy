"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Filter,
  Search,
  X,
  Loader2,
  AlertTriangle,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  classId: string;
  className: string;
  dueDate: string | null;
  assignedAt: string;
  totalPoints: number;
  passingScore: number;
  submissions: {
    submitted: number;
    total: number;
    graded: number;
  };
  avgScore: number | null;
  status: "active" | "completed" | "past_due";
}

interface AssignmentSummary {
  total: number;
  active: number;
  needsGrading: number;
  totalSubmissions: number;
  completionRate: number;
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function getStatusBadge(status: string, dueDate: string | null, submitted: number, total: number) {
  const isPastDue = dueDate ? new Date(dueDate) < new Date() : false;
  const isComplete = submitted === total && total > 0 && status === "completed";

  if (isComplete) {
    return <Badge className="bg-success">Completed</Badge>;
  }
  if (isPastDue) {
    return <Badge variant="destructive">Past Due</Badge>;
  }
  return <Badge variant="secondary">Active</Badge>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";

  const date = new Date(dateStr);
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

export default function AssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [summary, setSummary] = useState<AssignmentSummary>({
    total: 0,
    active: 0,
    needsGrading: 0,
    totalSubmissions: 0,
    completionRate: 0,
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string[]>([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/assignments");
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
        setSummary(data.summary || {
          total: 0,
          active: 0,
          needsGrading: 0,
          totalSubmissions: 0,
          completionRate: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get unique classes for filter
  const uniqueClasses = useMemo(() => {
    const classSet = new Map<string, string>();
    assignments.forEach((a) => {
      classSet.set(a.classId, a.className);
    });
    return Array.from(classSet.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!a.title.toLowerCase().includes(query) &&
            !(a.description?.toLowerCase().includes(query)) &&
            !a.className.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (classFilter.length > 0 && !classFilter.includes(a.classId)) {
        return false;
      }
      return true;
    });
  }, [assignments, searchQuery, classFilter]);

  // Categorize filtered assignments
  const activeAssignments = filteredAssignments.filter((a) => a.status === "active");
  const completedAssignments = filteredAssignments.filter((a) => a.status === "completed");
  const needsGradingAssignments = filteredAssignments.filter(
    (a) => a.submissions.submitted > a.submissions.graded
  );

  const handleDuplicateAssignment = async (assignment: Assignment) => {
    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${assignment.title} (Copy)`,
          description: assignment.description,
          classId: assignment.classId,
          totalPoints: assignment.totalPoints,
          passingScore: assignment.passingScore,
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to duplicate assignment:", error);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/teacher/assignments/${selectedAssignment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        setDeleteDialogOpen(false);
        setSelectedAssignment(null);
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setClassFilter([]);
  };

  const hasActiveFilters = searchQuery || classFilter.length > 0;

  if (loading) {
    return <AssignmentsSkeleton />;
  }

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
                <div className="text-2xl font-bold">{summary.active}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.needsGrading}</div>
                <div className="text-xs text-muted-foreground">Need Grading</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.totalSubmissions}</div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.completionRate}%</div>
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
          <Input
            placeholder="Search assignments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {classFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Class</DropdownMenuLabel>
            {uniqueClasses.map((cls) => (
              <DropdownMenuCheckboxItem
                key={cls.id}
                checked={classFilter.includes(cls.id)}
                onCheckedChange={(checked) => {
                  setClassFilter(
                    checked
                      ? [...classFilter, cls.id]
                      : classFilter.filter((c) => c !== cls.id)
                  );
                }}
              >
                {cls.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Empty state */}
      {assignments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Assignments Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first assignment to start tracking student work
            </p>
            <Button asChild>
              <Link href="/teacher/assignments/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Assignments Tabs */
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="needs-grading">
              Needs Grading ({needsGradingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({filteredAssignments.length})</TabsTrigger>
          </TabsList>

          {["active", "needs-grading", "completed", "all"].map((tabValue) => {
            let tabAssignments = filteredAssignments;
            if (tabValue === "active") {
              tabAssignments = activeAssignments;
            } else if (tabValue === "needs-grading") {
              tabAssignments = needsGradingAssignments;
            } else if (tabValue === "completed") {
              tabAssignments = completedAssignments;
            }

            return (
              <TabsContent key={tabValue} value={tabValue} className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {tabAssignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No assignments in this category</p>
                      </div>
                    ) : (
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
                          {tabAssignments.map((assignment) => (
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
                                      assignment.submissions.total > 0
                                        ? (assignment.submissions.submitted /
                                            assignment.submissions.total) *
                                          100
                                        : 0
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
                                    <DropdownMenuItem asChild>
                                      <Link href={`/teacher/assignments/${assignment.id}/grade`}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Grade Submissions
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                                        Edit Assignment
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicateAssignment(assignment)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => openDeleteDialog(assignment)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Assignment
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
            );
          })}
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Assignment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedAssignment?.title}</span>?
              <br /><br />
              This will permanently delete the assignment and all student submissions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Assignment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
