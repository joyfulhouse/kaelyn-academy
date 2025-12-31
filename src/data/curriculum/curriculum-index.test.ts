/**
 * Tests for CurriculumIndex
 */

import { describe, it, expect, beforeAll } from "vitest";
import { CurriculumIndex } from "./curriculum-index";
import { curriculum } from "./index";

describe("CurriculumIndex", () => {
  let index: CurriculumIndex;

  beforeAll(() => {
    index = new CurriculumIndex(curriculum);
  });

  describe("getStats", () => {
    it("should return non-zero counts for subjects, units, and lessons", () => {
      const stats = index.getStats();

      expect(stats.totalSubjects).toBeGreaterThan(0);
      expect(stats.totalUnits).toBeGreaterThan(0);
      expect(stats.totalLessons).toBeGreaterThan(0);
    });
  });

  describe("getSubject", () => {
    it("should return math subject", () => {
      const math = index.getSubject("math");

      expect(math).toBeDefined();
      expect(math?.name).toBe("Mathematics");
    });

    it("should return undefined for non-existent subject", () => {
      const result = index.getSubject("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getAllSubjects", () => {
    it("should return all subjects", () => {
      const subjects = index.getAllSubjects();

      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects.some((s) => s.id === "math")).toBe(true);
      expect(subjects.some((s) => s.id === "reading")).toBe(true);
    });
  });

  describe("getUnitsForGrade", () => {
    it("should return units for math grade 0 (kindergarten)", () => {
      const units = index.getUnitsForGrade("math", 0);

      expect(units.length).toBeGreaterThan(0);
      expect(units[0].lessons.length).toBeGreaterThan(0);
    });

    it("should return empty array for non-existent grade", () => {
      const units = index.getUnitsForGrade("math", 99 as never);

      expect(units).toEqual([]);
    });
  });

  describe("getLesson", () => {
    it("should return lesson by ID", () => {
      // Get a lesson ID from the curriculum
      const units = index.getUnitsForGrade("math", 0);
      const firstLessonId = units[0]?.lessons[0]?.id;

      if (firstLessonId) {
        const lesson = index.getLesson(firstLessonId);

        expect(lesson).toBeDefined();
        expect(lesson?.id).toBe(firstLessonId);
      }
    });

    it("should return undefined for non-existent lesson", () => {
      const result = index.getLesson("nonexistent-lesson");

      expect(result).toBeUndefined();
    });
  });

  describe("getLessonEntry", () => {
    it("should return lesson with full context", () => {
      const units = index.getUnitsForGrade("math", 0);
      const firstLessonId = units[0]?.lessons[0]?.id;

      if (firstLessonId) {
        const entry = index.getLessonEntry(firstLessonId);

        expect(entry).toBeDefined();
        expect(entry?.lesson.id).toBe(firstLessonId);
        expect(entry?.subject.id).toBe("math");
        expect(entry?.grade).toBe(0);
        expect(entry?.unit).toBeDefined();
      }
    });
  });

  describe("hasLesson / hasUnit / hasSubject", () => {
    it("should correctly detect existence", () => {
      expect(index.hasSubject("math")).toBe(true);
      expect(index.hasSubject("nonexistent")).toBe(false);

      const units = index.getUnitsForGrade("math", 0);
      if (units[0]) {
        expect(index.hasUnit(units[0].id)).toBe(true);
        if (units[0].lessons[0]) {
          expect(index.hasLesson(units[0].lessons[0].id)).toBe(true);
        }
      }
    });
  });
});
