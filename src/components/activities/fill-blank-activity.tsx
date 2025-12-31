"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  Check,
  X,
  RotateCcw,
  AlertCircle,
  Volume2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FillBlankConfig } from "@/lib/db/schema/curriculum";

interface FillBlankActivityProps {
  title: string;
  instructions: string;
  config: FillBlankConfig;
  onComplete: (
    score: number,
    answers: Record<string, string>,
    results: BlankResult[]
  ) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  accessibilityDescription?: string;
}

interface BlankResult {
  id: string;
  userAnswer: string;
  correct: boolean;
  correctAnswers: string[];
}

interface TextSegment {
  type: "text" | "blank";
  content: string;
  blankId?: string;
}

// Parse text with blanks - returns segments with blank positions
function parseTextWithBlanks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const blankPattern = /\{\{blank:([^}]+)\}\}/g;
  let lastIndex = 0;

  // Use matchAll to find all blank placeholders
  const matches = Array.from(text.matchAll(blankPattern));

  for (const match of matches) {
    const matchIndex = match.index ?? 0;

    // Add text before the blank
    if (matchIndex > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, matchIndex),
      });
    }

    // Add the blank
    segments.push({
      type: "blank",
      content: "",
      blankId: match[1],
    });

    lastIndex = matchIndex + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

