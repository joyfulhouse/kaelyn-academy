"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import type {
  SubmissionWithLearner,
  AssignmentForGrading,
  GradeSubmissionData,
} from "@/types/grading";

interface SubmissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionWithLearner | null;
  assignment: AssignmentForGrading | null;
  onSave: (submissionId: string, data: GradeSubmissionData) => Promise<void>;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function SubmissionDetailDialog({
  open,
  onOpenChange,
  submission,
  assignment,
  onSave,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: SubmissionDetailDialogProps) {
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      setScore(submission.score?.toString() ?? "");
      setFeedback(submission.feedback ?? "");
      setError(null);
    }
  }, [submission]);

  const handleSave = useCallback(async (markAsGraded: boolean) => {
    if (!submission || !assignment) return;

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setError("Please enter a valid score");
      return;
    }
    if (scoreNum > assignment.totalPoints) {
      setError(`Score cannot exceed ${assignment.totalPoints} points`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(submission.id, {
        score: scoreNum,
        feedback: feedback.trim() || undefined,
        markAsGraded,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setIsSaving(false);
    }
  }, [submission, assignment, score, feedback, onSave]);

  const handleGradeAndNext = useCallback(async () => {
    await handleSave(true);
    if (hasNext) {
      onNext();
    }
  }, [handleSave, hasNext, onNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Ctrl/Cmd + Enter to save and grade
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleGradeAndNext();
      }

      // j/k for next/previous (when not in textarea)
      if (document.activeElement?.tagName !== "TEXTAREA") {
        if (e.key === "j" && hasNext) {
          e.preventDefault();
          onNext();
        } else if (e.key === "k" && hasPrevious) {
          e.preventDefault();
          onPrevious();
        }
      }

      // Escape to close
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, hasNext, hasPrevious, onNext, onPrevious, onOpenChange, handleGradeAndNext]);

  const formatDate = (date: Date | null) => {
    if (!date) return "Not submitted";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
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

  if (!submission || !assignment) return null;

  const percentage = score
    ? Math.round((parseFloat(score) / assignment.totalPoints) * 100)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={submission.learner.avatarUrl ?? undefined} />
                <AvatarFallback>{getInitials(submission.learner.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{submission.learner.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  {assignment.title}
                </div>
              </div>
            </DialogTitle>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={onPrevious}
                disabled={!hasPrevious}
                title="Previous (k)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
                title="Next (j)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Submission Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(submission.submittedAt)}
          </div>
          {submission.attemptNumber > 1 && (
            <Badge variant="outline">Attempt #{submission.attemptNumber}</Badge>
          )}
          {submission.gradedAt && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Graded
            </Badge>
          )}
        </div>

        <Separator />

        {/* Grading Form */}
        <div className="space-y-4">
          {/* Score Input */}
          <div className="space-y-2">
            <Label htmlFor="score">
              Score (out of {assignment.totalPoints} points)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="score"
                type="number"
                min={0}
                max={assignment.totalPoints}
                step="0.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-32"
                placeholder="0"
              />
              <span className="text-muted-foreground">/ {assignment.totalPoints}</span>
              {percentage !== null && !isNaN(percentage) && (
                <Badge
                  variant={
                    percentage >= (assignment.passingScore ?? 70)
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {percentage}%
                </Badge>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for the student..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Grade
            </Button>
            {hasNext && (
              <Button onClick={handleGradeAndNext} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Grade & Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="text-xs text-muted-foreground text-center">
          <kbd className="px-1 py-0.5 bg-muted rounded">j</kbd>/
          <kbd className="px-1 py-0.5 bg-muted rounded">k</kbd> navigate •{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd>+
          <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> grade & next •{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> close
        </div>
      </DialogContent>
    </Dialog>
  );
}
