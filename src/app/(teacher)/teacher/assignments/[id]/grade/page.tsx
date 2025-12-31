"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { GradeSummaryCard } from "@/components/teacher/grading/grade-summary-card";
import { SubmissionList } from "@/components/teacher/grading/submission-list";
import { SubmissionDetailDialog } from "@/components/teacher/grading/submission-detail-dialog";
import type {
  SubmissionsListResponse,
  SubmissionWithLearner,
  AssignmentForGrading,
  GradingStats,
  GradeSubmissionData,
  GradeSubmissionResponse,
} from "@/types/grading";

export default function GradeAssignmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const selectedSubmissionId = searchParams.get("submission");

  const [assignment, setAssignment] = useState<AssignmentForGrading | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithLearner[]>([]);
  const [stats, setStats] = useState<GradingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assignment and submissions
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Assignment not found");
        }
        throw new Error("Failed to load submissions");
      }

      const data: SubmissionsListResponse = await response.json();
      setAssignment(data.assignment);
      setSubmissions(data.submissions);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find current submission and navigation helpers
  const selectedSubmission = useMemo(() => {
    if (!selectedSubmissionId) return null;
    return submissions.find((s) => s.id === selectedSubmissionId) ?? null;
  }, [selectedSubmissionId, submissions]);

  const currentIndex = useMemo(() => {
    if (!selectedSubmissionId) return -1;
    return submissions.findIndex((s) => s.id === selectedSubmissionId);
  }, [selectedSubmissionId, submissions]);

  const hasNext = currentIndex >= 0 && currentIndex < submissions.length - 1;
  const hasPrevious = currentIndex > 0;

  // Navigation handlers
  const handleSelectSubmission = useCallback(
    (submissionId: string) => {
      router.push(`/teacher/assignments/${assignmentId}/grade?submission=${submissionId}`, {
        scroll: false,
      });
    },
    [router, assignmentId]
  );

  const handleCloseDialog = useCallback(() => {
    router.push(`/teacher/assignments/${assignmentId}/grade`, { scroll: false });
  }, [router, assignmentId]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      const nextSubmission = submissions[currentIndex + 1];
      handleSelectSubmission(nextSubmission.id);
    }
  }, [hasNext, submissions, currentIndex, handleSelectSubmission]);

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      const prevSubmission = submissions[currentIndex - 1];
      handleSelectSubmission(prevSubmission.id);
    }
  }, [hasPrevious, submissions, currentIndex, handleSelectSubmission]);

  // Save grade handler
  const handleSaveGrade = useCallback(
    async (submissionId: string, data: GradeSubmissionData) => {
      const response = await fetch(
        `/api/teacher/assignments/${assignmentId}/submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to save grade");
      }

      const result: GradeSubmissionResponse = await response.json();

      // Update local state with the updated submission
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? result.submission : s))
      );

      // Recalculate stats
      const gradedSubmissions = submissions.map((s) =>
        s.id === submissionId ? result.submission : s
      );
      const graded = gradedSubmissions.filter((s) => s.gradedAt);
      const scores = graded
        .map((s) => s.percentageScore)
        .filter((score): score is number => score !== null);

      setStats({
        total: gradedSubmissions.length,
        submitted: gradedSubmissions.filter((s) => s.submittedAt).length,
        graded: graded.length,
        notStarted: gradedSubmissions.filter((s) => s.status === "not_started").length,
        late: gradedSubmissions.filter((s) => s.status === "late").length,
        avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
        highScore: scores.length > 0 ? Math.max(...scores) : null,
        lowScore: scores.length > 0 ? Math.min(...scores) : null,
      });
    },
    [assignmentId, submissions]
  );

  // Bulk grade placeholder (future feature)
  const handleBulkGradeClick = useCallback((submissionIds: string[]) => {
    // Future: implement bulk grading modal
    console.log("Bulk grade:", submissionIds);
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/assignments">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground">
              {assignment.className} • {assignment.totalPoints} points
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Stats */}
        <div className="lg:col-span-1">
          {stats && <GradeSummaryCard stats={stats} />}
        </div>

        {/* Main - Submission List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Student Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionList
                submissions={submissions}
                onSelectSubmission={handleSelectSubmission}
                onBulkGradeClick={handleBulkGradeClick}
                totalPoints={assignment.totalPoints}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grading Dialog */}
      <SubmissionDetailDialog
        open={!!selectedSubmissionId}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
        submission={selectedSubmission}
        assignment={assignment}
        onSave={handleSaveGrade}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </div>
  );
}
