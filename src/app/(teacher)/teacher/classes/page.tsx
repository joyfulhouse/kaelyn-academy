"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  X,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  gradeLevel: number;
  academicYear: string | null;
  isActive: boolean;
  studentCount: number;
  averageProgress: number;
  averageMastery: number;
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  color: string | null;
}

interface ClassSummary {
  totalClasses: number;
  totalStudents: number;
  averageProgress: number;
}

const gradeOptions = [
  { value: "0", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

function ClassesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
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
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function ClassesPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summary, setSummary] = useState<ClassSummary>({
    totalClasses: 0,
    totalStudents: 0,
    averageProgress: 0,
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gradeLevel: "5",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });

  const fetchData = useCallback(async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/teacher/classes"),
        fetch("/api/subjects"),
      ]);

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || []);
        setSummary(data.summary || { totalClasses: 0, totalStudents: 0, averageProgress: 0 });
      }

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter classes based on search and filters
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!cls.name.toLowerCase().includes(query) &&
            !(cls.description?.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Grade filter
      if (gradeFilter.length > 0 && !gradeFilter.includes(String(cls.gradeLevel))) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !cls.isActive) return false;
      if (statusFilter === "inactive" && cls.isActive) return false;

      return true;
    });
  }, [classes, searchQuery, gradeFilter, statusFilter]);

  const handleCreateClass = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          gradeLevel: parseInt(formData.gradeLevel),
          academicYear: formData.academicYear,
        }),
      });

      if (response.ok) {
        await fetchData();
        setCreateDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          gradeLevel: "5",
          academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        });
      }
    } catch (error) {
      console.error("Failed to create class:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/teacher/classes/${selectedClass.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          gradeLevel: parseInt(formData.gradeLevel),
          academicYear: formData.academicYear,
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditDialogOpen(false);
        setSelectedClass(null);
      }
    } catch (error) {
      console.error("Failed to update class:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveClass = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/teacher/classes/${selectedClass.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        setArchiveDialogOpen(false);
        setSelectedClass(null);
      }
    } catch (error) {
      console.error("Failed to archive class:", error);
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (cls: ClassData) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name,
      description: cls.description || "",
      gradeLevel: String(cls.gradeLevel),
      academicYear: cls.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    });
    setEditDialogOpen(true);
  };

  const openArchiveDialog = (cls: ClassData) => {
    setSelectedClass(cls);
    setArchiveDialogOpen(true);
  };

  const formatGradeLabel = (grade: number) => {
    if (grade === 0) return "Grade K";
    return `Grade ${grade}`;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGradeFilter([]);
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || gradeFilter.length > 0 || statusFilter !== "all";

  if (loading) {
    return <ClassesSkeleton />;
  }

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
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
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
                <div className="text-2xl font-bold">{summary.totalClasses}</div>
                <div className="text-sm text-muted-foreground">Active Classes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.averageProgress}%</div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-role-teacher/10">
                <Calendar className="h-5 w-5 text-role-teacher" />
              </div>
              <div>
                <div className="text-2xl font-bold">{new Date().getFullYear()}-{new Date().getFullYear() + 1}</div>
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
          <Input
            placeholder="Search classes..."
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
                  {(gradeFilter.length > 0 ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Grade</DropdownMenuLabel>
            {gradeOptions.map((grade) => (
              <DropdownMenuCheckboxItem
                key={grade.value}
                checked={gradeFilter.includes(grade.value)}
                onCheckedChange={(checked) => {
                  setGradeFilter(
                    checked
                      ? [...gradeFilter, grade.value]
                      : gradeFilter.filter((g) => g !== grade.value)
                  );
                }}
              >
                {grade.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "all"}
              onCheckedChange={() => setStatusFilter("all")}
            >
              All Classes
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "active"}
              onCheckedChange={() => setStatusFilter("active")}
            >
              Active Only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "inactive"}
              onCheckedChange={() => setStatusFilter("inactive")}
            >
              Inactive Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Classes Table */}
      {classes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Classes Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first class to start managing students
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </CardContent>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Classes Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No classes match your search or filter criteria
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/teacher/classes/${cls.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {cls.name}
                      </Link>
                      {cls.description && (
                        <div className="text-sm text-muted-foreground mt-1 truncate max-w-xs">
                          {cls.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatGradeLabel(cls.gradeLevel)}</TableCell>
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
                    <TableCell>
                      <Badge variant={cls.isActive ? "default" : "secondary"}>
                        {cls.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                            <Link href={`/teacher/classes/${cls.id}`} className="w-full">
                              View Class
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(cls)}>
                            Edit Class
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/classes/${cls.id}/students`} className="w-full">
                              Manage Students
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/assignments/new?classId=${cls.id}`} className="w-full">
                              Create Assignment
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openArchiveDialog(cls)}
                          >
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
      )}

      {/* Create Class Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Set up a new class to start adding students and assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                placeholder="e.g., 5th Grade Math - Section A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this class..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  placeholder="e.g., 2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClass} disabled={!formData.name || saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Class
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update class details. Students and progress will not be affected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Class Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., 5th Grade Math - Section A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of this class..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-gradeLevel">Grade Level</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-academicYear">Academic Year</Label>
                <Input
                  id="edit-academicYear"
                  placeholder="e.g., 2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditClass} disabled={!formData.name || saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Archive Class?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <span className="font-semibold">{selectedClass?.name}</span>?
              <br /><br />
              This will hide the class from your active classes list. Student progress
              will be preserved and you can restore the class later from the archived
              classes section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveClass}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Archiving...
                </>
              ) : (
                "Archive Class"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
