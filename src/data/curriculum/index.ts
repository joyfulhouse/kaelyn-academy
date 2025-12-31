/**
 * Curriculum Index
 * Exports all curriculum data and utilities
 */

export * from "./types";
export * from "./activities";
export { getActivitiesForLesson, lessonHasActivities } from "./sample-activities";
export { mathCurriculum } from "./math";
export { readingCurriculum } from "./reading";
export { scienceCurriculum } from "./science";
export { historyCurriculum } from "./history";
export { technologyCurriculum } from "./technology";
export {
  spanishCurriculum,
  frenchCurriculum,
  germanCurriculum,
  mandarinCurriculum,
  japaneseCurriculum,
  aslCurriculum,
  languageCurricula,
} from "./languages";
export { CurriculumIndex } from "./curriculum-index";

import { mathCurriculum } from "./math";
import { readingCurriculum } from "./reading";
import { scienceCurriculum } from "./science";
import { historyCurriculum } from "./history";
import { technologyCurriculum } from "./technology";
import { languageCurricula } from "./languages";
import { CurriculumIndex } from "./curriculum-index";
import type { Subject, Curriculum, GradeLevel, Unit, Lesson } from "./types";

/**
 * Complete curriculum data
 */
export const curriculum: Curriculum = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  subjects: [
    mathCurriculum,
    readingCurriculum,
    scienceCurriculum,
    historyCurriculum,
    technologyCurriculum,
    ...languageCurricula,
  ],
};

/**
 * Singleton CurriculumIndex for O(1) lookups
 * Initialized lazily on first access
 */
let _curriculumIndex: CurriculumIndex | null = null;

export function getCurriculumIndex(): CurriculumIndex {
  if (!_curriculumIndex) {
    _curriculumIndex = new CurriculumIndex(curriculum);
  }
  return _curriculumIndex;
}

/**
 * Get subject by ID - O(1) via CurriculumIndex
 */
export function getSubject(subjectId: string): Subject | undefined {
  return getCurriculumIndex().getSubject(subjectId);
}

/**
 * Get all subjects - O(1) via CurriculumIndex
 */
export function getAllSubjects(): Subject[] {
  return getCurriculumIndex().getAllSubjects();
}

/**
 * Get units for a specific grade and subject - O(1) via CurriculumIndex
 */
export function getUnitsForGrade(subjectId: string, grade: GradeLevel): Unit[] {
  return getCurriculumIndex().getUnitsForGrade(subjectId, grade);
}

/**
 * Get a specific lesson by ID - O(1) via CurriculumIndex
 * Note: subjectId and grade parameters are kept for backward compatibility
 * but are no longer needed for the lookup
 */
export function getLesson(
  _subjectId: string,
  _grade: GradeLevel,
  lessonId: string
): Lesson | undefined {
  return getCurriculumIndex().getLesson(lessonId);
}

/**
 * Get lesson by ID only - O(1) (preferred new API)
 */
export function getLessonById(lessonId: string): Lesson | undefined {
  return getCurriculumIndex().getLesson(lessonId);
}

/**
 * Get lesson with full context (unit, subject, grade) - O(1)
 */
export function getLessonWithContext(lessonId: string) {
  return getCurriculumIndex().getLessonEntry(lessonId);
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
 * Get curriculum statistics - uses CurriculumIndex for efficiency
 */
export function getCurriculumStats(): {
  totalSubjects: number;
  totalUnits: number;
  totalLessons: number;
  subjectStats: { [key: string]: { units: number; lessons: number } };
} {
  const index = getCurriculumIndex();
  const stats = index.getStats();

  // For backward compatibility, compute per-subject stats
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

    subjectStats[subject.id] = { units: subjectUnits, lessons: subjectLessons };
  }

  return {
    totalSubjects: stats.totalSubjects,
    totalUnits: stats.totalUnits,
    totalLessons: stats.totalLessons,
    subjectStats,
  };
}
