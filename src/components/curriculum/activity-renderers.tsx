"use client";

import { useState, useCallback } from "react";
import {
  Play,
  Pause,
  Check,
  X,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Volume2,
  ChevronRight,
  RotateCcw,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  Activity,
  QuizActivity,
  VideoActivity,
  PracticeActivity,
  ReadingActivity,
  InteractiveActivity,
  DiscussionActivity,
} from "@/data/curriculum/activities";

interface ActivityRendererProps {
  activity: Activity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}

export function ActivityRenderer({
  activity,
  onComplete,
  readOnly = false,
}: ActivityRendererProps) {
  switch (activity.type) {
    case "quiz":
      return (
        <QuizRenderer activity={activity} onComplete={onComplete} readOnly={readOnly} />
      );
    case "video":
      return (
        <VideoRenderer activity={activity} onComplete={onComplete} readOnly={readOnly} />
      );
    case "practice":
      return (
        <PracticeRenderer activity={activity} onComplete={onComplete} readOnly={readOnly} />
      );
    case "reading":
      return (
        <ReadingRenderer activity={activity} onComplete={onComplete} readOnly={readOnly} />
      );
    case "interactive":
      return (
        <InteractiveRenderer activity={activity} onComplete={onComplete} readOnly={readOnly} />
      );
    case "discussion":
      return (
        <DiscussionRenderer activity={activity} onComplete={onComplete} readOnly={readOnly} />
      );
    default:
      return (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">Unknown activity type</p>
        </div>
      );
  }
}

