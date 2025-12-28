/**
 * Adaptive Difficulty System
 * Adjusts content difficulty based on learner performance
 */

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface PerformanceMetrics {
  correctAnswers: number;
  totalAnswers: number;
  averageTimePerQuestion: number; // seconds
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  streakHistory: ("correct" | "incorrect")[];
}

export interface DifficultyConfig {
  /** Target mastery threshold (0-1) */
  targetMastery: number;
  /** Minimum questions before adjusting difficulty */
  minQuestionsBeforeAdjust: number;
  /** How quickly to increase difficulty (0-1) */
  increaseSensitivity: number;
  /** How quickly to decrease difficulty (0-1) */
  decreaseSensitivity: number;
  /** Consecutive correct answers to increase difficulty */
  correctStreakThreshold: number;
  /** Consecutive incorrect answers to decrease difficulty */
  incorrectStreakThreshold: number;
}

export const DEFAULT_CONFIG: DifficultyConfig = {
  targetMastery: 0.8, // 80% correct
  minQuestionsBeforeAdjust: 5,
  increaseSensitivity: 0.6,
  decreaseSensitivity: 0.4,
  correctStreakThreshold: 3,
  incorrectStreakThreshold: 2,
};

/**
 * Calculate current mastery level
 */
export function calculateMastery(metrics: PerformanceMetrics): number {
  if (metrics.totalAnswers === 0) return 0;
  return metrics.correctAnswers / metrics.totalAnswers;
}

/**
 * Calculate time-adjusted score
 * Faster correct answers get bonus points
 */
export function calculateTimeAdjustedScore(
  isCorrect: boolean,
  timeSpent: number,
  expectedTime: number
): number {
  if (!isCorrect) return 0;

  // Base score of 1 for correct
  let score = 1;

  // Bonus for faster than expected (up to 50% bonus)
  if (timeSpent < expectedTime) {
    const speedBonus = Math.min(0.5, (expectedTime - timeSpent) / expectedTime);
    score += speedBonus;
  }

  // Penalty for much slower than expected (up to 30% penalty)
  if (timeSpent > expectedTime * 2) {
    const slowPenalty = Math.min(0.3, (timeSpent - expectedTime * 2) / expectedTime);
    score -= slowPenalty;
  }

  return Math.max(0, score);
}

/**
 * Determine if difficulty should change
 */
export function shouldAdjustDifficulty(
  metrics: PerformanceMetrics,
  config: DifficultyConfig = DEFAULT_CONFIG
): "increase" | "decrease" | "maintain" {
  // Not enough data yet
  if (metrics.totalAnswers < config.minQuestionsBeforeAdjust) {
    return "maintain";
  }

  const mastery = calculateMastery(metrics);

  // Check for streak-based adjustments (quick response to patterns)
  if (metrics.consecutiveCorrect >= config.correctStreakThreshold) {
    return "increase";
  }

  if (metrics.consecutiveIncorrect >= config.incorrectStreakThreshold) {
    return "decrease";
  }

  // Mastery-based adjustments
  if (mastery > config.targetMastery + config.increaseSensitivity * (1 - config.targetMastery)) {
    return "increase";
  }

  if (mastery < config.targetMastery * config.decreaseSensitivity) {
    return "decrease";
  }

  return "maintain";
}

/**
 * Calculate new difficulty level
 */
export function calculateNewDifficulty(
  currentDifficulty: DifficultyLevel,
  metrics: PerformanceMetrics,
  config: DifficultyConfig = DEFAULT_CONFIG
): DifficultyLevel {
  const adjustment = shouldAdjustDifficulty(metrics, config);

  switch (adjustment) {
    case "increase":
      return Math.min(5, currentDifficulty + 1) as DifficultyLevel;
    case "decrease":
      return Math.max(1, currentDifficulty - 1) as DifficultyLevel;
    default:
      return currentDifficulty;
  }
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(level: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    1: "Beginner",
    2: "Easy",
    3: "Medium",
    4: "Hard",
    5: "Expert",
  };
  return labels[level];
}

/**
 * Get difficulty color for UI (uses semantic tokens for dark mode support)
 */
export function getDifficultyColor(level: DifficultyLevel): string {
  const colors: Record<DifficultyLevel, string> = {
    1: "bg-success",
    2: "bg-info",
    3: "bg-warning",
    4: "bg-warning",
    5: "bg-destructive",
  };
  return colors[level];
}

/**
 * Create initial performance metrics
 */
export function createInitialMetrics(): PerformanceMetrics {
  return {
    correctAnswers: 0,
    totalAnswers: 0,
    averageTimePerQuestion: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    streakHistory: [],
  };
}

/**
 * Update metrics after answering a question
 */
export function updateMetrics(
  metrics: PerformanceMetrics,
  isCorrect: boolean,
  timeSpent: number
): PerformanceMetrics {
  const newTotal = metrics.totalAnswers + 1;
  const newCorrect = metrics.correctAnswers + (isCorrect ? 1 : 0);
  const newAvgTime =
    (metrics.averageTimePerQuestion * metrics.totalAnswers + timeSpent) / newTotal;

  const newStreak: "correct" | "incorrect" = isCorrect ? "correct" : "incorrect";
  const newStreakHistory: ("correct" | "incorrect")[] = [...metrics.streakHistory.slice(-9), newStreak];

  return {
    correctAnswers: newCorrect,
    totalAnswers: newTotal,
    averageTimePerQuestion: newAvgTime,
    consecutiveCorrect: isCorrect ? metrics.consecutiveCorrect + 1 : 0,
    consecutiveIncorrect: isCorrect ? 0 : metrics.consecutiveIncorrect + 1,
    streakHistory: newStreakHistory,
  };
}

/**
 * Adaptive difficulty manager for a learning session
 */
export class AdaptiveDifficultyManager {
  private metrics: PerformanceMetrics;
  private currentDifficulty: DifficultyLevel;
  private config: DifficultyConfig;
  private difficultyHistory: DifficultyLevel[];

  constructor(
    initialDifficulty: DifficultyLevel = 3,
    config: DifficultyConfig = DEFAULT_CONFIG
  ) {
    this.metrics = createInitialMetrics();
    this.currentDifficulty = initialDifficulty;
    this.config = config;
    this.difficultyHistory = [initialDifficulty];
  }

  recordAnswer(isCorrect: boolean, timeSpent: number): void {
    this.metrics = updateMetrics(this.metrics, isCorrect, timeSpent);

    const newDifficulty = calculateNewDifficulty(
      this.currentDifficulty,
      this.metrics,
      this.config
    );

    if (newDifficulty !== this.currentDifficulty) {
      this.currentDifficulty = newDifficulty;
      this.difficultyHistory.push(newDifficulty);
    }
  }

  getDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getMastery(): number {
    return calculateMastery(this.metrics);
  }

  getDifficultyHistory(): DifficultyLevel[] {
    return [...this.difficultyHistory];
  }

  reset(initialDifficulty: DifficultyLevel = 3): void {
    this.metrics = createInitialMetrics();
    this.currentDifficulty = initialDifficulty;
    this.difficultyHistory = [initialDifficulty];
  }
}
