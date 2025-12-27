/**
 * Curriculum Data Types
 * Structure for K-12 educational content
 */

import type { Activity } from "./activities";

export interface LearningObjective {
  id: string;
  description: string;
  bloomsLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
}

// Legacy activities support - string[] or Activity[]
export type LessonActivities = string[] | Activity[];

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number; // minutes
  objectives: LearningObjective[];
  prerequisites: string[]; // lesson IDs
  activities: LessonActivities;
  assessmentType: "quiz" | "project" | "practice" | "discussion";
}

export interface Unit {
  id: string;
  title: string;
  slug: string;
  description: string;
  gradeLevel: number;
  lessons: Lesson[];
  standardsAlignment: string[]; // Common Core, NGSS, etc.
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  grades: {
    [key: number]: Unit[];
  };
}

export interface Curriculum {
  version: string;
  lastUpdated: string;
  subjects: Subject[];
}

// Grade level utilities
export const GRADE_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type GradeLevel = (typeof GRADE_LEVELS)[number];

export function getGradeName(grade: GradeLevel): string {
  if (grade === 0) return "Kindergarten";
  if (grade <= 5) return `${grade}${getOrdinalSuffix(grade)} Grade - Elementary`;
  if (grade <= 8) return `${grade}${getOrdinalSuffix(grade)} Grade - Middle School`;
  return `${grade}${getOrdinalSuffix(grade)} Grade - High School`;
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
