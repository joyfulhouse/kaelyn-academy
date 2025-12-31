/**
 * Quiz Defaults
 *
 * Common default values shared across all quiz configurations.
 * Reduces repetition and ensures consistency.
 */

import type { QuizConfig } from "../types";

/**
 * Default quiz configuration values.
 * Spread these into quiz configs to reduce boilerplate.
 */
export const QUIZ_DEFAULTS = {
  passingScore: 70,
  showExplanations: true,
  allowRetry: true,
} as const satisfies Partial<QuizConfig>;

/**
 * Default point values for different question types
 */
export const QUESTION_POINTS = {
  multipleChoice: 10,
  trueFalse: 10,
  matching: 20,
  ordering: 20,
  fillInBlank: 15,
} as const;

/**
 * Factory function to create a quiz config with defaults applied
 */
export function createQuizConfig(
  config: Omit<QuizConfig, "passingScore" | "showExplanations" | "allowRetry"> &
    Partial<Pick<QuizConfig, "passingScore" | "showExplanations" | "allowRetry">>
): QuizConfig {
  return {
    ...QUIZ_DEFAULTS,
    ...config,
  };
}
