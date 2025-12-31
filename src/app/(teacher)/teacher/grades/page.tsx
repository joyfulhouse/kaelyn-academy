"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Download,
  RefreshCw,
  Search,
  Filter,
  X,
  History,
  ChevronDown,
  MessageSquare,
  Loader2,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  GradebookResponse,
  GradeEntry,
  StudentWithStats,
  GradebookColumn,
  UpdateGradeData,
  BulkCreateGradeData,
  GradeHistoryEntry,
} from "@/types/gradebook";

// Grade categories for filtering and creating
const GRADE_CATEGORIES = [
  { value: "assignment", label: "Assignment" },
  { value: "homework", label: "Homework" },
  { value: "quiz", label: "Quiz" },
  { value: "test", label: "Test" },
  { value: "project", label: "Project" },
  { value: "participation", label: "Participation" },
  { value: "extra_credit", label: "Extra Credit" },
];

// Helper to get letter grade color
function getGradeColor(letterGrade: string | null): string {
  if (!letterGrade) return "text-muted-foreground";
  if (letterGrade.startsWith("A")) return "text-success";
  if (letterGrade.startsWith("B")) return "text-info";
  if (letterGrade.startsWith("C")) return "text-warning";
  if (letterGrade.startsWith("D")) return "text-orange-500";
  return "text-destructive";
}

// Editable cell component for the spreadsheet
function EditableGradeCell({
  grade,
  pointsPossible,
  onSave,
  onShowFeedback,
}: {
  grade: GradeEntry | null;
  pointsPossible: number;
  onSave: (gradeId: string | null, value: number | null) => void;
  onShowFeedback: (grade: GradeEntry) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(
    grade?.pointsEarned?.toString() ?? ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(grade?.pointsEarned?.toString() ?? "");
  }, [grade?.pointsEarned]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const numValue = value === "" ? null : parseFloat(value);
    if (numValue !== grade?.pointsEarned) {
      onSave(grade?.id ?? null, numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(grade?.pointsEarned?.toString() ?? "");
    } else if (e.key === "Tab") {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        min={0}
        max={pointsPossible}
        step="0.5"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-8 w-16 text-center p-1"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1 cursor-pointer group"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setIsEditing(true);
        }
      }}
    >
      <span
        className={`min-w-[3rem] text-center ${
          grade?.pointsEarned === null ? "text-muted-foreground" : ""
        }`}
      >
        {grade?.pointsEarned !== null && grade?.pointsEarned !== undefined ? grade.pointsEarned : "-"}
      </span>
      {grade?.feedback && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowFeedback(grade);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MessageSquare className="h-3 w-3 text-muted-foreground hover:text-primary" />
        </button>
      )}
    </div>
  );
}

function GradebookSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );
}

