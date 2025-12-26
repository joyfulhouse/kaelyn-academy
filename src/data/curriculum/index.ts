/**
 * Curriculum Index
 * Exports all curriculum data and utilities
 */

export * from "./types";
export { mathCurriculum } from "./math";
export { readingCurriculum } from "./reading";
export { scienceCurriculum } from "./science";
export { historyCurriculum } from "./history";
export { technologyCurriculum } from "./technology";

import { mathCurriculum } from "./math";
import { readingCurriculum } from "./reading";
import { scienceCurriculum } from "./science";
import { historyCurriculum } from "./history";
import { technologyCurriculum } from "./technology";
import type { Subject, Curriculum, GradeLevel, Unit, Lesson } from "./types";

/**
 * Complete curriculum data
 */
export const curriculum: Curriculum = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  subjects: [mathCurriculum, readingCurriculum, scienceCurriculum, historyCurriculum, technologyCurriculum],
};

/**
 * Get subject by ID
 */
export function getSubject(subjectId: string): Subject | undefined {
  return curriculum.subjects.find((s) => s.id === subjectId);
}

/**
 * Get all subjects
 */
export function getAllSubjects(): Subject[] {
  return curriculum.subjects;
}

/**
 * Get units for a specific grade and subject
 */
export function getUnitsForGrade(subjectId: string, grade: GradeLevel): Unit[] {
  const subject = getSubject(subjectId);
  if (!subject) return [];
  return subject.grades[grade] || [];
}

/**
 * Get a specific lesson by ID
 */
export function getLesson(
  subjectId: string,
  grade: GradeLevel,
  lessonId: string
): Lesson | undefined {
  const units = getUnitsForGrade(subjectId, grade);
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

/**
 * Get total lesson count for a subject
 */
export function getTotalLessonCount(subjectId: string): number {
  const subject = getSubject(subjectId);
  if (!subject) return 0;

  let count = 0;
  for (const grade of Object.keys(subject.grades)) {
    const units = subject.grades[Number(grade) as GradeLevel];
    if (units) {
      for (const unit of units) {
        count += unit.lessons.length;
      }
    }
  }
  return count;
}

/**
 * Get curriculum statistics
 */
export function getCurriculumStats(): {
  totalSubjects: number;
  totalUnits: number;
  totalLessons: number;
  subjectStats: { [key: string]: { units: number; lessons: number } };
} {
  let totalUnits = 0;
  let totalLessons = 0;
  const subjectStats: { [key: string]: { units: number; lessons: number } } = {};

  for (const subject of curriculum.subjects) {
    let subjectUnits = 0;
    let subjectLessons = 0;

    for (const grade of Object.keys(subject.grades)) {
      const units = subject.grades[Number(grade) as GradeLevel];
      if (units) {
        subjectUnits += units.length;
        for (const unit of units) {
          subjectLessons += unit.lessons.length;
        }
      }
    }

    totalUnits += subjectUnits;
    totalLessons += subjectLessons;
    subjectStats[subject.id] = { units: subjectUnits, lessons: subjectLessons };
  }

  return {
    totalSubjects: curriculum.subjects.length,
    totalUnits,
    totalLessons,
    subjectStats,
  };
}
