/**
 * Tests for Curriculum Index exports
 */
import { describe, it, expect } from "vitest";

describe("Curriculum Index", () => {
  describe("getCurriculumIndex", () => {
    it("should return a CurriculumIndex instance", async () => {
      const { getCurriculumIndex } = await import("./index");
      const index = getCurriculumIndex();
      expect(index).toBeDefined();
      expect(typeof index.getSubject).toBe("function");
    });

    it("should return the same instance on subsequent calls", async () => {
      const { getCurriculumIndex } = await import("./index");
      const index1 = getCurriculumIndex();
      const index2 = getCurriculumIndex();
      expect(index1).toBe(index2);
    });
  });

  describe("getSubject", () => {
    it("should return math curriculum", async () => {
      const { getSubject } = await import("./index");
      const math = getSubject("math");
      expect(math).toBeDefined();
      expect(math?.id).toBe("math");
      expect(math?.name).toBe("Mathematics");
    });

    it("should return reading curriculum", async () => {
      const { getSubject } = await import("./index");
      const reading = getSubject("reading");
      expect(reading).toBeDefined();
      expect(reading?.id).toBe("reading");
    });

    it("should return science curriculum", async () => {
      const { getSubject } = await import("./index");
      const science = getSubject("science");
      expect(science).toBeDefined();
      expect(science?.id).toBe("science");
    });

    it("should return undefined for unknown subject", async () => {
      const { getSubject } = await import("./index");
      const unknown = getSubject("unknown-subject");
      expect(unknown).toBeUndefined();
    });
  });

  describe("getAllSubjects", () => {
    it("should return all subjects", async () => {
      const { getAllSubjects } = await import("./index");
      const subjects = getAllSubjects();
      expect(subjects).toBeInstanceOf(Array);
      expect(subjects.length).toBeGreaterThan(0);

      const subjectIds = subjects.map((s) => s.id);
      expect(subjectIds).toContain("math");
      expect(subjectIds).toContain("reading");
      expect(subjectIds).toContain("science");
      expect(subjectIds).toContain("history");
      expect(subjectIds).toContain("technology");
    });
  });

  describe("getUnitsForGrade", () => {
    it("should return units for math grade 1", async () => {
      const { getUnitsForGrade } = await import("./index");
      const units = getUnitsForGrade("math", 1);
      expect(units).toBeInstanceOf(Array);
      expect(units.length).toBeGreaterThan(0);
    });

    it("should return empty array for unknown subject", async () => {
      const { getUnitsForGrade } = await import("./index");
      const units = getUnitsForGrade("unknown", 1);
      expect(units).toEqual([]);
    });
  });

  describe("getLesson", () => {
    it("should return a lesson by ID", async () => {
      const { getLesson, getUnitsForGrade } = await import("./index");

      // First get a valid lesson ID from the curriculum
      const units = getUnitsForGrade("math", 1);
      if (units.length > 0 && units[0].lessons.length > 0) {
        const lessonId = units[0].lessons[0].id;
        const lesson = getLesson("math", 1, lessonId);
        expect(lesson).toBeDefined();
        expect(lesson?.id).toBe(lessonId);
      }
    });

    it("should return undefined for unknown lesson", async () => {
      const { getLesson } = await import("./index");
      const lesson = getLesson("math", 1, "unknown-lesson-id");
      expect(lesson).toBeUndefined();
    });
  });

  describe("getLessonById", () => {
    it("should return a lesson by ID directly", async () => {
      const { getLessonById, getUnitsForGrade } = await import("./index");

      const units = getUnitsForGrade("math", 1);
      if (units.length > 0 && units[0].lessons.length > 0) {
        const lessonId = units[0].lessons[0].id;
        const lesson = getLessonById(lessonId);
        expect(lesson).toBeDefined();
        expect(lesson?.id).toBe(lessonId);
      }
    });

    it("should return undefined for unknown lesson", async () => {
      const { getLessonById } = await import("./index");
      const lesson = getLessonById("unknown-lesson-id");
      expect(lesson).toBeUndefined();
    });
  });

  describe("getLessonWithContext", () => {
    it("should return lesson with full context", async () => {
      const { getLessonWithContext, getUnitsForGrade } = await import("./index");

      const units = getUnitsForGrade("math", 1);
      if (units.length > 0 && units[0].lessons.length > 0) {
        const lessonId = units[0].lessons[0].id;
        const context = getLessonWithContext(lessonId);
        expect(context).toBeDefined();
        expect(context?.lesson.id).toBe(lessonId);
        expect(context?.subject).toBeDefined();
        expect(context?.unit).toBeDefined();
        expect(typeof context?.grade).toBe("number");
      }
    });

    it("should return undefined for unknown lesson", async () => {
      const { getLessonWithContext } = await import("./index");
      const context = getLessonWithContext("unknown-lesson-id");
      expect(context).toBeUndefined();
    });
  });

  describe("getTotalLessonCount", () => {
    it("should return lesson count for math", async () => {
      const { getTotalLessonCount } = await import("./index");
      const count = getTotalLessonCount("math");
      expect(count).toBeGreaterThan(0);
    });

    it("should return 0 for unknown subject", async () => {
      const { getTotalLessonCount } = await import("./index");
      const count = getTotalLessonCount("unknown-subject");
      expect(count).toBe(0);
    });
  });

  describe("getCurriculumStats", () => {
    it("should return curriculum statistics", async () => {
      const { getCurriculumStats } = await import("./index");
      const stats = getCurriculumStats();

      expect(stats.totalSubjects).toBeGreaterThan(0);
      expect(stats.totalUnits).toBeGreaterThan(0);
      expect(stats.totalLessons).toBeGreaterThan(0);
      expect(stats.subjectStats).toBeDefined();
      expect(stats.subjectStats["math"]).toBeDefined();
      expect(stats.subjectStats["math"].units).toBeGreaterThan(0);
      expect(stats.subjectStats["math"].lessons).toBeGreaterThan(0);
    });
  });

  describe("curriculum exports", () => {
    it("should export curriculum with all subjects", async () => {
      const { curriculum } = await import("./index");
      expect(curriculum).toBeDefined();
      expect(curriculum.version).toBe("1.0.0");
      expect(curriculum.subjects).toBeInstanceOf(Array);
      expect(curriculum.subjects.length).toBeGreaterThan(0);
    });

    it("should export individual curricula", async () => {
      const {
        mathCurriculum,
        readingCurriculum,
        scienceCurriculum,
        historyCurriculum,
        technologyCurriculum,
      } = await import("./index");

      expect(mathCurriculum).toBeDefined();
      expect(readingCurriculum).toBeDefined();
      expect(scienceCurriculum).toBeDefined();
      expect(historyCurriculum).toBeDefined();
      expect(technologyCurriculum).toBeDefined();
    });

    it("should export language curricula", async () => {
      const {
        spanishCurriculum,
        frenchCurriculum,
        germanCurriculum,
        mandarinCurriculum,
        japaneseCurriculum,
        aslCurriculum,
        languageCurricula,
      } = await import("./index");

      expect(spanishCurriculum).toBeDefined();
      expect(frenchCurriculum).toBeDefined();
      expect(germanCurriculum).toBeDefined();
      expect(mandarinCurriculum).toBeDefined();
      expect(japaneseCurriculum).toBeDefined();
      expect(aslCurriculum).toBeDefined();
      expect(languageCurricula).toBeInstanceOf(Array);
    });

    it("should export CurriculumIndex class", async () => {
      const { CurriculumIndex } = await import("./index");
      expect(CurriculumIndex).toBeDefined();
      expect(typeof CurriculumIndex).toBe("function");
    });
  });
});
