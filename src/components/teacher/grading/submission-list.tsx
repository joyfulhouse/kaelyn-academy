"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Clock, CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";
import type { SubmissionWithLearner, SubmissionStatus } from "@/types/grading";

interface SubmissionListProps {
  submissions: SubmissionWithLearner[];
  onSelectSubmission: (submissionId: string) => void;
  onBulkGradeClick: (submissionIds: string[]) => void;
  totalPoints: number;
}

const statusConfig: Record<
  SubmissionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  not_started: {
    label: "Not Started",
    variant: "outline",
    icon: <MinusCircle className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  submitted: {
    label: "Submitted",
    variant: "default",
    icon: <Clock className="h-3 w-3" />,
  },
  graded: {
    label: "Graded",
    variant: "secondary",
    icon: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  },
  late: {
    label: "Late",
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function SubmissionList({
  submissions,
  onSelectSubmission,
  onBulkGradeClick,
  totalPoints,
}: SubmissionListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("name");

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.learner.name.localeCompare(b.learner.name);
        case "score":
          return (b.score ?? -1) - (a.score ?? -1);
        case "date":
          if (!a.submittedAt && !b.submittedAt) return 0;
          if (!a.submittedAt) return 1;
          if (!b.submittedAt) return -1;
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [submissions, filterStatus, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubmissions.map((s) => s.id)));
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

  const allSelected =
    filteredSubmissions.length > 0 &&
    filteredSubmissions.every((s) => selectedIds.has(s.id));

  const someSelected = selectedIds.size > 0;

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as SubmissionStatus | "all")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {someSelected && (
          <Button
            variant="outline"
            onClick={() => onBulkGradeClick(Array.from(selectedIds))}
          >
            Grade Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => {
                const config = statusConfig[submission.status];
                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(submission.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(submission.id, checked as boolean)
                        }
                        aria-label={`Select ${submission.learner.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={submission.learner.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(submission.learner.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{submission.learner.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(submission.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.score !== null ? (
                        <span className="font-medium">
                          {submission.score} / {totalPoints}
                          <span className="text-muted-foreground ml-1">
                            ({Math.round(submission.percentageScore ?? 0)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectSubmission(submission.id)}
                        disabled={submission.status === "not_started"}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Grade
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
