import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import {
  generateQuizForLesson,
  validateQuiz,
  quizToDataFormat,
  type QuizGenerationRequest,
} from "@/lib/ai/quiz-generation";
import type { QuestionType } from "@/lib/assessment/types";

const generateQuizSchema = z.object({
  lessonId: z.string().min(1).max(100),
  lessonTitle: z.string().min(1).max(255),
  lessonDescription: z.string().min(1).max(1000),
  subject: z.string().min(1).max(100),
  gradeLevel: z.number().int().min(0).max(12),
  objectives: z.array(z.string()).optional(),
  questionCount: z.number().int().min(3).max(10).optional().default(5),
  questionTypes: z
    .array(
      z.enum(["multiple_choice", "true_false", "fill_blank", "matching", "ordering"])
    )
    .optional(),
  difficulty: z.number().int().min(1).max(10).optional().default(5),
});

const batchGenerateSchema = z.object({
  lessons: z.array(
    z.object({
      lessonId: z.string().min(1).max(100),
      lessonTitle: z.string().min(1).max(255),
      lessonDescription: z.string().min(1).max(1000),
      subject: z.string().min(1).max(100),
      gradeLevel: z.number().int().min(0).max(12),
      objectives: z.array(z.string()).optional(),
    })
  ),
  questionCount: z.number().int().min(3).max(10).optional().default(5),
  difficulty: z.number().int().min(1).max(10).optional().default(5),
});

/**
 * POST /api/admin/quizzes/generate
 *
 * Generate a quiz for a lesson using AI
 *
 * Body:
 * - Single quiz: { lessonId, lessonTitle, lessonDescription, subject, gradeLevel, ... }
 * - Batch: { action: "batch", lessons: [...], questionCount, difficulty }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is an admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (
    !currentUser ||
    (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = body.action as string | undefined;

    // Batch generation
    if (action === "batch") {
      const data = batchGenerateSchema.parse(body);
      const results: {
        success: Array<{
          lessonId: string;
          quiz: ReturnType<typeof quizToDataFormat>;
          validation: ReturnType<typeof validateQuiz>;
        }>;
        failed: Array<{ lessonId: string; error: string }>;
      } = {
        success: [],
        failed: [],
      };

      for (const lesson of data.lessons) {
        try {
          const request: QuizGenerationRequest = {
            ...lesson,
            questionCount: data.questionCount,
            difficulty: data.difficulty,
          };

          const result = await generateQuizForLesson(request);
          const validation = validateQuiz(result.quiz);

          results.success.push({
            lessonId: lesson.lessonId,
            quiz: quizToDataFormat(result.quiz),
            validation,
          });
        } catch (error) {
          results.failed.push({
            lessonId: lesson.lessonId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return NextResponse.json({
        success: true,
        generated: results.success.length,
        failed: results.failed.length,
        results,
      });
    }

    // Single quiz generation
    const data = generateQuizSchema.parse(body);

    const quizRequest: QuizGenerationRequest = {
      lessonId: data.lessonId,
      lessonTitle: data.lessonTitle,
      lessonDescription: data.lessonDescription,
      subject: data.subject,
      gradeLevel: data.gradeLevel,
      objectives: data.objectives,
      questionCount: data.questionCount,
      questionTypes: data.questionTypes as QuestionType[] | undefined,
      difficulty: data.difficulty,
    };

    const result = await generateQuizForLesson(quizRequest);
    const validation = validateQuiz(result.quiz);

    return NextResponse.json({
      success: true,
      quiz: result.quiz,
      validation,
      dataFormat: quizToDataFormat(result.quiz),
      metadata: {
        generatedAt: result.generatedAt,
        provider: result.provider,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error generating quiz:", error);

    if (error instanceof Error && error.message.includes("No AI provider")) {
      return NextResponse.json(
        {
          error:
            "AI service not configured. Please set up an AI provider API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_AI_API_KEY).",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
