"use client";

import { useState, useEffect, useCallback } from "react";
import { Target, Lock, Trophy, Loader2, History, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { QuizComponent } from "./quiz-component";
import { getQuizForLesson, hasQuiz } from "@/lib/assessment";
import type { QuizConfig, QuizResult } from "@/lib/assessment/types";
import type { Activity } from "@/data/curriculum/activities";

// Activities can be string[] (legacy) or Activity[] (new)
type ActivityInput = string[] | Activity[];

interface AssessmentTabProps {
  lessonId: string;
  assessmentType: string;
  activities: ActivityInput;
}

interface QuizAttemptHistory {
  id: string;
  attemptNumber: number;
  score: number | null;
  passed: boolean | null;
  timeSpent: number | null;
  completedAt: string | null;
  aiFeedback: string | null;
}

interface QuizState {
  hasQuiz: boolean;
  quizConfig: QuizConfig | null;
  attempts: QuizAttemptHistory[];
  bestScore: number | null;
  hasPassed: boolean;
  loading: boolean;
}

interface ActivityState {
  completedActivities: number[];
  isComplete: boolean;
  loading: boolean;
}

export function AssessmentTab({
  lessonId,
  assessmentType,
  activities,
}: AssessmentTabProps) {
  const [activityState, setActivityState] = useState<ActivityState>({
    completedActivities: [],
    isComplete: false,
    loading: true,
  });
  const [quizState, setQuizState] = useState<QuizState>({
    hasQuiz: false,
    quizConfig: null,
    attempts: [],
    bestScore: null,
    hasPassed: false,
    loading: true,
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Check activity completion status
  const fetchActivityState = useCallback(async () => {
    try {
      const response = await fetch(`/api/learner/activity?lessonId=${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        const completedActivities: number[] =
          data.activityState?.completedActivities ?? [];
        const isComplete = completedActivities.length >= activities.length;
        setActivityState({
          completedActivities,
          isComplete,
          loading: false,
        });
      } else {
        setActivityState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching activity state:", error);
      setActivityState((prev) => ({ ...prev, loading: false }));
    }
  }, [lessonId, activities.length]);

  // Fetch quiz attempts
  const fetchQuizState = useCallback(async () => {
    // First check if this lesson has a quiz in the data
    if (!hasQuiz(lessonId)) {
      setQuizState({
        hasQuiz: false,
        quizConfig: null,
        attempts: [],
        bestScore: null,
        hasPassed: false,
        loading: false,
      });
      return;
    }

    const config = getQuizForLesson(lessonId);

    try {
      const response = await fetch(`/api/learner/quiz?lessonId=${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizState({
          hasQuiz: true,
          quizConfig: config,
          attempts: data.attempts ?? [],
          bestScore: data.bestScore ?? null,
          hasPassed: data.hasPassed ?? false,
          loading: false,
        });
      } else {
        setQuizState({
          hasQuiz: true,
          quizConfig: config,
          attempts: [],
          bestScore: null,
          hasPassed: false,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching quiz state:", error);
      setQuizState({
        hasQuiz: true,
        quizConfig: config,
        attempts: [],
        bestScore: null,
        hasPassed: false,
        loading: false,
      });
    }
  }, [lessonId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchActivityState(), fetchQuizState()]);
    };
    loadData();
  }, [fetchActivityState, fetchQuizState]);

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setShowQuiz(false);
    // Refresh quiz state to get updated attempts
    fetchQuizState();
  };

  const handleStartQuiz = () => {
    setQuizResult(null);
    setShowQuiz(true);
  };

  // Loading state
  if (activityState.loading || quizState.loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // No quiz available for this lesson
  if (!quizState.hasQuiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {assessmentType}
            </Badge>
            Lesson Assessment
          </CardTitle>
          <CardDescription>
            Assessment for this lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              An assessment for this lesson is being developed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Activities not complete - show locked message
  if (!activityState.isComplete) {
    const remaining = activities.length - activityState.completedActivities.length;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {assessmentType}
            </Badge>
            Lesson Assessment
          </CardTitle>
          <CardDescription>
            Complete this assessment to demonstrate your understanding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Assessment Locked
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete all lesson activities to unlock the assessment.
              <br />
              <span className="font-medium">
                {remaining} {remaining === 1 ? "activity" : "activities"} remaining
              </span>
            </p>
            <Button disabled>
              <Lock className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show quiz component
  if (showQuiz && quizState.quizConfig) {
    return (
      <QuizComponent
        config={quizState.quizConfig}
        lessonId={lessonId}
        onComplete={handleQuizComplete}
        onCancel={() => setShowQuiz(false)}
      />
    );
  }

  // Show quiz result or start button
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {quizState.hasPassed ? (
            <Trophy className="h-5 w-5 text-warning" />
          ) : (
            <Target className="h-5 w-5 text-primary" />
          )}
          {quizState.quizConfig?.title ?? "Lesson Assessment"}
        </CardTitle>
        <CardDescription>
          {quizState.quizConfig?.instructions ??
            "Complete this assessment to demonstrate your understanding"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Stats */}
        {quizState.attempts.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  {quizState.bestScore ?? 0}%
                </div>
                <div className="text-xs text-muted-foreground">Best Score</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  {quizState.attempts.length}
                </div>
                <div className="text-xs text-muted-foreground">Attempts</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Badge
                  variant={quizState.hasPassed ? "default" : "secondary"}
                  className="text-sm"
                >
                  {quizState.hasPassed ? "Passed" : "Not Yet"}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">Status</div>
              </div>
            </div>

            {/* Recent Result Alert */}
            {quizResult && (
              <Alert
                className={
                  quizResult.passed
                    ? "border-success/30 bg-success/10"
                    : "border-warning/30 bg-warning/10"
                }
              >
                <AlertDescription>
                  <strong>
                    {quizResult.passed ? "Congratulations!" : "Keep trying!"}
                  </strong>{" "}
                  You scored {quizResult.percentage}% on attempt #
                  {quizResult.attemptNumber}.
                  {quizResult.feedback && (
                    <span className="block mt-1 text-muted-foreground">
                      {quizResult.feedback}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Attempt History */}
            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                <History className="h-4 w-4" />
                Attempt History
              </h4>
              <div className="space-y-2">
                {quizState.attempts.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{attempt.attemptNumber}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-medium ${
                          attempt.passed
                            ? "text-success"
                            : "text-muted-foreground"
                        }`}
                      >
                        {attempt.score}%
                      </span>
                      {attempt.passed && (
                        <Badge variant="default" className="text-xs">
                          Passed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Start/Retry Button */}
        <div className="flex justify-center pt-4">
          {quizState.hasPassed ? (
            <Button variant="outline" onClick={handleStartQuiz}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          ) : (
            <Button onClick={handleStartQuiz}>
              {quizState.attempts.length > 0 ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              ) : (
                "Start Assessment"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AssessmentTab;
