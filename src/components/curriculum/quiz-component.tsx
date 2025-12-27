"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  Trophy,
  RefreshCcw,
  Loader2,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type {
  QuizConfig,
  Question,
  QuestionAnswer,
  QuizResult,
  QuestionResult,
} from "@/lib/assessment/types";
import { gradeQuiz, shuffleArray } from "@/lib/assessment/types";

interface QuizComponentProps {
  config: QuizConfig;
  lessonId: string;
  onComplete?: (result: QuizResult) => void;
  onCancel?: () => void;
}

type QuizState = "intro" | "in_progress" | "review" | "completed";

export function QuizComponent({
  config,
  lessonId,
  onComplete,
  onCancel,
}: QuizComponentProps) {
  const [state, setState] = useState<QuizState>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuestionAnswer>>(new Map());
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize questions (optionally shuffled)
  useEffect(() => {
    let q = [...config.questions];
    if (config.shuffleQuestions) {
      q = shuffleArray(q);
    }
    setQuestions(q);
  }, [config.questions, config.shuffleQuestions]);

  const currentQuestion = questions[currentIndex];

  const setAnswer = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) return;

      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const existing = answers.get(currentQuestion.id);

      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(currentQuestion.id, {
          questionId: currentQuestion.id,
          answer,
          timeSpent: (existing?.timeSpent ?? 0) + timeSpent,
        });
        return next;
      });
    },
    [currentQuestion, questionStartTime, answers]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Convert answers map to array
      const answersArray = Array.from(answers.values());
      const totalTime = Math.floor((Date.now() - startTime) / 1000);

      // Grade the quiz
      const gradeResult = gradeQuiz(config, answersArray);

      // Submit to API
      const response = await fetch("/api/learner/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          quizId: config.id,
          answers: answersArray,
          totalTimeSpent: totalTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const fullResult: QuizResult = {
          ...gradeResult,
          attemptNumber: data.attemptNumber ?? 1,
          completedAt: new Date(),
          feedback: data.feedback,
        };
        setResult(fullResult);
        setState("completed");
        onComplete?.(fullResult);
      } else {
        // Still show results even if API fails
        const fullResult: QuizResult = {
          ...gradeResult,
          attemptNumber: 1,
          completedAt: new Date(),
        };
        setResult(fullResult);
        setState("completed");
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      // Show results anyway
      const answersArray = Array.from(answers.values());
      const gradeResult = gradeQuiz(config, answersArray);
      setResult({
        ...gradeResult,
        attemptNumber: 1,
        completedAt: new Date(),
      });
      setState("completed");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, startTime, config, lessonId, onComplete]);

  // Timer effect
  useEffect(() => {
    if (state !== "in_progress" || !config.timeLimit) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = config.timeLimit! - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state, startTime, config.timeLimit, handleSubmit]);

  const startQuiz = () => {
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setTimeRemaining(config.timeLimit ?? null);
    setState("in_progress");
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleRetry = () => {
    setAnswers(new Map());
    setCurrentIndex(0);
    setResult(null);
    setState("intro");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Render based on state
  if (state === "intro") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.instructions && (
            <p className="text-muted-foreground">{config.instructions}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{questions.length} Questions</Badge>
            </div>
            {config.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(config.timeLimit)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Passing Score:</span>
              <span className="font-medium">{config.passingScore ?? 70}%</span>
            </div>
            {config.allowRetry && (
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                <span>Retries allowed</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={startQuiz} className="flex-1">
              Start Quiz
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "in_progress" && currentQuestion) {
    const currentAnswer = answers.get(currentQuestion.id)?.answer;
    const answeredCount = answers.size;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              {currentQuestion.points && (
                <Badge variant="secondary">{currentQuestion.points} pts</Badge>
              )}
            </div>
            {timeRemaining !== null && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm",
                  timeRemaining < 60 && "text-red-500 animate-pulse"
                )}
              >
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          <Progress value={progressPercent} className="h-1 mt-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <QuestionRenderer
            key={currentQuestion.id}
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={setAnswer}
            shuffleOptions={config.shuffleOptions}
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              ) : (
                <Button onClick={goToNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "completed" && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.passed ? (
              <>
                <Trophy className="h-6 w-6 text-yellow-500" />
                Congratulations!
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Keep Practicing!
              </>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <div
              className={cn(
                "text-5xl font-bold mb-2",
                result.passed ? "text-green-600" : "text-orange-600"
              )}
            >
              {result.percentage}%
            </div>
            <p className="text-muted-foreground">
              {result.score} / {result.maxScore} points
            </p>
            <Badge
              variant={result.passed ? "default" : "secondary"}
              className="mt-2"
            >
              {result.passed ? "Passed" : "Not Passed"}
            </Badge>
          </div>

          {/* AI Feedback */}
          {result.feedback && (
            <Alert>
              <AlertDescription>{result.feedback}</AlertDescription>
            </Alert>
          )}

          {/* Question Results */}
          {config.showExplanations && (
            <div className="space-y-4">
              <h3 className="font-semibold">Question Review</h3>
              {result.questionResults.map((qr, index) => (
                <QuestionResultCard
                  key={qr.questionId}
                  result={qr}
                  question={questions.find((q) => q.id === qr.questionId)!}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {config.allowRetry && !result.passed && (
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {onCancel && (
              <Button onClick={onCancel} className="flex-1">
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Question renderer component
function QuestionRenderer({
  question,
  answer,
  onAnswer,
  shuffleOptions,
}: {
  question: Question;
  answer: string | string[] | undefined;
  onAnswer: (answer: string | string[]) => void;
  shuffleOptions?: boolean;
}) {
  // Compute options using useMemo to avoid setState in effect
  const options = useMemo(() => {
    const opts = question.options ?? [];
    if (shuffleOptions && question.type === "multiple_choice") {
      return shuffleArray(opts);
    }
    return opts;
  }, [question.options, question.type, shuffleOptions]);

  // For ordering questions, track user's current order
  // Since component is keyed by question.id, useState initializer runs once per question
  const [orderItems, setOrderItems] = useState<string[]>(() => {
    if (question.type === "ordering") {
      return shuffleArray(question.options ?? []);
    }
    return [];
  });

  switch (question.type) {
    case "multiple_choice":
    case "true_false":
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          {question.hint && (
            <p className="text-sm text-muted-foreground italic">{question.hint}</p>
          )}

          <RadioGroup
            value={answer as string}
            onValueChange={(value: string) => onAnswer(value)}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                  answer === option
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "fill_blank":
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          {question.hint && (
            <p className="text-sm text-muted-foreground italic">{question.hint}</p>
          )}
          <Input
            value={(answer as string) ?? ""}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="max-w-md"
          />
        </div>
      );

    case "matching":
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          <div className="grid gap-3">
            {options.map((item, index) => {
              const currentAnswers = (answer as string[]) ?? [];
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <span className="font-medium min-w-[100px]">{item}</span>
                  <span className="text-muted-foreground">→</span>
                  <select
                    value={currentAnswers[index] ?? ""}
                    onChange={(e) => {
                      const newAnswers = [...currentAnswers];
                      newAnswers[index] = e.target.value;
                      onAnswer(newAnswers);
                    }}
                    className="flex-1 p-2 rounded border bg-background"
                  >
                    <option value="">Select...</option>
                    {question.matchTargets?.map((target, tIndex) => (
                      <option key={tIndex} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "ordering":
      const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
      };

      const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
        const newOrder = [...orderItems];
        const [removed] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, removed);
        setOrderItems(newOrder);
        onAnswer(newOrder);
      };

      return (
        <div className="space-y-4">
          <p className="text-lg font-medium">{question.question}</p>
          <p className="text-sm text-muted-foreground">
            Drag items to reorder them.
          </p>
          <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div
                key={item}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background cursor-move hover:border-primary"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <p>Unsupported question type</p>;
  }
}

// Question result card
function QuestionResultCard({
  result,
  question,
  index,
}: {
  result: QuestionResult;
  question: Question;
  index: number;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        result.correct
          ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
          : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            result.correct ? "bg-green-500" : "bg-red-500"
          )}
        >
          {result.correct ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <X className="h-4 w-4 text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">
            Q{index + 1}: {question.question}
          </p>
          <div className="mt-2 text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Your answer:</span>{" "}
              <span className={result.correct ? "text-green-600" : "text-red-600"}>
                {Array.isArray(result.answer)
                  ? result.answer.join(", ")
                  : result.answer || "(no answer)"}
              </span>
            </p>
            {!result.correct && (
              <p>
                <span className="text-muted-foreground">Correct answer:</span>{" "}
                <span className="text-green-600">
                  {Array.isArray(result.correctAnswer)
                    ? result.correctAnswer.join(", ")
                    : result.correctAnswer}
                </span>
              </p>
            )}
          </div>
          {result.explanation && (
            <p className="mt-2 text-sm text-muted-foreground italic">
              {result.explanation}
            </p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0">
          {result.points}/{result.maxPoints}
        </Badge>
      </div>
    </div>
  );
}

export default QuizComponent;
