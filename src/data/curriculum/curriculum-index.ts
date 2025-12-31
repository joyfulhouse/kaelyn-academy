/**
 * CurriculumIndex - O(1) Lookups for Curriculum Data
 *
 * Provides Map-based indexes for efficient curriculum lookups instead of
 * O(n*m*k) nested iterations through subjects→units→lessons.
 */

import type { Subject, Unit, Lesson, GradeLevel, Curriculum } from "./types";

interface LessonEntry {
  lesson: Lesson;
  unit: Unit;
  subject: Subject;
  grade: GradeLevel;
}

interface UnitEntry {
  unit: Unit;
  subject: Subject;
  grade: GradeLevel;
}

/**
 * CurriculumIndex builds and maintains Map-based indexes for O(1) lookups.
 * Initialize once at startup and reuse throughout the application.
 */
export class CurriculumIndex {
  private lessonMap: Map<string, LessonEntry> = new Map();
  private unitMap: Map<string, UnitEntry> = new Map();
  private subjectMap: Map<string, Subject> = new Map();
  private lessonsBySubjectGrade: Map<string, Lesson[]> = new Map();
  private unitsBySubjectGrade: Map<string, Unit[]> = new Map();

  constructor(curriculum: Curriculum) {
    this.buildIndexes(curriculum);
  }

  /**
   * Build all indexes from curriculum data - O(n) one-time cost
   */
  private buildIndexes(curriculum: Curriculum): void {
    for (const subject of curriculum.subjects) {
      // Index subject by ID
      this.subjectMap.set(subject.id, subject);

      // Iterate through grades
      for (const gradeStr of Object.keys(subject.grades)) {
        const grade = Number(gradeStr) as GradeLevel;
        const units = subject.grades[grade];
        if (!units) continue;

        // Create composite key for subject+grade lookups
        const subjectGradeKey = `${subject.id}:${grade}`;
        this.unitsBySubjectGrade.set(subjectGradeKey, units);

        const lessonsForGrade: Lesson[] = [];

        for (const unit of units) {
          // Index unit by ID
          this.unitMap.set(unit.id, { unit, subject, grade });

          for (const lesson of unit.lessons) {
            // Index lesson by ID
            this.lessonMap.set(lesson.id, { lesson, unit, subject, grade });
            lessonsForGrade.push(lesson);
          }
        }

        this.lessonsBySubjectGrade.set(subjectGradeKey, lessonsForGrade);
      }
    }
  }

  /**
   * Get lesson by ID - O(1)
   */
  getLesson(lessonId: string): Lesson | undefined {
    return this.lessonMap.get(lessonId)?.lesson;
  }

  /**
   * Get lesson with full context (unit, subject, grade) - O(1)
   */
  getLessonEntry(lessonId: string): LessonEntry | undefined {
    return this.lessonMap.get(lessonId);
  }

  /**
   * Get unit by ID - O(1)
   */
  getUnit(unitId: string): Unit | undefined {
    return this.unitMap.get(unitId)?.unit;
  }

  /**
   * Get unit with full context (subject, grade) - O(1)
   */
  getUnitEntry(unitId: string): UnitEntry | undefined {
    return this.unitMap.get(unitId);
  }

  /**
   * Get subject by ID - O(1)
   */
  getSubject(subjectId: string): Subject | undefined {
    return this.subjectMap.get(subjectId);
  }

  /**
   * Get all subjects - O(1)
   */
  getAllSubjects(): Subject[] {
    return Array.from(this.subjectMap.values());
  }

  /**
   * Get units for subject and grade - O(1)
   */
  getUnitsForGrade(subjectId: string, grade: GradeLevel): Unit[] {
    return this.unitsBySubjectGrade.get(`${subjectId}:${grade}`) ?? [];
  }

  /**
   * Get all lessons for subject and grade - O(1)
   */
  getLessonsForGrade(subjectId: string, grade: GradeLevel): Lesson[] {
    return this.lessonsBySubjectGrade.get(`${subjectId}:${grade}`) ?? [];
  }

  /**
   * Check if lesson exists - O(1)
   */
  hasLesson(lessonId: string): boolean {
    return this.lessonMap.has(lessonId);
  }

  /**
   * Check if unit exists - O(1)
   */
  hasUnit(unitId: string): boolean {
    return this.unitMap.has(unitId);
  }

  /**
   * Check if subject exists - O(1)
   */
  hasSubject(subjectId: string): boolean {
    return this.subjectMap.has(subjectId);
  }

  /**
   * Get index statistics
   */
  getStats(): {
    totalSubjects: number;
    totalUnits: number;
    totalLessons: number;
  } {
    return {
      totalSubjects: this.subjectMap.size,
      totalUnits: this.unitMap.size,
      totalLessons: this.lessonMap.size,
    };
  }

  /**
   * Get prerequisites for a lesson with resolved lesson objects - O(n) where n = prerequisite count
   */
  getLessonPrerequisites(lessonId: string): Lesson[] {
    const entry = this.lessonMap.get(lessonId);
    if (!entry) return [];

    return entry.lesson.prerequisites
      .map((prereqId) => this.lessonMap.get(prereqId)?.lesson)
      .filter((lesson): lesson is Lesson => lesson !== undefined);
  }

  /**
   * Get lessons that depend on the given lesson - O(n) where n = total lessons
   */
  getDependentLessons(lessonId: string): Lesson[] {
    const dependents: Lesson[] = [];
    for (const entry of this.lessonMap.values()) {
      if (entry.lesson.prerequisites.includes(lessonId)) {
        dependents.push(entry.lesson);
      }
    }
    return dependents;
  }
}
