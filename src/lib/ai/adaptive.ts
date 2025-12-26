import { generateObject } from "ai";
import { z } from "zod";
import { getModelForCapability, type AIProvider } from "./providers";

export interface PerformanceData {
  learnerId: string;
  subject: string;
  conceptId: string;
  recentAttempts: Array<{
    questionDifficulty: number; // 1-10
    correct: boolean;
    timeSpent: number; // seconds
    hintsUsed: number;
  }>;
  currentDifficultyLevel: number; // 1-10
  masteryScore: number; // 0-100
}

const difficultyAdjustmentSchema = z.object({
  newDifficultyLevel: z.number().min(1).max(10).describe("The recommended new difficulty level (1-10)"),
  adjustment: z.enum(["decrease", "maintain", "increase"]).describe("Direction of difficulty change"),
  confidence: z.number().min(0).max(100).describe("Confidence in this recommendation (0-100)"),
  reasoning: z.string().describe("Brief explanation of the adjustment decision"),
  recommendedPracticeType: z.enum([
    "review",           // Go back to basics
    "reinforcement",    // More practice at current level
    "advancement",      // Ready for harder material
    "mixed",           // Combination of levels
  ]).describe("Type of practice recommended"),
  estimatedMastery: z.number().min(0).max(100).describe("Estimated mastery after adjustment"),
});

export type DifficultyAdjustment = z.infer<typeof difficultyAdjustmentSchema>;

export async function calculateDifficultyAdjustment(
  data: PerformanceData,
  preferredProvider?: AIProvider
): Promise<DifficultyAdjustment> {
  const model = getModelForCapability("adaptive", preferredProvider);

  const recentPerformance = data.recentAttempts.slice(-10);
  const correctCount = recentPerformance.filter((a) => a.correct).length;
  const avgTimePerQuestion = recentPerformance.reduce((sum, a) => sum + a.timeSpent, 0) / recentPerformance.length;
  const avgHintsUsed = recentPerformance.reduce((sum, a) => sum + a.hintsUsed, 0) / recentPerformance.length;

  const prompt = `
Analyze this student's recent performance and recommend a difficulty adjustment.

PERFORMANCE SUMMARY:
- Current difficulty level: ${data.currentDifficultyLevel}/10
- Current mastery score: ${data.masteryScore}%
- Recent attempts: ${recentPerformance.length}
- Correct answers: ${correctCount}/${recentPerformance.length} (${Math.round((correctCount / recentPerformance.length) * 100)}%)
- Average time per question: ${Math.round(avgTimePerQuestion)} seconds
- Average hints used: ${avgHintsUsed.toFixed(1)}

RECENT ATTEMPT DETAILS:
${recentPerformance.map((a, i) =>
  `${i + 1}. Difficulty ${a.questionDifficulty}: ${a.correct ? "Correct" : "Incorrect"}, ${a.timeSpent}s, ${a.hintsUsed} hints`
).join("\n")}

GUIDELINES:
- If accuracy is high (>80%) and hints are low, consider increasing difficulty
- If accuracy is low (<50%) or many hints used, consider decreasing difficulty
- If accuracy is moderate (50-80%), maintain or make small adjustments
- Consider time spent - fast correct answers suggest mastery
- Slow but correct answers may indicate the level is appropriate
- Multiple hints suggest the material is too challenging
- Make gradual adjustments (usually 1-2 levels at a time)

Provide your analysis and recommendation.
`;

  const result = await generateObject({
    model,
    schema: difficultyAdjustmentSchema,
    prompt,
    temperature: 0.3, // Lower temperature for more consistent decisions
  });

  return result.object;
}

// Quick heuristic-based adjustment (no AI call - for real-time use)
export function quickDifficultyAdjustment(data: PerformanceData): {
  newLevel: number;
  adjustment: "decrease" | "maintain" | "increase";
} {
  const recent = data.recentAttempts.slice(-5);
  if (recent.length === 0) {
    return { newLevel: data.currentDifficultyLevel, adjustment: "maintain" };
  }

  const correctRate = recent.filter((a) => a.correct).length / recent.length;
  const avgHints = recent.reduce((sum, a) => sum + a.hintsUsed, 0) / recent.length;

  // High performance - increase difficulty
  if (correctRate >= 0.8 && avgHints < 0.5) {
    const newLevel = Math.min(10, data.currentDifficultyLevel + 1);
    return { newLevel, adjustment: newLevel > data.currentDifficultyLevel ? "increase" : "maintain" };
  }

  // Struggling - decrease difficulty
  if (correctRate < 0.5 || avgHints > 2) {
    const newLevel = Math.max(1, data.currentDifficultyLevel - 1);
    return { newLevel, adjustment: newLevel < data.currentDifficultyLevel ? "decrease" : "maintain" };
  }

  // Moderate performance - maintain
  return { newLevel: data.currentDifficultyLevel, adjustment: "maintain" };
}

export interface LearningPathRecommendation {
  nextConcepts: string[];
  reviewConcepts: string[];
  skipConcepts: string[];
  estimatedTimeToMastery: number; // minutes
  focusAreas: string[];
}

const learningPathSchema = z.object({
  nextConcepts: z.array(z.string()).describe("Concepts the student should learn next"),
  reviewConcepts: z.array(z.string()).describe("Concepts that need review"),
  skipConcepts: z.array(z.string()).describe("Concepts the student can skip (already mastered)"),
  estimatedTimeToMastery: z.number().describe("Estimated minutes to achieve mastery"),
  focusAreas: z.array(z.string()).describe("Key areas to focus on"),
});

export interface LearnerProgress {
  learnerId: string;
  subject: string;
  gradeLevel: number;
  conceptMastery: Array<{
    conceptId: string;
    conceptName: string;
    masteryScore: number;
    lastPracticed: Date | null;
  }>;
  learningPreferences?: {
    preferredPace: "slow" | "moderate" | "fast";
    bestTimeOfDay?: string;
    preferredContentType?: "visual" | "reading" | "interactive";
  };
}

export async function generateLearningPath(
  progress: LearnerProgress,
  availableConcepts: string[],
  preferredProvider?: AIProvider
): Promise<LearningPathRecommendation> {
  const model = getModelForCapability("adaptive", preferredProvider);

  const prompt = `
Create a personalized learning path for this student.

STUDENT PROFILE:
- Grade Level: ${progress.gradeLevel}
- Subject: ${progress.subject}
${progress.learningPreferences ? `- Preferred pace: ${progress.learningPreferences.preferredPace}` : ""}
${progress.learningPreferences?.preferredContentType ? `- Preferred content: ${progress.learningPreferences.preferredContentType}` : ""}

CURRENT MASTERY:
${progress.conceptMastery.map((c) =>
  `- ${c.conceptName}: ${c.masteryScore}% ${c.lastPracticed ? `(last practiced: ${c.lastPracticed.toLocaleDateString()})` : "(never practiced)"}`
).join("\n")}

AVAILABLE CONCEPTS TO RECOMMEND:
${availableConcepts.join(", ")}

GUIDELINES:
- Concepts with <60% mastery need review
- Concepts with >90% mastery can be skipped
- Consider prerequisites and logical learning order
- For slower learners, recommend fewer concepts at a time
- Prioritize foundational concepts that enable others
`;

  const result = await generateObject({
    model,
    schema: learningPathSchema,
    prompt,
    temperature: 0.4,
  });

  return result.object;
}
