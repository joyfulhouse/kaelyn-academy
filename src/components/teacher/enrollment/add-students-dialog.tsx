"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, UserPlus, Users } from "lucide-react";
import type { AvailableStudent, AvailableStudentsResponse } from "@/types/enrollment";

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  classGrade: number;
  onStudentsAdded: () => void;
}

export function AddStudentsDialog({
  open,
  onOpenChange,
  classId,
  className,
  classGrade,
  onStudentsAdded,
}: AddStudentsDialogProps) {
  const [students, setStudents] = useState<AvailableStudent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        available: "true",
        search: searchQuery,
        grade: gradeFilter,
      });
      const response = await fetch(
        `/api/teacher/classes/${classId}/enrollments?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch students");
      const data: AvailableStudentsResponse = await response.json();
      setStudents(data.students);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [classId, searchQuery, gradeFilter]);

  useEffect(() => {
    if (open) {
      fetchAvailableStudents();
      setSelectedIds(new Set());
    }
  }, [open, fetchAvailableStudents]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(students.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleEnroll = async () => {
    if (selectedIds.size === 0) return;

    setIsEnrolling(true);
    setError(null);

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to enroll students");
      }

      onStudentsAdded();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll students");
    } finally {
      setIsEnrolling(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradeLabel = (grade: number) => {
    if (grade === 0) return "K";
    return grade.toString();
  };

  const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Students to {className}
          </DialogTitle>
          <DialogDescription>
            Select students from your organization to enroll in this class.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or parent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="0">Kindergarten</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <SelectItem key={g} value={g.toString()}>
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-lg">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">{error}</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No available students found</p>
              <p className="text-sm">
                All students in your organization are already enrolled in this class.
              </p>
            </div>
          ) : (
            <div>
              {/* Select All Header */}
              <div className="flex items-center gap-3 p-3 border-b bg-muted/50">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
                <span className="text-sm font-medium">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} selected`
                    : "Select all"}
                </span>
              </div>

              {/* Student Rows */}
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-3 border-b hover:bg-muted/50 transition-colors ${
                    selectedIds.has(student.id) ? "bg-primary/5" : ""
                  }`}
                >
                  <Checkbox
                    checked={selectedIds.has(student.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(student.id, checked as boolean)
                    }
                    aria-label={`Select ${student.name}`}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatarUrl ?? undefined} />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      Parent: {student.parentName}
                    </p>
                  </div>
                  <Badge
                    variant={student.gradeLevel === classGrade ? "default" : "secondary"}
                  >
                    {student.gradeLevel === classGrade ? "Same Grade" : `Grade ${getGradeLabel(student.gradeLevel)}`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={selectedIds.size === 0 || isEnrolling}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll {selectedIds.size > 0 ? `(${selectedIds.size})` : "Students"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
