"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Trophy,
  Loader2,
  BookOpen,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options?: string[];
  type: "multiple-choice" | "fill-in-blank" | "true-false" | "short-answer";
  correctIndex?: number;
  answer?: string;
  acceptableAnswers?: string[];
  explanation: string;
  hint?: string;
}

interface GeneratedResult {
  questions: Question[];
  pedagogicalRationale?: string;
  targetedWeaknesses?: string[];
}

type Step = "config" | "practice" | "results";

interface PracticeConfig {
  subject: string;
  conceptName: string;
  gradeLevel: number;
  difficultyLevel: number;
  questionType: string;
  count: number;
}

interface Answer {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number;
}

interface PracticeGeneratorProps {
  subjects?: Array<{ id: string; name: string }>;
  gradeLevel?: number;
  learnerId?: string;
}

const QUESTION_TYPES = [
  { id: "multiple-choice", label: "Multiple Choice", icon: "🔘" },
  { id: "fill-in-blank", label: "Fill in the Blank", icon: "✏️" },
  { id: "true-false", label: "True/False", icon: "⚖️" },
  { id: "short-answer", label: "Short Answer", icon: "📝" },
];

const DEFAULT_SUBJECTS = [
  { id: "math", name: "Mathematics" },
  { id: "reading", name: "Reading & ELA" },
  { id: "science", name: "Science" },
  { id: "history", name: "History" },
];