// Quiz Renderer
function QuizRenderer({
  activity,
  onComplete,
  readOnly,
}: {
  activity: QuizActivity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}) {
  const { questions, passingScore, showExplanations, allowRetry } = activity.content;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentQ = questions[currentQuestion];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (answer: string) => {
    if (submitted || readOnly) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: answer }));
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);

    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()) {
        correct++;
      }
    });

    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= passingScore;

    if (passed) {
      onComplete(score);
    }
  }, [answers, questions, totalQuestions, passingScore, onComplete]);

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQuestion(0);
    setShowHint(false);
  };

  const isCorrect = submitted && answers[currentQ.id]?.toLowerCase() === currentQ.correctAnswer.toLowerCase();
  const score = submitted
    ? Math.round(
        (questions.filter((q) => answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()).length /
          totalQuestions) *
          100
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="text-muted-foreground">{answeredCount} answered</span>
      </div>
      <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />

      {/* Question */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <p className="font-medium text-lg">{currentQ.question}</p>
              {currentQ.hint && !submitted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="flex-shrink-0"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showHint && currentQ.hint && (
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
                <p className="text-sm text-warning-foreground">
                  <strong>Hint:</strong> {currentQ.hint}
                </p>
              </div>
            )}

            {currentQ.questionType === "multiple_choice" && currentQ.options && (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={handleAnswer}
                disabled={submitted || readOnly}
              >
                {currentQ.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                      submitted &&
                        option.toLowerCase() === currentQ.correctAnswer.toLowerCase() &&
                        "border-success bg-success/10",
                      submitted &&
                        answers[currentQ.id] === option &&
                        option.toLowerCase() !== currentQ.correctAnswer.toLowerCase() &&
                        "border-destructive bg-destructive/10",
                      !submitted && answers[currentQ.id] === option && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={option} id={`${currentQ.id}-${idx}`} />
                    <Label
                      htmlFor={`${currentQ.id}-${idx}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                    {submitted && option.toLowerCase() === currentQ.correctAnswer.toLowerCase() && (
                      <Check className="h-4 w-4 text-success" />
                    )}
                    {submitted &&
                      answers[currentQ.id] === option &&
                      option.toLowerCase() !== currentQ.correctAnswer.toLowerCase() && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.questionType === "true_false" && (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={handleAnswer}
                disabled={submitted || readOnly}
                className="flex gap-4"
              >
                {["True", "False"].map((option) => (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center space-x-2 p-4 rounded-lg border flex-1 justify-center transition-colors",
                      submitted &&
                        option.toLowerCase() === currentQ.correctAnswer.toLowerCase() &&
                        "border-success bg-success/10",
                      submitted &&
                        answers[currentQ.id] === option &&
                        option.toLowerCase() !== currentQ.correctAnswer.toLowerCase() &&
                        "border-destructive bg-destructive/10",
                      !submitted && answers[currentQ.id] === option && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={option} id={`${currentQ.id}-${option}`} />
                    <Label
                      htmlFor={`${currentQ.id}-${option}`}
                      className="cursor-pointer font-medium"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.questionType === "fill_blank" && (
              <Input
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={submitted || readOnly}
                className={cn(
                  submitted && isCorrect && "border-success",
                  submitted && !isCorrect && "border-destructive"
                )}
              />
            )}

            {/* Explanation after submit */}
            {submitted && showExplanations && currentQ.explanation && (
              <div
                className={cn(
                  "p-3 rounded-lg border",
                  isCorrect
                    ? "bg-success/10 border-success/30"
                    : "bg-info/10 border-info/30"
                )}
              >
                <p className="text-sm">
                  <strong>{isCorrect ? "Correct!" : "Explanation:"}</strong>{" "}
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            disabled={!answers[currentQ.id]}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : !submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={answeredCount < totalQuestions || readOnly}
          >
            Submit Quiz
          </Button>
        ) : score >= passingScore ? (
          <Button onClick={() => onComplete(score)}>
            <Check className="h-4 w-4 mr-2" />
            Continue
          </Button>
        ) : allowRetry ? (
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        ) : (
          <Button onClick={() => onComplete(score)}>Continue Anyway</Button>
        )}
      </div>

      {/* Score display after submit */}
      {submitted && (
        <Card className={cn(score >= passingScore ? "bg-success/10" : "bg-warning/10")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {score >= passingScore ? "Great job!" : "Keep practicing!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  You scored {score}% (passing: {passingScore}%)
                </p>
              </div>
              <Badge variant={score >= passingScore ? "default" : "secondary"}>
                {questions.filter((q) => answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()).length} / {totalQuestions} correct
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Video Renderer
function VideoRenderer({
  activity,
  onComplete,
  readOnly,
}: {
  activity: VideoActivity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}) {
  const { videoUrl, videoId, provider, duration, transcript, completionThreshold } = activity.content;
  const [watchedPercent, setWatchedPercent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Simulate video progress (in real implementation, this would track actual video playback)
  const handleProgress = () => {
    if (readOnly) return;
    setWatchedPercent((prev) => Math.min(100, prev + 10));
  };

  const canComplete = watchedPercent >= completionThreshold;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {provider === "youtube" && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : provider === "vimeo" && videoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full"
            controls
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              const percent = (video.currentTime / video.duration) * 100;
              setWatchedPercent(percent);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Video content unavailable</p>
              {/* Demo: Click to simulate progress */}
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={handleProgress}
                disabled={readOnly}
              >
                Simulate Progress (+10%)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Progress & Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {formatDuration(duration)}
          </span>
          <span className="text-muted-foreground">{Math.round(watchedPercent)}% watched</span>
        </div>
        <Progress value={watchedPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Watch at least {completionThreshold}% to complete this activity
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {showTranscript ? "Hide" : "Show"} Transcript
          </Button>
          {showTranscript && (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{transcript}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Complete Button */}
      {!readOnly && (
        <Button
          className="w-full"
          onClick={() => onComplete(100)}
          disabled={!canComplete}
        >
          {canComplete ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Continue Watching
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Practice Renderer
function PracticeRenderer({
  activity,
  onComplete,
  readOnly,
}: {
  activity: PracticeActivity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}) {
  const { problems, requiredCorrect, showSolution } = activity.content;
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, number>>({});

  const problem = problems[currentProblem];
  const correctCount = Object.values(results).filter(Boolean).length;

  const checkAnswer = (problemId: string, answer: string) => {
    const prob = problems.find((p) => p.id === problemId);
    if (!prob) return false;

    const correctAnswers = Array.isArray(prob.correctAnswer)
      ? prob.correctAnswer.map((a) => a.toLowerCase())
      : [prob.correctAnswer.toLowerCase()];

    // Check with tolerance for numeric answers
    if (prob.inputType === "number" && prob.tolerance) {
      const numAnswer = parseFloat(answer);
      const numCorrect = parseFloat(prob.correctAnswer as string);
      return Math.abs(numAnswer - numCorrect) <= prob.tolerance;
    }

    return correctAnswers.includes(answer.toLowerCase().trim());
  };

  const handleSubmitAnswer = () => {
    const answer = answers[problem.id];
    if (!answer) return;

    const isCorrect = checkAnswer(problem.id, answer);
    setResults((prev) => ({ ...prev, [problem.id]: isCorrect }));
  };

  const handleNextHint = () => {
    const currentHintLevel = showHint[problem.id] || 0;
    if (currentHintLevel < problem.hints.length) {
      setShowHint((prev) => ({ ...prev, [problem.id]: currentHintLevel + 1 }));
    }
  };

  const canComplete = correctCount >= requiredCorrect;
  const hasResult = results[problem.id] !== undefined;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Problem {currentProblem + 1} of {problems.length}
        </span>
        <Badge variant={canComplete ? "default" : "secondary"}>
          {correctCount} / {requiredCorrect} correct needed
        </Badge>
      </div>
      <Progress value={(correctCount / requiredCorrect) * 100} className="h-2" />

      {/* Problem */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between">
            <p className="font-medium text-lg">{problem.prompt}</p>
            {problem.difficulty && (
              <Badge variant="outline">
                {"⭐".repeat(problem.difficulty)}
              </Badge>
            )}
          </div>

          {/* Hints */}
          {showHint[problem.id] > 0 && (
            <div className="space-y-2">
              {problem.hints.slice(0, showHint[problem.id]).map((hint, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-warning/10 rounded border border-warning/30"
                >
                  <p className="text-sm text-warning-foreground">
                    <Lightbulb className="h-4 w-4 inline mr-1" />
                    Hint {idx + 1}: {hint}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Answer Input */}
          <div className="flex gap-2">
            <Input
              type={problem.inputType === "number" ? "number" : "text"}
              value={answers[problem.id] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [problem.id]: e.target.value }))
              }
              placeholder="Enter your answer..."
              disabled={hasResult || readOnly}
              className={cn(
                hasResult && results[problem.id] && "border-success",
                hasResult && !results[problem.id] && "border-destructive"
              )}
            />
            {!hasResult && !readOnly && (
              <Button onClick={handleSubmitAnswer} disabled={!answers[problem.id]}>
                Check
              </Button>
            )}
          </div>

          {/* Result feedback */}
          {hasResult && (
            <div
              className={cn(
                "p-3 rounded-lg",
                results[problem.id]
                  ? "bg-success/10"
                  : "bg-destructive/10"
              )}
            >
              <p className="text-sm font-medium">
                {results[problem.id] ? (
                  <span className="text-success">
                    <Check className="h-4 w-4 inline mr-1" />
                    Correct!
                  </span>
                ) : (
                  <span className="text-destructive">
                    <X className="h-4 w-4 inline mr-1" />
                    Not quite. {showSolution && `The answer is: ${problem.correctAnswer}`}
                  </span>
                )}
              </p>
              {problem.solution && showSolution && (
                <p className="text-sm text-muted-foreground mt-1">{problem.solution}</p>
              )}
            </div>
          )}

          {/* Hint button */}
          {!hasResult && problem.hints.length > 0 && (showHint[problem.id] || 0) < problem.hints.length && (
            <Button variant="ghost" size="sm" onClick={handleNextHint}>
              <HelpCircle className="h-4 w-4 mr-1" />
              Get Hint ({(showHint[problem.id] || 0) + 1}/{problem.hints.length})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentProblem((prev) => Math.max(0, prev - 1))}
          disabled={currentProblem === 0}
        >
          Previous
        </Button>

        {currentProblem < problems.length - 1 ? (
          <Button onClick={() => setCurrentProblem((prev) => prev + 1)}>
            Next Problem
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : canComplete && !readOnly ? (
          <Button onClick={() => onComplete(Math.round((correctCount / problems.length) * 100))}>
            <Check className="h-4 w-4 mr-2" />
            Complete Practice
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              // Reset and retry incorrect ones
              setAnswers({});
              setResults({});
              setShowHint({});
              setCurrentProblem(0);
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

// Reading Renderer
function ReadingRenderer({
  activity,
  onComplete,
  readOnly,
}: {
  activity: ReadingActivity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}) {
  const { text, keyTerms, audioUrl, wordCount } = activity.content;
  const [readProgress, setReadProgress] = useState(0);
  const [showTerms, setShowTerms] = useState(false);

  // Simulate reading progress based on scroll or time
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercent =
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setReadProgress(Math.max(readProgress, scrollPercent));
  };

  const canComplete = readProgress >= 80;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {wordCount && <span>{wordCount} words</span>}
        <span>~{activity.estimatedMinutes} min read</span>
        {audioUrl && (
          <Button variant="ghost" size="sm" className="gap-1">
            <Volume2 className="h-4 w-4" />
            Listen
          </Button>
        )}
      </div>

      {/* Reading content */}
      <Card>
        <CardContent
          className="pt-4 max-h-96 overflow-y-auto prose prose-sm dark:prose-invert"
          onScroll={handleScroll}
        >
          <div className="whitespace-pre-wrap">{text}</div>
        </CardContent>
      </Card>

      {/* Progress indicator */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Reading progress</span>
          <span className="text-muted-foreground">{Math.round(readProgress)}%</span>
        </div>
        <Progress value={readProgress} className="h-2" />
      </div>

      {/* Key Terms */}
      {keyTerms && keyTerms.length > 0 && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTerms(!showTerms)}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Key Terms ({keyTerms.length})
          </Button>
          {showTerms && (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <dl className="space-y-2">
                  {keyTerms.map((item, idx) => (
                    <div key={idx}>
                      <dt className="font-medium">{item.term}</dt>
                      <dd className="text-sm text-muted-foreground ml-4">
                        {item.definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Complete button */}
      {!readOnly && (
        <Button
          className="w-full"
          onClick={() => onComplete(100)}
          disabled={!canComplete}
        >
          {canComplete ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </>
          ) : (
            "Continue Reading..."
          )}
        </Button>
      )}
    </div>
  );
}

// Interactive Renderer - simplified version, supports drag-drop, sorting, matching
function InteractiveRenderer({
  activity,
  onComplete,
  readOnly,
}: {
  activity: InteractiveActivity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}) {
  const { interactionType, instructions, items, targets, pairs, sortableItems } = activity.content;
  const [completed, setCompleted] = useState(false);

  // Simplified interactive - would be more complex in real implementation
  const handleComplete = () => {
    setCompleted(true);
    onComplete(100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{interactionType.replace("_", " ")}</Badge>
        <span className="text-sm text-muted-foreground">Interactive Activity</span>
      </div>

      {instructions && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm">{instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Drag and Drop */}
      {interactionType === "drag_drop" && items && targets && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Items to place:</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Badge key={item.id} variant="secondary" className="cursor-move">
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Drop zones:</p>
              <div className="grid grid-cols-2 gap-2">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground"
                  >
                    {target.label}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching */}
      {interactionType === "matching" && pairs && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm mb-4">Match the items on the left with their pairs on the right:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {pairs.map((pair, idx) => (
                  <div key={idx} className="p-2 border rounded-lg text-sm">
                    {pair.left}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {pairs
                  .slice()
                  .sort(() => Math.random() - 0.5)
                  .map((pair, idx) => (
                    <div key={idx} className="p-2 border rounded-lg text-sm">
                      {pair.right}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sorting */}
      {interactionType === "sorting" && sortableItems && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm mb-4">Drag to arrange in the correct order:</p>
            <div className="space-y-2">
              {sortableItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg flex items-center gap-2 cursor-move"
                >
                  <span className="text-muted-foreground">:::</span>
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generic fallback */}
      {!["drag_drop", "matching", "sorting"].includes(interactionType) && (
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-muted-foreground">
              Interactive {interactionType} content would be rendered here.
            </p>
          </CardContent>
        </Card>
      )}

      {!readOnly && (
        <Button className="w-full" onClick={handleComplete} disabled={completed}>
          {completed ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Discussion Renderer
function DiscussionRenderer({
  activity,
  onComplete,
  readOnly,
}: {
  activity: DiscussionActivity;
  onComplete: (score?: number) => void;
  readOnly?: boolean;
}) {
  const { prompt, guidingQuestions, minimumResponse, rubric } = activity.content;
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const meetsMinimum = wordCount >= (minimumResponse || 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
    onComplete(100);
  };

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{prompt}</p>
              {guidingQuestions && guidingQuestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Consider these guiding questions:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    {guidingQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response area */}
      <div className="space-y-2">
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your response here..."
          rows={6}
          disabled={submitted || readOnly}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {wordCount} words {minimumResponse && `(minimum: ${minimumResponse})`}
          </span>
          {!meetsMinimum && minimumResponse && (
            <span className="text-warning">
              {minimumResponse - wordCount} more words needed
            </span>
          )}
        </div>
      </div>

      {/* Rubric */}
      {rubric && rubric.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">Grading Rubric:</p>
            <div className="space-y-2">
              {rubric.map((item, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{item.criterion}</span>
                  <span className="text-muted-foreground"> ({item.points} pts)</span>
                  <p className="text-muted-foreground ml-4">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      {!readOnly && (
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!meetsMinimum || isSubmitting || submitted}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : submitted ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Submitted
            </>
          ) : (
            "Submit Response"
          )}
        </Button>
      )}
    </div>
  );
}

export default ActivityRenderer;
