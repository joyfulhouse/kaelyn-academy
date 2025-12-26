import { NextRequest, NextResponse } from "next/server";
import { PracticeGeneratorAgent, type PracticeInput } from "@/lib/ax/agents";
import { auth } from "@/lib/auth";
import type { AIProvider, ModelTier } from "@/lib/ax";
import { ValidationError, validateBody } from "@/lib/validation";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Schema for practice generation request
const practiceRequestSchema = z.object({
  subject: z.string().min(1).max(50),
  gradeLevel: z.number().int().min(0).max(12),
  conceptName: z.string().min(1).max(200),
  difficultyLevel: z.number().int().min(1).max(10).optional().default(5),
  questionType: z.enum(["multiple-choice", "fill-in-blank", "short-answer", "true-false", "matching"]),
  count: z.number().int().min(1).max(10).optional().default(5),
  previousQuestions: z.array(z.string()).max(50).optional(),
  learnerWeaknesses: z.array(z.string()).max(20).optional(),
  provider: z.enum(["anthropic", "openai", "google"]).default("anthropic"),
  tier: z.enum(["fast", "balanced", "quality"]).default("balanced"),
});

// POST /api/agents/practice - Generate practice questions
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Apply rate limiting
  const rateLimitResult = checkAiRateLimit(request, session.user.id);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  const startTime = Date.now();

  try {
    // Validate request body
    const body = await validateBody(request, practiceRequestSchema);
    const {
      subject,
      gradeLevel,
      conceptName,
      difficultyLevel,
      questionType,
      count,
      previousQuestions,
      learnerWeaknesses,
      provider,
      tier,
    } = body;

    const input: PracticeInput = {
      subject,
      gradeLevel,
      conceptName,
      difficultyLevel,
      questionType,
      count,
      previousQuestions,
      learnerWeaknesses,
    };

    // Initialize the practice generator agent
    const generator = new PracticeGeneratorAgent(provider as AIProvider, tier as ModelTier);
    const result = await generator.generate(input);

    const durationMs = Date.now() - startTime;

    // Estimate tokens based on text length
    const inputTokens = Math.ceil(JSON.stringify(input).length / 4);
    const outputTokens = Math.ceil(JSON.stringify(result).length / 4);

    return NextResponse.json({
      questions: result.questions,
      pedagogicalRationale: result.pedagogicalRationale,
      targetedWeaknesses: result.targetedWeaknesses,
      metadata: {
        durationMs,
        inputTokens,
        outputTokens,
        provider,
        tier,
        questionCount: result.questions.length,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Practice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate practice questions" },
      { status: 500 }
    );
  }
}

// GET /api/agents/practice/types - Get available question types with descriptions
export async function GET() {
  return NextResponse.json({
    questionTypes: [
      {
        id: "multiple-choice",
        name: "Multiple Choice",
        description: "Choose the correct answer from 4 options",
        fields: ["question", "options", "correctIndex", "explanation", "hint"],
      },
      {
        id: "fill-in-blank",
        name: "Fill in the Blank",
        description: "Complete the sentence with the missing word",
        fields: ["sentence", "answer", "acceptableAnswers", "explanation", "hint"],
      },
      {
        id: "true-false",
        name: "True/False",
        description: "Determine if a statement is true or false",
        fields: ["statement", "isTrue", "explanation", "hint"],
      },
      {
        id: "short-answer",
        name: "Short Answer",
        description: "Write a brief response to a question",
        fields: ["question", "sampleAnswer", "keyPoints", "hint"],
      },
      {
        id: "matching",
        name: "Matching",
        description: "Match items from two columns",
        fields: ["instructions", "leftColumn", "rightColumn", "correctMatches", "explanation", "hint"],
      },
    ],
  });
}