export default function GradebookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedClassId = searchParams.get("classId");

  // Data state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GradebookResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialog state
  const [newGradeDialogOpen, setNewGradeDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeEntry | null>(null);
  const [gradeHistory, setGradeHistory] = useState<GradeHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // New grade form state
  const [newGradeForm, setNewGradeForm] = useState<BulkCreateGradeData>({
    classId: selectedClassId ?? "",
    category: "assignment",
    name: "",
    pointsPossible: 100,
    weight: 1.0,
  });

  // Fetch gradebook data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClassId) {
        params.set("classId", selectedClassId);
      }

      const response = await fetch(`/api/teacher/grades?${params.toString()}`);
      if (response.ok) {
        const result: GradebookResponse = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch gradebook data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update class filter in URL
  const handleClassChange = (classId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (classId === "all") {
      params.delete("classId");
    } else {
      params.set("classId", classId);
    }
    router.push(`/teacher/grades?${params.toString()}`);
  };

  // Get unique grade names/columns
  const gradeColumns = useMemo<GradebookColumn[]>(() => {
    if (!data) return [];

    const columnMap = new Map<string, GradebookColumn>();
    for (const grade of data.grades) {
      const key = grade.assignmentId ?? grade.name;
      if (!columnMap.has(key)) {
        columnMap.set(key, {
          id: key,
          name: grade.name,
          type: grade.assignmentId ? "assignment" : "grade",
          pointsPossible: grade.pointsPossible,
          category: grade.category,
          dueDate: grade.dueDate,
          weight: grade.weight ?? 1,
        });
      }
    }

    return Array.from(columnMap.values()).sort((a, b) => {
      // Sort by due date if available, otherwise by name
      if (a.dueDate && b.dueDate) {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [data]);

  // Filter columns by category
  const filteredColumns = useMemo(() => {
    if (categoryFilter === "all") return gradeColumns;
    return gradeColumns.filter((col) => col.category === categoryFilter);
  }, [gradeColumns, categoryFilter]);

  // Filter students by search query
  const filteredStudents = useMemo<StudentWithStats[]>(() => {
    if (!data) return [];
    if (!searchQuery) return data.students;
    const query = searchQuery.toLowerCase();
    return data.students.filter((s) =>
      s.learnerName.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Get grade for a specific student and column
  const getGradeForCell = (
    learnerId: string,
    columnId: string
  ): GradeEntry | null => {
    if (!data) return null;
    return (
      data.grades.find(
        (g) =>
          g.learnerId === learnerId &&
          (g.assignmentId === columnId || g.name === columnId)
      ) ?? null
    );
  };

  // Handle cell value change
  const handleCellChange = async (
    student: StudentWithStats,
    column: GradebookColumn,
    gradeId: string | null,
    value: number | null
  ) => {
    if (gradeId) {
      // Update existing grade
      const update: UpdateGradeData = {
        id: gradeId,
        pointsEarned: value,
      };

      // Optimistically update UI
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          grades: prev.grades.map((g) =>
            g.id === gradeId
              ? {
                  ...g,
                  pointsEarned: value,
                  percentage:
                    value !== null
                      ? Math.round((value / g.pointsPossible) * 100 * 100) / 100
                      : null,
                }
              : g
          ),
        };
      });

      // Save immediately
      try {
        const response = await fetch("/api/teacher/grades", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });

        if (!response.ok) {
          // Revert on error
          fetchData();
        }
      } catch (error) {
        console.error("Failed to update grade:", error);
        fetchData();
      }
    } else if (value !== null) {
      // Create new grade for this cell
      try {
        const response = await fetch("/api/teacher/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: student.classId,
            learnerId: student.learnerId,
            category: column.category,
            name: column.name,
            pointsEarned: value,
            pointsPossible: column.pointsPossible,
            weight: column.weight,
            assignmentId:
              column.type === "assignment" ? column.id : undefined,
          }),
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Failed to create grade:", error);
      }
    }
  };

  // Show feedback dialog
  const handleShowFeedback = (grade: GradeEntry) => {
    setSelectedGrade(grade);
    setFeedbackDialogOpen(true);
  };

  // Show history dialog
  const handleShowHistory = async (grade: GradeEntry) => {
    setSelectedGrade(grade);
    setHistoryLoading(true);
    setHistoryDialogOpen(true);

    try {
      const response = await fetch(
        `/api/teacher/grades/history?gradeId=${grade.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setGradeHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle new grade creation
  const handleCreateGrade = async () => {
    if (!newGradeForm.name || !newGradeForm.classId) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/teacher/grades/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGradeForm),
      });

      if (response.ok) {
        setNewGradeDialogOpen(false);
        setNewGradeForm({
          classId: selectedClassId ?? "",
          category: "assignment",
          name: "",
          pointsPossible: 100,
          weight: 1.0,
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create grade:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!data) return;

    const headers = ["Student", ...filteredColumns.map((c) => c.name), "Average"];
    const rows = filteredStudents.map((student) => {
      const grades = filteredColumns.map((col) => {
        const grade = getGradeForCell(student.learnerId, col.id);
        return grade?.pointsEarned?.toString() ?? "";
      });
      return [
        student.learnerName,
        ...grades,
        student.averageScore?.toString() ?? "",
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gradebook-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <GradebookSkeleton />;
  }

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gradebook</h1>
          <p className="text-muted-foreground mt-1">
            Manage student grades in a spreadsheet view
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setNewGradeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Grade Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{data.summary.totalStudents}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-info/10">
                  <BookOpen className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{gradeColumns.length}</div>
                  <div className="text-sm text-muted-foreground">Grade Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <BookOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data.summary.averageScore !== null
                      ? `${data.summary.averageScore}%`
                      : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Class Average</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <BookOpen className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data.summary.gradedCount}/{data.summary.totalGrades}
                  </div>
                  <div className="text-sm text-muted-foreground">Grades Entered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedClassId ?? "all"}
          onValueChange={handleClassChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {data?.classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {GRADE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
            }}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Gradebook Table */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Student Grades</CardTitle>
            <CardDescription>
              Click on any cell to edit the grade. Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-max">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                        Student
                      </TableHead>
                      {filteredColumns.map((col) => (
                        <TableHead
                          key={col.id}
                          className="text-center min-w-[100px]"
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 px-2 font-medium"
                              >
                                <span className="max-w-[80px] truncate">
                                  {col.name}
                                </span>
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                {col.pointsPossible} pts | {col.category}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[80px] sticky right-0 bg-background z-10">
                        Average
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={filteredColumns.length + 2}
                          className="text-center py-12"
                        >
                          <div className="text-muted-foreground">
                            {searchQuery
                              ? "No students match your search"
                              : "No students enrolled"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.learnerId}>
                          <TableCell className="sticky left-0 bg-background z-10">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.learnerAvatar ?? undefined} />
                                <AvatarFallback>
                                  {student.learnerName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {student.learnerName}
                              </span>
                            </div>
                          </TableCell>
                          {filteredColumns.map((col) => {
                            const grade = getGradeForCell(
                              student.learnerId,
                              col.id
                            );
                            return (
                              <TableCell
                                key={col.id}
                                className="text-center p-1"
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center">
                                        <EditableGradeCell
                                          grade={grade}
                                          pointsPossible={col.pointsPossible}
                                          onSave={(gradeId, value) =>
                                            handleCellChange(
                                              student,
                                              col,
                                              gradeId,
                                              value
                                            )
                                          }
                                          onShowFeedback={handleShowFeedback}
                                        />
                                        {grade && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                            onClick={() =>
                                              handleShowHistory(grade)
                                            }
                                          >
                                            <History className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {grade?.pointsEarned ?? "-"} /{" "}
                                        {col.pointsPossible}
                                        {grade?.percentage !== null &&
                                        grade?.percentage !== undefined &&
                                          ` (${grade.percentage}%)`}
                                      </p>
                                      {grade?.letterGrade && (
                                        <p
                                          className={getGradeColor(
                                            grade.letterGrade
                                          )}
                                        >
                                          {grade.letterGrade}
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-medium sticky right-0 bg-background z-10">
                            <span className={getGradeColor(student.letterGrade)}>
                              {student.averageScore !== null
                                ? `${student.averageScore}%`
                                : "-"}
                              {student.letterGrade && (
                                <span className="ml-1 text-xs">
                                  ({student.letterGrade})
                                </span>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* New Grade Dialog */}
      <Dialog open={newGradeDialogOpen} onOpenChange={setNewGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Grade Item</DialogTitle>
            <DialogDescription>
              Create a new grade column for all students in the class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="classId">Class</Label>
              <Select
                value={newGradeForm.classId}
                onValueChange={(value) =>
                  setNewGradeForm({ ...newGradeForm, classId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {data?.classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Grade Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Chapter 5 Quiz"
                value={newGradeForm.name}
                onChange={(e) =>
                  setNewGradeForm({ ...newGradeForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newGradeForm.category}
                  onValueChange={(value) =>
                    setNewGradeForm({ ...newGradeForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pointsPossible">Points Possible</Label>
                <Input
                  id="pointsPossible"
                  type="number"
                  min={0}
                  value={newGradeForm.pointsPossible}
                  onChange={(e) =>
                    setNewGradeForm({
                      ...newGradeForm,
                      pointsPossible: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={newGradeForm.description ?? ""}
                onChange={(e) =>
                  setNewGradeForm({
                    ...newGradeForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewGradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGrade}
              disabled={!newGradeForm.name || !newGradeForm.classId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Feedback</DialogTitle>
            <DialogDescription>
              {selectedGrade?.name} - {selectedGrade?.pointsEarned ?? "-"} /{" "}
              {selectedGrade?.pointsPossible}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">{selectedGrade?.feedback}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade History</DialogTitle>
            <DialogDescription>
              {selectedGrade?.name} - Change history
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : gradeHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No changes recorded
              </p>
            ) : (
              <div className="space-y-4">
                {gradeHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {entry.changedByName ?? "Unknown"}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {entry.previousPointsEarned ?? "-"}
                      </span>
                      {" -> "}
                      <span className="font-medium">
                        {entry.newPointsEarned ?? "-"}
                      </span>
                      {entry.newLetterGrade && (
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getGradeColor(entry.newLetterGrade)}`}
                        >
                          {entry.newLetterGrade}
                        </Badge>
                      )}
                    </div>
                    {entry.changeReason && (
                      <p className="text-xs text-muted-foreground">
                        Reason: {entry.changeReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