export function PracticeGenerator({
  subjects = DEFAULT_SUBJECTS,
  gradeLevel = 5,
  learnerId,
}: PracticeGeneratorProps) {
  const [step, setStep] = useState<Step>("config");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config state
  const [config, setConfig] = useState<PracticeConfig>({
    subject: subjects[0]?.id || "math",
    conceptName: "",
    gradeLevel,
    difficultyLevel: 3,
    questionType: "multiple-choice",
    count: 5,
  });

  // Practice state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>("");
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Results state
  const [sessionStats, setSessionStats] = useState<{
    correct: number;
    total: number;
    averageTime: number;
    totalTime: number;
  } | null>(null);

  const generateQuestions = async () => {
    if (!config.conceptName.trim()) {
      setError("Please enter a topic or concept to practice");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/agents/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: config.subject,
          gradeLevel: config.gradeLevel,
          conceptName: config.conceptName,
          difficultyLevel: config.difficultyLevel,
          questionType: config.questionType,
          count: config.count,
          learnerId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate questions");
      }

      const result: GeneratedResult = await response.json();

      if (!result.questions || result.questions.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }

      setQuestions(result.questions);
      setCurrentIndex(0);
      setAnswers([]);
      setStep("practice");
      setStartTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = useCallback(() => {
    if (selectedAnswer === "" || selectedAnswer === undefined) return;

    const currentQuestion = questions[currentIndex];
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    // Check if answer is correct
    let isCorrect = false;
    if (currentQuestion.type === "multiple-choice" && currentQuestion.options) {
      isCorrect =
        typeof selectedAnswer === "number" &&
        selectedAnswer === currentQuestion.correctIndex;
    } else if (currentQuestion.type === "true-false") {
      const correctAnswer = currentQuestion.answer?.toLowerCase();
      isCorrect = String(selectedAnswer).toLowerCase() === correctAnswer;
    } else if (currentQuestion.type === "fill-in-blank") {
      const acceptable = currentQuestion.acceptableAnswers || [currentQuestion.answer || ""];
      isCorrect = acceptable.some(
        (a) => a?.toLowerCase().trim() === String(selectedAnswer).toLowerCase().trim()
      );
    } else if (currentQuestion.type === "short-answer") {
      // For short answer, we just record it - manual review needed
      isCorrect = true; // Placeholder
    }

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setShowExplanation(true);
  }, [selectedAnswer, questions, currentIndex, startTime]);

  const nextQuestion = useCallback(() => {
    setShowExplanation(false);
    setShowHint(false);
    setSelectedAnswer("");

    if (currentIndex + 1 >= questions.length) {
      // Calculate final stats
      const allAnswers = [...answers];
      const correct = allAnswers.filter((a) => a.isCorrect).length;
      const totalTime = allAnswers.reduce((sum, a) => sum + a.timeSpent, 0);

      setSessionStats({
        correct,
        total: allAnswers.length,
        averageTime: allAnswers.length > 0 ? Math.round(totalTime / allAnswers.length) : 0,
        totalTime,
      });
      setStep("results");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  }, [currentIndex, questions.length, answers]);

  const resetPractice = () => {
    setStep("config");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setShowHint(false);
    setShowExplanation(false);
    setSessionStats(null);
    setConfig((prev) => ({ ...prev, conceptName: "" }));
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Configuration Step */}
      {step === "config" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Practice Problem Generator
            </CardTitle>
            <CardDescription>
              Generate personalized practice problems to strengthen your skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={config.subject}
                  onValueChange={(value) => setConfig((prev) => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger id="subject">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <Select
                  value={config.questionType}
                  onValueChange={(value) => setConfig((prev) => ({ ...prev, questionType: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Concept</Label>
              <Textarea
                id="topic"
                placeholder="e.g., Fractions, Photosynthesis, Civil War causes..."
                value={config.conceptName}
                onChange={(e) => setConfig((prev) => ({ ...prev, conceptName: e.target.value }))}
                className="resize-none"
                rows={2}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Difficulty Level</Label>
                <Badge variant="outline">Level {config.difficultyLevel}</Badge>
              </div>
              <Slider
                value={[config.difficultyLevel]}
                onValueChange={([value]) => setConfig((prev) => ({ ...prev, difficultyLevel: value }))}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Easier</span>
                <span>Harder</span>
              </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Number of Questions</Label>
                <Badge variant="outline">{config.count} questions</Badge>
              </div>
              <Slider
                value={[config.count]}
                onValueChange={([value]) => setConfig((prev) => ({ ...prev, count: value }))}
                min={3}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2"
              onClick={generateQuestions}
              disabled={generating || !config.conceptName.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Practice
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Practice Step */}
      {step === "practice" && currentQuestion && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {Math.round((Date.now() - startTime) / 1000)}s
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg font-medium">
                  {currentQuestion.question}
                </CardTitle>
                <Badge variant="secondary">
                  {QUESTION_TYPES.find((t) => t.id === currentQuestion.type)?.icon}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer Input */}
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <RadioGroup
                  value={String(selectedAnswer)}
                  onValueChange={(value) => setSelectedAnswer(parseInt(value, 10))}
                  disabled={showExplanation}
                >
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        showExplanation
                          ? idx === currentQuestion.correctIndex
                            ? "bg-success/10 border-success"
                            : selectedAnswer === idx
                            ? "bg-destructive/10 border-destructive"
                            : ""
                          : selectedAnswer === idx
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={String(idx)} id={`option-${idx}`} />
                      <Label
                        htmlFor={`option-${idx}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      {showExplanation && idx === currentQuestion.correctIndex && (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      )}
                      {showExplanation &&
                        selectedAnswer === idx &&
                        idx !== currentQuestion.correctIndex && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "true-false" && (
                <RadioGroup
                  value={String(selectedAnswer)}
                  onValueChange={setSelectedAnswer}
                  disabled={showExplanation}
                >
                  {["true", "false"].map((value) => (
                    <div
                      key={value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        showExplanation
                          ? value === currentQuestion.answer?.toLowerCase()
                            ? "bg-success/10 border-success"
                            : selectedAnswer === value
                            ? "bg-destructive/10 border-destructive"
                            : ""
                          : selectedAnswer === value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="flex-1 cursor-pointer capitalize">
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {(currentQuestion.type === "fill-in-blank" ||
                currentQuestion.type === "short-answer") && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={String(selectedAnswer)}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={showExplanation}
                  rows={currentQuestion.type === "short-answer" ? 4 : 2}
                />
              )}

              {/* Hint */}
              {!showExplanation && currentQuestion.hint && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="gap-1 text-muted-foreground"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Button>
                </div>
              )}

              {showHint && currentQuestion.hint && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>{currentQuestion.hint}</AlertDescription>
                </Alert>
              )}

              {/* Explanation */}
              {showExplanation && (
                <Alert
                  className={
                    currentAnswer?.isCorrect
                      ? "border-success bg-success/10"
                      : "border-warning bg-warning/10"
                  }
                >
                  <div className="flex items-start gap-2">
                    {currentAnswer?.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-warning mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">
                        {currentAnswer?.isCorrect ? "Correct!" : "Not quite right"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {!showExplanation ? (
                <>
                  <Button variant="outline" onClick={resetPractice}>
                    Cancel
                  </Button>
                  <Button
                    onClick={submitAnswer}
                    disabled={selectedAnswer === "" || selectedAnswer === undefined}
                    className="gap-2"
                  >
                    Submit Answer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    {answers.filter((a) => a.isCorrect).length}/{answers.length} correct
                  </div>
                  <Button onClick={nextQuestion} className="gap-2">
                    {currentIndex + 1 >= questions.length ? (
                      <>
                        See Results
                        <Trophy className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Results Step */}
      {step === "results" && sessionStats && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Practice Complete!</CardTitle>
            <CardDescription>
              Great job completing your practice session on {config.conceptName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
              </div>
              <p className="text-muted-foreground mt-1">
                {sessionStats.correct} out of {sessionStats.total} correct
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="flex justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">{sessionStats.correct}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="flex justify-center mb-2">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">{sessionStats.averageTime}s</div>
                <div className="text-xs text-muted-foreground">Avg. Time</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="flex justify-center mb-2">
                  <Target className="h-6 w-6 text-warning" />
                </div>
                <div className="text-2xl font-bold">Lv.{config.difficultyLevel}</div>
                <div className="text-xs text-muted-foreground">Difficulty</div>
              </div>
            </div>

            {/* Performance Message */}
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                {sessionStats.correct === sessionStats.total
                  ? "Perfect score! You've mastered this topic. Ready for a harder challenge?"
                  : sessionStats.correct >= sessionStats.total * 0.7
                  ? "Good work! Keep practicing to strengthen your understanding."
                  : "Keep practicing! Review the concepts and try again to improve your score."}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={resetPractice} className="flex-1 gap-2">
              <RotateCcw className="h-4 w-4" />
              New Practice
            </Button>
            <Button
              onClick={() => {
                setStep("config");
                // Keep same config for retry
                setQuestions([]);
                setAnswers([]);
                setCurrentIndex(0);
                setSessionStats(null);
              }}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              Retry Same Topic
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
