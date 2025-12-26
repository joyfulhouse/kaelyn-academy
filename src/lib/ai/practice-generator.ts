/**
 * AI Practice Problem Generator
 * Generates adaptive practice problems using AI
 */

import type { DifficultyLevel } from "@/lib/adaptive/difficulty";

export type ProblemType =
  | "multiple-choice"
  | "fill-blank"
  | "short-answer"
  | "matching"
  | "ordering"
  | "true-false";

export interface PracticeProblem {
  id: string;
  type: ProblemType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: DifficultyLevel;
  subject: string;
  topic: string;
  hints: string[];
  timeEstimate: number; // seconds
}

export interface GeneratorConfig {
  subject: string;
  topic: string;
  gradeLevel: number;
  difficulty: DifficultyLevel;
  problemType?: ProblemType;
  count?: number;
}

/**
 * Generate a unique ID for a problem
 */
function generateId(): string {
  return `prob-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate placeholder problems based on topic and difficulty
 * In production, this would call an AI API
 */
export async function generateProblems(config: GeneratorConfig): Promise<PracticeProblem[]> {
  const count = config.count ?? 5;
  const problems: PracticeProblem[] = [];

  // Problem templates by subject (placeholder for AI generation)
  const templates: Record<string, Record<DifficultyLevel, string[]>> = {
    math: {
      1: ["What is {a} + {b}?", "Count the {objects}."],
      2: ["Calculate {a} × {b}.", "What is {a} - {b}?"],
      3: ["Solve: {a}x + {b} = {c}", "Find the area of a {shape}."],
      4: ["Factor: {a}x² + {b}x + {c}", "Calculate the slope between two points."],
      5: ["Derive f(x) = {expression}", "Evaluate the integral of {expression}."],
    },
    reading: {
      1: ["What word rhymes with '{word}'?", "Find the word that starts with '{letter}'."],
      2: ["What is the main idea of the paragraph?", "Who is the main character?"],
      3: ["What is the theme of the story?", "How does the author develop the plot?"],
      4: ["Analyze the author's use of {device}.", "Compare the perspectives of the characters."],
      5: ["Evaluate the argument presented.", "Synthesize information from multiple sources."],
    },
    science: {
      1: ["Is a {item} living or non-living?", "What do plants need to grow?"],
      2: ["What state of matter is {substance}?", "Name the parts of a plant."],
      3: ["Explain the water cycle.", "What is photosynthesis?"],
      4: ["Balance this equation: {equation}", "Describe cellular respiration."],
      5: ["Design an experiment to test {hypothesis}.", "Analyze the data to draw conclusions."],
    },
    history: {
      1: ["Who is a community helper?", "What is a family?"],
      2: ["What are the rules in school?", "Name the continents."],
      3: ["What caused the American Revolution?", "Describe colonial life."],
      4: ["Analyze the causes of World War I.", "Compare economic systems."],
      5: ["Evaluate the impact of {event}.", "Synthesize primary source evidence."],
    },
  };

  const subjectTemplates = templates[config.subject] ?? templates.math;
  const difficultyTemplates = subjectTemplates[config.difficulty] ?? subjectTemplates[3];

  for (let i = 0; i < count; i++) {
    const template = difficultyTemplates[i % difficultyTemplates.length];

    problems.push({
      id: generateId(),
      type: config.problemType ?? "multiple-choice",
      question: template.replace(/\{[^}]+\}/g, () => `[value]`),
      options: config.problemType === "multiple-choice"
        ? ["Option A", "Option B", "Option C", "Option D"]
        : undefined,
      correctAnswer: "Option A",
      explanation: "This is the explanation for the correct answer.",
      difficulty: config.difficulty,
      subject: config.subject,
      topic: config.topic,
      hints: [
        "Try breaking the problem into smaller parts.",
        "Remember the key concept for this topic.",
      ],
      timeEstimate: getTimeEstimate(config.difficulty),
    });
  }

  return problems;
}

/**
 * Get estimated time based on difficulty
 */
function getTimeEstimate(difficulty: DifficultyLevel): number {
  const estimates: Record<DifficultyLevel, number> = {
    1: 30,  // 30 seconds
    2: 45,
    3: 60,  // 1 minute
    4: 90,
    5: 120, // 2 minutes
  };
  return estimates[difficulty];
}

/**
 * Validate an answer
 */
export function validateAnswer(
  problem: PracticeProblem,
  userAnswer: string | string[]
): boolean {
  const correctAnswers = Array.isArray(problem.correctAnswer)
    ? problem.correctAnswer
    : [problem.correctAnswer];

  const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

  // Normalize and compare
  const normalizedCorrect = correctAnswers.map((a) => a.toLowerCase().trim());
  const normalizedUser = userAnswers.map((a) => a.toLowerCase().trim());

  return (
    normalizedCorrect.length === normalizedUser.length &&
    normalizedCorrect.every((a) => normalizedUser.includes(a))
  );
}

/**
 * Get a hint for a problem
 */
export function getHint(problem: PracticeProblem, hintIndex: number): string | null {
  if (hintIndex >= problem.hints.length) {
    return null;
  }
  return problem.hints[hintIndex];
}

/**
 * Create a practice session
 */
export interface PracticeSession {
  id: string;
  problems: PracticeProblem[];
  currentIndex: number;
  answers: Map<string, { answer: string | string[]; isCorrect: boolean; timeSpent: number }>;
  startTime: Date;
  config: GeneratorConfig;
}

export function createPracticeSession(
  problems: PracticeProblem[],
  config: GeneratorConfig
): PracticeSession {
  return {
    id: generateId(),
    problems,
    currentIndex: 0,
    answers: new Map(),
    startTime: new Date(),
    config,
  };
}

/**
 * Record an answer in a session
 */
export function recordAnswer(
  session: PracticeSession,
  problemId: string,
  answer: string | string[],
  timeSpent: number
): PracticeSession {
  const problem = session.problems.find((p) => p.id === problemId);
  if (!problem) return session;

  const isCorrect = validateAnswer(problem, answer);

  session.answers.set(problemId, { answer, isCorrect, timeSpent });

  return {
    ...session,
    currentIndex: session.currentIndex + 1,
  };
}

/**
 * Get session statistics
 */
export function getSessionStats(session: PracticeSession): {
  totalProblems: number;
  attempted: number;
  correct: number;
  accuracy: number;
  averageTime: number;
  totalTime: number;
} {
  const answers = Array.from(session.answers.values());
  const correct = answers.filter((a) => a.isCorrect).length;
  const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);

  return {
    totalProblems: session.problems.length,
    attempted: answers.length,
    correct,
    accuracy: answers.length > 0 ? correct / answers.length : 0,
    averageTime: answers.length > 0 ? totalTime / answers.length : 0,
    totalTime,
  };
}
