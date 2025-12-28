import { NextRequest, NextResponse } from "next/server";
import { TutoringAgent, type TutoringInput } from "@/lib/ax/agents";
import { auth } from "@/lib/auth";
import type { AIProvider, ModelTier } from "@/lib/ax";
import { ValidationError, validateBody } from "@/lib/validation";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Schema for tutoring request
const tutorRequestSchema = z.object({
  learnerName: z.string().min(1).max(100).trim(),
  gradeLevel: z.number().int().min(0).max(12),
  subject: z.string().min(1).max(50),
  topic: z.string().min(1).max(100),
  conceptName: z.string().min(1).max(200),
  masteryLevel: z.number().min(0).max(100).optional().default(50),
  studentMessage: z.string().min(1).max(5000).trim(),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(50).optional(),
  conversationId: z.string().uuid().optional(),
  provider: z.enum(["anthropic", "openai", "google"]).default("anthropic"),
  tier: z.enum(["fast", "balanced", "quality"]).default("balanced"),
});

// POST /api/agents/tutor - Send message to tutoring agent
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
    const body = await validateBody(request, tutorRequestSchema);
    const {
      learnerName,
      gradeLevel,
      subject,
      topic,
      conceptName,
      masteryLevel,
      studentMessage,
      conversationHistory,
      conversationId,
      provider,
      tier,
    } = body;

    const input: TutoringInput = {
      learnerName,
      gradeLevel,
      subject,
      topic,
      conceptName,
      masteryLevel: masteryLevel ?? 50,
      studentMessage,
      conversationHistory,
    };

    // Initialize the tutoring agent
    const tutor = new TutoringAgent(provider as AIProvider, tier as ModelTier);
    const response = await tutor.respond(input);

    const durationMs = Date.now() - startTime;

    // Estimate tokens based on text length
    const inputTokens = Math.ceil(studentMessage.length / 4);
    const outputTokens = Math.ceil(response.response.length / 4);

    return NextResponse.json({
      response: response.response,
      suggestedActivity: response.suggestedActivity,
      difficultyAdjustment: response.difficultyAdjustment,
      confidence: response.confidence,
      encouragement: response.encouragement,
      conversationId,
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
    console.error("Tutoring agent error:", error);
    return NextResponse.json(
      { error: "Failed to process tutoring request" },
      { status: 500 }
    );
  }
}

// POST /api/agents/tutor/hint - Generate a hint
export async function generateHint(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      learnerName,
      gradeLevel,
      subject,
      topic,
      conceptName,
      masteryLevel,
      question,
      studentAnswer,
      hintLevel,
      provider = "anthropic",
      tier = "balanced",
    } = body;

    const input: TutoringInput = {
      learnerName,
      gradeLevel,
      subject,
      topic,
      conceptName,
      masteryLevel: masteryLevel ?? 50,
      studentMessage: "",
    };

    const tutor = new TutoringAgent(provider as AIProvider, tier as ModelTier);
    const hint = await tutor.generateHint(input, question, studentAnswer, hintLevel || 1);

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Hint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}