export function FillBlankActivity({
  title,
  instructions,
  config,
  onComplete,
  onCancel,
  readOnly = false,
  accessibilityDescription,
}: FillBlankActivityProps) {
  // Parse text segments
  const segments = useMemo(() => parseTextWithBlanks(config.text), [config.text]);

  // Track answers for each blank
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    config.blanks.forEach((blank) => {
      initial[blank.id] = "";
    });
    return initial;
  });

  // Track which blanks have been revealed hints
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  // Track submission state
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<BlankResult[]>([]);

  // Refs for focus management
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const announceRef = useRef<HTMLDivElement>(null);

  // Announce for screen readers
  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  // Calculate progress
  const totalBlanks = config.blanks.length;
  const filledBlanks = Object.values(answers).filter((a) => a.trim() !== "").length;
  const progressPercent = (filledBlanks / totalBlanks) * 100;

  // Calculate score
  const correctCount = results.filter((r) => r.correct).length;
  const score = totalBlanks > 0 ? Math.round((correctCount / totalBlanks) * 100) : 0;

  // Get blank config by ID
  const getBlankConfig = useCallback(
    (blankId: string) => config.blanks.find((b) => b.id === blankId),
    [config.blanks]
  );

  // Handle answer change
  const handleAnswerChange = useCallback(
    (blankId: string, value: string) => {
      if (readOnly || submitted) return;

      setAnswers((prev) => ({
        ...prev,
        [blankId]: value,
      }));
    },
    [readOnly, submitted]
  );

  // Handle word bank selection
  const handleWordBankSelect = useCallback(
    (word: string) => {
      if (readOnly || submitted) return;

      // Find the first empty blank and fill it
      const emptyBlankId = config.blanks.find(
        (blank) => !answers[blank.id]?.trim()
      )?.id;

      if (emptyBlankId) {
        setAnswers((prev) => ({
          ...prev,
          [emptyBlankId]: word,
        }));

        // Focus the input
        const input = inputRefs.current.get(emptyBlankId);
        input?.focus();

        announce(`Selected "${word}" for blank`);
      }
    },
    [readOnly, submitted, config.blanks, answers, announce]
  );

  // Show hint for a blank
  const handleShowHint = useCallback(
    (blankId: string) => {
      setRevealedHints((prev) => new Set(prev).add(blankId));
      const blankConfig = getBlankConfig(blankId);
      if (blankConfig?.hint) {
        announce(`Hint: ${blankConfig.hint}`);
      }
    },
    [getBlankConfig, announce]
  );

  // Check if an answer is correct
  const checkAnswer = useCallback(
    (blankId: string, userAnswer: string): boolean => {
      const blankConfig = getBlankConfig(blankId);
      if (!blankConfig) return false;

      const normalizedUserAnswer = userAnswer.trim();
      const isCaseSensitive = blankConfig.caseSensitive ?? false;

      return blankConfig.correctAnswers.some((correctAnswer) => {
        const normalizedCorrect = correctAnswer.trim();
        return isCaseSensitive
          ? normalizedUserAnswer === normalizedCorrect
          : normalizedUserAnswer.toLowerCase() === normalizedCorrect.toLowerCase();
      });
    },
    [getBlankConfig]
  );

  // Handle submission
  const handleSubmit = useCallback(() => {
    const blankResults: BlankResult[] = config.blanks.map((blank) => ({
      id: blank.id,
      userAnswer: answers[blank.id] ?? "",
      correct: checkAnswer(blank.id, answers[blank.id] ?? ""),
      correctAnswers: blank.correctAnswers,
    }));

    setResults(blankResults);
    setSubmitted(true);

    const correct = blankResults.filter((r) => r.correct).length;
    const calculatedScore = Math.round((correct / totalBlanks) * 100);

    announce(
      `Activity complete. Score: ${calculatedScore}%. ${correct} out of ${totalBlanks} correct.`
    );

    onComplete(calculatedScore, answers, blankResults);
  }, [config.blanks, answers, checkAnswer, totalBlanks, announce, onComplete]);

  // Reset activity
  const handleReset = useCallback(() => {
    const initial: Record<string, string> = {};
    config.blanks.forEach((blank) => {
      initial[blank.id] = "";
    });
    setAnswers(initial);
    setRevealedHints(new Set());
    setSubmitted(false);
    setResults([]);
    announce("Activity reset. All answers cleared.");

    // Focus first input
    const firstBlankId = config.blanks[0]?.id;
    if (firstBlankId) {
      const input = inputRefs.current.get(firstBlankId);
      input?.focus();
    }
  }, [config.blanks, announce]);

  // Handle keyboard navigation between blanks
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentBlankId: string) => {
      const blankIds = config.blanks.map((b) => b.id);
      const currentIndex = blankIds.indexOf(currentBlankId);

      if (e.key === "Tab" && !e.shiftKey) {
        // Move to next blank on Tab
        const nextIndex = currentIndex + 1;
        if (nextIndex < blankIds.length) {
          e.preventDefault();
          const nextInput = inputRefs.current.get(blankIds[nextIndex]);
          nextInput?.focus();
        }
      } else if (e.key === "Tab" && e.shiftKey) {
        // Move to previous blank on Shift+Tab
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          e.preventDefault();
          const prevInput = inputRefs.current.get(blankIds[prevIndex]);
          prevInput?.focus();
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Submit on Enter if all blanks filled
        if (filledBlanks === totalBlanks && !submitted) {
          e.preventDefault();
          handleSubmit();
        }
      }
    },
    [config.blanks, filledBlanks, totalBlanks, submitted, handleSubmit]
  );

  // Get result for a blank
  const getBlankResult = useCallback(
    (blankId: string) => results.find((r) => r.id === blankId),
    [results]
  );

  // Calculate input width based on longest correct answer
  const getInputWidth = useCallback(
    (blankId: string) => {
      const blankConfig = getBlankConfig(blankId);
      if (!blankConfig) return 100;

      const maxLength = Math.max(
        ...blankConfig.correctAnswers.map((a) => a.length),
        8 // Minimum width
      );

      return Math.min(maxLength * 12 + 24, 300); // Cap at 300px
    },
    [getBlankConfig]
  );

  return (
    <div className="space-y-6">
      {/* Accessibility announcer */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary">
              {filledBlanks} / {totalBlanks} filled
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{instructions}</p>
          {accessibilityDescription && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              {accessibilityDescription}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Word Bank (if enabled) */}
      {config.showWordBank && config.wordBank && config.wordBank.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Word Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {config.wordBank.map((word, index) => {
                // Check if word is already used
                const isUsed = Object.values(answers).some(
                  (a) => a.toLowerCase() === word.toLowerCase()
                );

                return (
                  <Button
                    key={`${word}-${index}`}
                    variant={isUsed ? "secondary" : "outline"}
                    size="sm"
                    disabled={isUsed || readOnly || submitted}
                    onClick={() => handleWordBankSelect(word)}
                    className={cn(
                      "transition-all",
                      isUsed && "opacity-50 line-through"
                    )}
                  >
                    {word}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fill-in-the-blank text */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="text-lg leading-relaxed"
            role="group"
            aria-label="Fill in the blanks"
          >
            {segments.map((segment, index) => {
              if (segment.type === "text") {
                // Render text content safely as React children (no innerHTML)
                return (
                  <span key={index} className="whitespace-pre-wrap">
                    {segment.content}
                  </span>
                );
              }

              const blankId = segment.blankId!;
              const blankConfig = getBlankConfig(blankId);
              const result = getBlankResult(blankId);
              const hasHint = blankConfig?.hint && !revealedHints.has(blankId);
              const showHintText = revealedHints.has(blankId);
              const inputWidth = getInputWidth(blankId);

              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 mx-1 align-baseline"
                >
                  <TooltipProvider>
                    <span className="relative inline-block">
                      <Input
                        ref={(el) => {
                          if (el) inputRefs.current.set(blankId, el);
                        }}
                        type="text"
                        value={answers[blankId] ?? ""}
                        onChange={(e) => handleAnswerChange(blankId, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, blankId)}
                        disabled={readOnly || submitted}
                        placeholder={showHintText ? blankConfig?.hint : "..."}
                        aria-label={`Blank ${config.blanks.findIndex((b) => b.id === blankId) + 1}${
                          blankConfig?.hint ? `, hint: ${blankConfig.hint}` : ""
                        }`}
                        style={{ width: inputWidth }}
                        className={cn(
                          "h-8 text-center font-medium inline-flex",
                          submitted &&
                            result?.correct &&
                            "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300",
                          submitted &&
                            !result?.correct &&
                            "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                        )}
                      />
                      {submitted && (
                        <span className="absolute -right-6 top-1/2 -translate-y-1/2">
                          {result?.correct ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <X className="h-4 w-4 text-red-600 cursor-help" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Correct answer:{" "}
                                  <strong>
                                    {result?.correctAnswers[0] ?? ""}
                                  </strong>
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      )}
                    </span>
                    {hasHint && !submitted && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleShowHint(blankId)}
                          >
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Show hint</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {submitted && (
        <Card
          className={cn(
            score >= 70
              ? "bg-green-50 dark:bg-green-950/20"
              : "bg-amber-50 dark:bg-amber-950/20"
          )}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {score >= 70 ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">
                    {score >= 70 ? "Great job!" : "Keep practicing!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {correctCount} of {totalBlanks} blanks correct
                  </p>
                </div>
              </div>
              <Badge variant={score >= 70 ? "default" : "secondary"}>
                {score}%
              </Badge>
            </div>

            {/* Show incorrect answers with corrections */}
            {results.some((r) => !r.correct) && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Corrections:</p>
                {results
                  .filter((r) => !r.correct)
                  .map((result) => (
                    <div key={result.id} className="text-sm flex gap-2">
                      <span className="text-red-600 line-through">
                        {result.userAnswer || "(empty)"}
                      </span>
                      <span className="text-muted-foreground">{"->"}</span>
                      <span className="text-green-600 font-medium">
                        {result.correctAnswers[0]}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={filledBlanks < totalBlanks || readOnly}
            >
              <Check className="h-4 w-4 mr-2" />
              Check Answers
            </Button>
          ) : (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FillBlankActivity;
