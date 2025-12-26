import { describe, it, expect } from "vitest";
import {
  calculateMastery,
  calculateTimeAdjustedScore,
  shouldAdjustDifficulty,
  calculateNewDifficulty,
  getDifficultyLabel,
  getDifficultyColor,
  updateMetrics,
  createInitialMetrics,
  AdaptiveDifficultyManager,
  type PerformanceMetrics,
  type DifficultyConfig,
} from "./difficulty";

describe("Adaptive Difficulty System", () => {
  describe("calculateMastery", () => {
    it("returns 0 for no answers", () => {
      const metrics = createInitialMetrics();
      expect(calculateMastery(metrics)).toBe(0);
    });

    it("calculates correct mastery percentage", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        correctAnswers: 8,
        totalAnswers: 10,
      };
      expect(calculateMastery(metrics)).toBe(0.8);
    });

    it("returns 1 for perfect score", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        correctAnswers: 5,
        totalAnswers: 5,
      };
      expect(calculateMastery(metrics)).toBe(1);
    });
  });

  describe("calculateTimeAdjustedScore", () => {
    it("returns 0 for incorrect answers", () => {
      expect(calculateTimeAdjustedScore(false, 10, 30)).toBe(0);
    });

    it("returns base score of 1 for correct at expected time", () => {
      expect(calculateTimeAdjustedScore(true, 30, 30)).toBe(1);
    });

    it("gives bonus for faster answers", () => {
      const score = calculateTimeAdjustedScore(true, 15, 30);
      expect(score).toBeGreaterThan(1);
      expect(score).toBeLessThanOrEqual(1.5);
    });

    it("penalizes very slow answers", () => {
      const score = calculateTimeAdjustedScore(true, 90, 30);
      expect(score).toBeLessThan(1);
      expect(score).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe("shouldAdjustDifficulty", () => {
    it("maintains difficulty with insufficient data", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 3,
        correctAnswers: 3,
      };
      expect(shouldAdjustDifficulty(metrics)).toBe("maintain");
    });

    it("increases difficulty on correct streak", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 5,
        correctAnswers: 5,
        consecutiveCorrect: 3,
      };
      expect(shouldAdjustDifficulty(metrics)).toBe("increase");
    });

    it("decreases difficulty on incorrect streak", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 5,
        correctAnswers: 2,
        consecutiveIncorrect: 2,
      };
      expect(shouldAdjustDifficulty(metrics)).toBe("decrease");
    });
  });

  describe("calculateNewDifficulty", () => {
    it("increases difficulty when appropriate", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 10,
        correctAnswers: 10,
        consecutiveCorrect: 3,
      };
      expect(calculateNewDifficulty(3, metrics)).toBe(4);
    });

    it("decreases difficulty when appropriate", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 10,
        correctAnswers: 2,
        consecutiveIncorrect: 2,
      };
      expect(calculateNewDifficulty(3, metrics)).toBe(2);
    });

    it("does not exceed maximum difficulty", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 10,
        correctAnswers: 10,
        consecutiveCorrect: 5,
      };
      expect(calculateNewDifficulty(5, metrics)).toBe(5);
    });

    it("does not go below minimum difficulty", () => {
      const metrics: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 10,
        correctAnswers: 0,
        consecutiveIncorrect: 5,
      };
      expect(calculateNewDifficulty(1, metrics)).toBe(1);
    });
  });

  describe("getDifficultyLabel", () => {
    it("returns correct labels", () => {
      expect(getDifficultyLabel(1)).toBe("Beginner");
      expect(getDifficultyLabel(3)).toBe("Medium");
      expect(getDifficultyLabel(5)).toBe("Expert");
    });
  });

  describe("getDifficultyColor", () => {
    it("returns correct colors", () => {
      expect(getDifficultyColor(1)).toBe("bg-green-500");
      expect(getDifficultyColor(3)).toBe("bg-yellow-500");
      expect(getDifficultyColor(5)).toBe("bg-red-500");
    });
  });

  describe("updateMetrics", () => {
    it("updates metrics correctly for correct answer", () => {
      const initial = createInitialMetrics();
      const updated = updateMetrics(initial, true, 10);

      expect(updated.totalAnswers).toBe(1);
      expect(updated.correctAnswers).toBe(1);
      expect(updated.consecutiveCorrect).toBe(1);
      expect(updated.consecutiveIncorrect).toBe(0);
    });

    it("updates metrics correctly for incorrect answer", () => {
      const initial = createInitialMetrics();
      const updated = updateMetrics(initial, false, 10);

      expect(updated.totalAnswers).toBe(1);
      expect(updated.correctAnswers).toBe(0);
      expect(updated.consecutiveCorrect).toBe(0);
      expect(updated.consecutiveIncorrect).toBe(1);
    });

    it("resets streaks appropriately", () => {
      const withStreak: PerformanceMetrics = {
        ...createInitialMetrics(),
        totalAnswers: 3,
        correctAnswers: 3,
        consecutiveCorrect: 3,
      };
      const updated = updateMetrics(withStreak, false, 10);

      expect(updated.consecutiveCorrect).toBe(0);
      expect(updated.consecutiveIncorrect).toBe(1);
    });
  });

  describe("AdaptiveDifficultyManager", () => {
    it("initializes with default difficulty", () => {
      const manager = new AdaptiveDifficultyManager();
      expect(manager.getDifficulty()).toBe(3);
    });

    it("initializes with custom difficulty", () => {
      const manager = new AdaptiveDifficultyManager(2);
      expect(manager.getDifficulty()).toBe(2);
    });

    it("tracks performance over time", () => {
      const manager = new AdaptiveDifficultyManager(3);

      for (let i = 0; i < 5; i++) {
        manager.recordAnswer(true, 10);
      }

      const metrics = manager.getMetrics();
      expect(metrics.totalAnswers).toBe(5);
      expect(metrics.correctAnswers).toBe(5);
      expect(manager.getMastery()).toBe(1);
    });

    it("increases difficulty after correct streak", () => {
      const manager = new AdaptiveDifficultyManager(3);

      for (let i = 0; i < 5; i++) {
        manager.recordAnswer(true, 10);
      }

      expect(manager.getDifficulty()).toBe(4);
    });

    it("decreases difficulty after incorrect streak", () => {
      const manager = new AdaptiveDifficultyManager(3);

      // Need some initial data
      for (let i = 0; i < 5; i++) {
        manager.recordAnswer(false, 10);
      }

      expect(manager.getDifficulty()).toBe(2);
    });

    it("tracks difficulty history", () => {
      const manager = new AdaptiveDifficultyManager(3);

      for (let i = 0; i < 5; i++) {
        manager.recordAnswer(true, 10);
      }

      const history = manager.getDifficultyHistory();
      expect(history[0]).toBe(3); // initial
      expect(history[history.length - 1]).toBe(4); // after increase
    });

    it("can reset state", () => {
      const manager = new AdaptiveDifficultyManager(3);

      for (let i = 0; i < 5; i++) {
        manager.recordAnswer(true, 10);
      }

      manager.reset(2);

      expect(manager.getDifficulty()).toBe(2);
      expect(manager.getMastery()).toBe(0);
      expect(manager.getDifficultyHistory()).toEqual([2]);
    });
  });
});
