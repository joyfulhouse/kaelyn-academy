/**
 * Curriculum Utility Functions
 * Shared helpers for creating curriculum data structures
 */

import type { Lesson, LessonActivities } from "./types";

/**
 * Factory function to create a Lesson object with defaults
 */
export function createLesson(
  id: string,
  title: string,
  description: string,
  duration: number = 30,
  prerequisites: string[] = [],
  activities?: LessonActivities
): Lesson {
  return {
    id,
    title,
    slug: id,
    description,
    duration,
    objectives: [],
    prerequisites,
    activities: activities ?? [],
    assessmentType: "practice",
  };
}
