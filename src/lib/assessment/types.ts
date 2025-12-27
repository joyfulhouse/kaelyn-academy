/**
 * Assessment and Quiz Types
 * Type definitions for the quiz/assessment system
 */

/**
 * Question types supported by the assessment system
 */
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "matching"
  | "ordering";

/**
 * A single question in a quiz
 */
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  /** Display hint for the question (optional) */
  hint?: string;
  /** Options for multiple choice, matching source items, or ordering items */
  options?: string[];
  /** For matching: the target items to match with options */
  matchTargets?: string[];
  /** Correct answer - string for single answer, array for matching/ordering */
  correctAnswer: string | string[];
  /** Explanation shown after answering */
  explanation?: string;
  /** Points for this question (default: 10) */
  points?: number;
  /** Image URL to display with the question */
  imageUrl?: string;
}

/**
 * Quiz configuration
 */
export interface QuizConfig {
  /** Unique quiz ID (can be lessonId + "-quiz") */
  id: string;
  /** Quiz title */
  title: string;
  /** Brief instructions */
  instructions?: string;
  /** Questions in the quiz */
  questions: Question[];
  /** Time limit in seconds (optional) */
  timeLimit?: number;
  /** Allow retry after completion */
  allowRetry?: boolean;
  /** Show explanations after each question */
  showExplanations?: boolean;
  /** Passing score percentage (default: 70) */
  passingScore?: number;
  /** Shuffle question order */
  shuffleQuestions?: boolean;
  /** Shuffle option order for multiple choice */
  shuffleOptions?: boolean;
}

/**
 * User's answer to a question
 */
export interface QuestionAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent?: number; // seconds
}

/**
 * Result for a single question
 */
export interface QuestionResult {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  correctAnswer: string | string[];
  points: number;
  maxPoints: number;
  explanation?: string;
  timeSpent?: number;
}

/**
 * Complete quiz submission
 */
export interface QuizSubmission {
  lessonId: string;
  quizId: string;
  answers: QuestionAnswer[];
  totalTimeSpent: number; // seconds
}

/**
 * Quiz grading result
 */
export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  questionResults: QuestionResult[];
  totalTimeSpent: number;
  attemptNumber: number;
  completedAt: Date;
  /** AI-generated feedback */
  feedback?: string;
}

/**
 * Quiz attempt state (in-progress)
 */
export interface QuizAttemptState {
  quizId: string;
  startedAt: Date;
  currentQuestionIndex: number;
  answers: QuestionAnswer[];
  timeRemaining?: number; // seconds
}

/**
 * Grade a set of answers against the quiz config
 */
export function gradeQuiz(
  config: QuizConfig,
  answers: QuestionAnswer[]
): Omit<QuizResult, "attemptNumber" | "completedAt" | "feedback"> {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  const questionResults: QuestionResult[] = [];
  let totalScore = 0;
  let maxScore = 0;

  for (const question of config.questions) {
    const points = question.points ?? 10;
    maxScore += points;

    const userAnswer = answerMap.get(question.id);
    const isCorrect = checkAnswer(question, userAnswer?.answer);
    const earnedPoints = isCorrect ? points : 0;
    totalScore += earnedPoints;

    questionResults.push({
      questionId: question.id,
      answer: userAnswer?.answer ?? "",
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      points: earnedPoints,
      maxPoints: points,
      explanation: question.explanation,
      timeSpent: userAnswer?.timeSpent,
    });
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passingScore = config.passingScore ?? 70;

  return {
    quizId: config.id,
    score: totalScore,
    maxScore,
    percentage,
    passed: percentage >= passingScore,
    passingScore,
    questionResults,
    totalTimeSpent: answers.reduce((sum, a) => sum + (a.timeSpent ?? 0), 0),
  };
}

/**
 * Check if an answer is correct
 */
function checkAnswer(
  question: Question,
  answer: string | string[] | undefined
): boolean {
  if (!answer) return false;

  const correct = question.correctAnswer;

  switch (question.type) {
    case "multiple_choice":
    case "true_false":
    case "fill_blank":
      // Single answer comparison (case-insensitive for fill_blank)
      if (question.type === "fill_blank") {
        return (
          String(answer).toLowerCase().trim() ===
          String(correct).toLowerCase().trim()
        );
      }
      return String(answer) === String(correct);

    case "matching":
    case "ordering":
      // Array comparison - order matters for ordering, exact match for matching
      if (!Array.isArray(answer) || !Array.isArray(correct)) {
        return false;
      }
      if (answer.length !== correct.length) {
        return false;
      }
      return answer.every((a, i) => a === correct[i]);

    default:
      return false;
  }
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
