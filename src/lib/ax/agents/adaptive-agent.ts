import { AxGen } from "@ax-llm/ax";
import { createAxAI, type AIProvider, type ModelTier } from "../index";

export interface AdaptiveInput {
  learnerId: string;
  subject: string;
  currentDifficulty: number; // 1-10
  masteryScore: number; // 0-100
  recentAttempts: Array<{
    questionDifficulty: number;
    correct: boolean;
    timeSpent: number; // seconds
    hintsUsed: number;
  }>;
}

export interface AdaptiveOutput {
  newDifficultyLevel: number;
  adjustment: "decrease" | "maintain" | "increase";
  confidence: number;
  reasoning: string;
  recommendedPracticeType: "review" | "reinforcement" | "advancement" | "mixed";
  estimatedMastery: number;
  specificWeaknesses: string[];
  specificStrengths: string[];
}

const ADAPTIVE_SIGNATURE = `"Analyze student performance and recommend optimal difficulty. High accuracy (>80%) + few hints = increase. Low accuracy (<50%) or many hints = decrease. Make gradual adjustments (1-2 levels)."
currentDifficulty:number, masteryScore:number, accuracyRate:number, avgTimePerQuestion:number, avgHintsUsed:number, attemptSummary:string ->
newDifficultyLevel:number "Recommended 1-10",
adjustment:class "decrease, maintain, increase" "Direction",
confidence:number "0-100 confidence",
reasoning:string "Brief explanation",
recommendedPracticeType:class "review, reinforcement, advancement, mixed" "Practice type",
estimatedMastery:number "Estimated mastery",
weaknesses:string "Comma-separated weaknesses",
strengths:string "Comma-separated strengths"`;

export class AdaptiveAgent {
  private provider: AIProvider;
  private tier: ModelTier;

  constructor(provider: AIProvider = "anthropic", tier: ModelTier = "fast") {
    this.provider = provider;
    this.tier = tier;
  }

  async analyze(input: AdaptiveInput): Promise<AdaptiveOutput> {
    const recent = input.recentAttempts.slice(-10);
    if (recent.length === 0) {
      return this.getDefaultRecommendation(input.currentDifficulty);
    }

    const ai = createAxAI(this.provider, this.tier);

    const correctCount = recent.filter((a) => a.correct).length;
    const accuracyRate = (correctCount / recent.length) * 100;
    const avgTimePerQuestion = recent.reduce((sum, a) => sum + a.timeSpent, 0) / recent.length;
    const avgHintsUsed = recent.reduce((sum, a) => sum + a.hintsUsed, 0) / recent.length;

    const attemptSummary = recent
      .map((a, i) =>
        `Attempt ${i + 1}: Difficulty ${a.questionDifficulty}, ${a.correct ? "Correct" : "Incorrect"}, ${a.timeSpent}s, ${a.hintsUsed} hints`
      )
      .join("; ");

    const gen = new AxGen<
      {
        currentDifficulty: number;
        masteryScore: number;
        accuracyRate: number;
        avgTimePerQuestion: number;
        avgHintsUsed: number;
        attemptSummary: string;
      },
      {
        newDifficultyLevel: number;
        adjustment: string;
        confidence: number;
        reasoning: string;
        recommendedPracticeType: string;
        estimatedMastery: number;
        weaknesses: string;
        strengths: string;
      }
    >(ADAPTIVE_SIGNATURE);

    const result = await gen.forward(ai, {
      currentDifficulty: input.currentDifficulty,
      masteryScore: input.masteryScore,
      accuracyRate: Math.round(accuracyRate),
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      avgHintsUsed: Math.round(avgHintsUsed * 10) / 10,
      attemptSummary,
    });

    return {
      newDifficultyLevel: Math.max(1, Math.min(10, result.newDifficultyLevel)),
      adjustment: (result.adjustment || "maintain") as AdaptiveOutput["adjustment"],
      confidence: typeof result.confidence === "number" ? result.confidence : 70,
      reasoning: result.reasoning || "Analysis complete",
      recommendedPracticeType: (result.recommendedPracticeType || "reinforcement") as AdaptiveOutput["recommendedPracticeType"],
      estimatedMastery: typeof result.estimatedMastery === "number" ? result.estimatedMastery : input.masteryScore,
      specificWeaknesses: result.weaknesses ? result.weaknesses.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      specificStrengths: result.strengths ? result.strengths.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    };
  }

  /**
   * Quick heuristic-based adjustment (no AI call - for real-time use)
   */
  quickAdjust(input: AdaptiveInput): {
    newLevel: number;
    adjustment: "decrease" | "maintain" | "increase";
  } {
    const recent = input.recentAttempts.slice(-5);
    if (recent.length === 0) {
      return { newLevel: input.currentDifficulty, adjustment: "maintain" };
    }

    const correctRate = recent.filter((a) => a.correct).length / recent.length;
    const avgHints = recent.reduce((sum, a) => sum + a.hintsUsed, 0) / recent.length;

    if (correctRate >= 0.8 && avgHints < 0.5) {
      const newLevel = Math.min(10, input.currentDifficulty + 1);
      return {
        newLevel,
        adjustment: newLevel > input.currentDifficulty ? "increase" : "maintain",
      };
    }

    if (correctRate < 0.5 || avgHints > 2) {
      const newLevel = Math.max(1, input.currentDifficulty - 1);
      return {
        newLevel,
        adjustment: newLevel < input.currentDifficulty ? "decrease" : "maintain",
      };
    }

    return { newLevel: input.currentDifficulty, adjustment: "maintain" };
  }

  private getDefaultRecommendation(currentDifficulty: number): AdaptiveOutput {
    return {
      newDifficultyLevel: currentDifficulty,
      adjustment: "maintain",
      confidence: 50,
      reasoning: "No recent attempts to analyze. Maintaining current difficulty.",
      recommendedPracticeType: "reinforcement",
      estimatedMastery: 50,
      specificWeaknesses: [],
      specificStrengths: [],
    };
  }
}
