/**
 * Quiz Data - Modular Entry Point
 *
 * Provides lazy-loaded access to quiz configurations organized by grade.
 * Uses dynamic imports for code-splitting - only loads quizzes when needed.
 */

import type { QuizConfig } from "../types";

// Re-export defaults and factory
export { QUIZ_DEFAULTS, QUESTION_POINTS, createQuizConfig } from "./defaults";

// Type for grade identifiers
export type GradeLevel =
  | "kindergarten"
  | "grade1"
  | "grade2"
  | "grade3"
  | "grade4"
  | "grade5"
  | "grade6"
  | "grade7"
  | "grade8"
  | "grade9"
  | "grade10"
  | "grade11"
  | "grade12";

// Lesson ID prefixes mapped to grade levels
const LESSON_PREFIX_TO_GRADE: Record<string, GradeLevel> = {
  k: "kindergarten",
  "1": "grade1",
  "2": "grade2",
  "3": "grade3",
  "4": "grade4",
  "5": "grade5",
  "6": "grade6",
  "7": "grade7",
  "8": "grade8",
  "9": "grade9",
  "10": "grade10",
  "11": "grade11",
  "12": "grade12",
};

// Cache for loaded grade modules
const loadedGrades: Partial<Record<GradeLevel, Record<string, QuizConfig>>> = {};

/**
 * Dynamically import a grade's quiz module
 */
async function loadGradeQuizzes(
  grade: GradeLevel
): Promise<Record<string, QuizConfig>> {
  if (loadedGrades[grade]) {
    return loadedGrades[grade]!;
  }

  let quizzes: Record<string, QuizConfig>;

  switch (grade) {
    case "kindergarten": {
      const mod = await import("./kindergarten");
      quizzes = mod.kindergartenQuizzes;
      break;
    }
    case "grade1": {
      const mod = await import("./grade1");
      quizzes = mod.grade1Quizzes;
      break;
    }
    case "grade2": {
      const mod = await import("./grade2");
      quizzes = mod.grade2Quizzes;
      break;
    }
    case "grade3": {
      const mod = await import("./grade3");
      quizzes = mod.grade3Quizzes;
      break;
    }
    case "grade4": {
      const mod = await import("./grade4");
      quizzes = mod.grade4Quizzes;
      break;
    }
    case "grade5": {
      const mod = await import("./grade5");
      quizzes = mod.grade5Quizzes;
      break;
    }
    case "grade6": {
      const mod = await import("./grade6");
      quizzes = mod.grade6Quizzes;
      break;
    }
    case "grade7": {
      const mod = await import("./grade7");
      quizzes = mod.grade7Quizzes;
      break;
    }
    case "grade8": {
      const mod = await import("./grade8");
      quizzes = mod.grade8Quizzes;
      break;
    }
    case "grade9": {
      const mod = await import("./grade9");
      quizzes = mod.grade9Quizzes;
      break;
    }
    case "grade10": {
      const mod = await import("./grade10");
      quizzes = mod.grade10Quizzes;
      break;
    }
    case "grade11": {
      const mod = await import("./grade11");
      quizzes = mod.grade11Quizzes;
      break;
    }
    case "grade12": {
      const mod = await import("./grade12");
      quizzes = mod.grade12Quizzes;
      break;
    }
    default:
      throw new Error(`Unknown grade level: ${grade}`);
  }

  loadedGrades[grade] = quizzes;
  return quizzes;
}

/**
 * Determine grade level from lesson ID
 */
function getGradeFromLessonId(lessonId: string): GradeLevel | null {
  // Handle kindergarten (k-*)
  if (lessonId.startsWith("k-")) {
    return "kindergarten";
  }

  // Handle grades 1-12 (N-*)
  const match = lessonId.match(/^(\d+)-/);
  if (match) {
    const grade = LESSON_PREFIX_TO_GRADE[match[1]];
    return grade || null;
  }

  return null;
}

/**
 * Get a quiz configuration by lesson ID
 * Lazily loads only the required grade module
 */
export async function getQuizForLesson(
  lessonId: string
): Promise<QuizConfig | null> {
  const grade = getGradeFromLessonId(lessonId);
  if (!grade) {
    return null;
  }

  const quizzes = await loadGradeQuizzes(grade);
  return quizzes[lessonId] || null;
}

/**
 * Check if a lesson has an associated quiz
 */
export async function hasQuiz(lessonId: string): Promise<boolean> {
  const quiz = await getQuizForLesson(lessonId);
  return quiz !== null;
}

/**
 * Get all quiz IDs for a specific grade
 */
export async function getQuizIdsForGrade(grade: GradeLevel): Promise<string[]> {
  const quizzes = await loadGradeQuizzes(grade);
  return Object.keys(quizzes);
}

/**
 * Get all quizzes for a specific grade
 */
export async function getQuizzesForGrade(
  grade: GradeLevel
): Promise<Record<string, QuizConfig>> {
  return loadGradeQuizzes(grade);
}

/**
 * Preload quizzes for specific grades
 * Useful for prefetching when navigating to a grade dashboard
 */
export async function preloadGrades(grades: GradeLevel[]): Promise<void> {
  await Promise.all(grades.map((grade) => loadGradeQuizzes(grade)));
}

/**
 * Synchronous version for cases where quiz data is already loaded
 * Returns null if the grade hasn't been loaded yet
 */
export function getQuizForLessonSync(lessonId: string): QuizConfig | null {
  const grade = getGradeFromLessonId(lessonId);
  if (!grade || !loadedGrades[grade]) {
    return null;
  }
  return loadedGrades[grade]![lessonId] || null;
}

/**
 * Check if a grade's quizzes are already loaded
 */
export function isGradeLoaded(grade: GradeLevel): boolean {
  return !!loadedGrades[grade];
}
