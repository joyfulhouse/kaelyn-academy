import { NextRequest, NextResponse } from "next/server";
import { AdaptiveAgent, type AdaptiveInput } from "@/lib/ax/agents";
import { auth } from "@/lib/auth";
import type { AIProvider, ModelTier } from "@/lib/ax";
import { requireLearnerAccess, AuthorizationError } from "@/lib/auth/rbac";
import { ValidationError, validateBody } from "@/lib/validation";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Schema for adaptive analysis request (matches AdaptiveInput type)
const adaptiveRequestSchema = z.object({
  learnerId: z.string().uuid(),
  subject: z.string().min(1).max(50),
  currentDifficulty: z.number().int().min(1).max(10),
  masteryScore: z.number().min(0).max(100),
  recentAttempts: z.array(z.object({
    questionDifficulty: z.number().min(1).max(10),
    correct: z.boolean(),
    timeSpent: z.number().int().min(0),
    hintsUsed: z.number().int().min(0),
  })).max(50).default([]),
  provider: z.enum(["anthropic", "openai", "google"]).default("anthropic"),
  tier: z.enum(["fast", "balanced", "quality"]).default("fast"),
});

// POST /api/agents/adaptive - Analyze performance and recommend difficulty
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply rate limiting
  const rateLimitResult = await checkAiRateLimit(request, session.user.id);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  const startTime = Date.now();

  try {
    // Validate request body
    const body = await validateBody(request, adaptiveRequestSchema);

    // Verify access to this learner's data
    try {
      await requireLearnerAccess(body.learnerId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return error.toResponse();
      }
      throw error;
    }

    const {
      learnerId,
      subject,
      currentDifficulty,
      masteryScore,
      recentAttempts,
      provider,
      tier,
    } = body;

    const input: AdaptiveInput = {
      learnerId,
      subject,
      currentDifficulty,
      masteryScore,
      recentAttempts: recentAttempts || [],
    };

    // Initialize the adaptive agent
    const adaptive = new AdaptiveAgent(provider as AIProvider, tier as ModelTier);
    const analysis = await adaptive.analyze(input);

    const durationMs = Date.now() - startTime;

    // Estimate tokens based on text length
    const inputTokens = Math.ceil(JSON.stringify(input).length / 4);
    const outputTokens = Math.ceil(JSON.stringify(analysis).length / 4);

    return NextResponse.json({
      newDifficultyLevel: analysis.newDifficultyLevel,
      adjustment: analysis.adjustment,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      recommendedPracticeType: analysis.recommendedPracticeType,
      estimatedMastery: analysis.estimatedMastery,
      specificWeaknesses: analysis.specificWeaknesses,
      specificStrengths: analysis.specificStrengths,
      metadata: {
        durationMs,
        inputTokens,
        outputTokens,
        provider,
        tier,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Adaptive agent error:", error);
    return NextResponse.json(
      { error: "Failed to analyze performance" },
      { status: 500 }
    );
  }
}

// POST /api/agents/adaptive/quick - Quick heuristic-based adjustment (no AI)
export async function quickAdjust(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { learnerId, subject, currentDifficulty, masteryScore, recentAttempts } = body;

    const input: AdaptiveInput = {
      learnerId,
      subject,
      currentDifficulty,
      masteryScore,
      recentAttempts: recentAttempts || [],
    };

    // Use quick heuristic-based adjustment (no AI call)
    const adaptive = new AdaptiveAgent();
    const result = adaptive.quickAdjust(input);

    return NextResponse.json({
      newLevel: result.newLevel,
      adjustment: result.adjustment,
    });
  } catch (error) {
    console.error("Quick adjustment error:", error);
    return NextResponse.json(
      { error: "Failed to calculate adjustment" },
      { status: 500 }
    );
  }
}
