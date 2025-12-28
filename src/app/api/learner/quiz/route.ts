import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityAttempts } from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { getQuizForLesson, gradeQuiz } from "@/lib/assessment";
import {
  generateQuizFeedback,
  formatFeedbackAsString,
} from "@/lib/ai/quiz-feedback";
import { enforceParentalControls } from "@/lib/api/parental-controls";

/**
 * Schema for quiz submission
 */
const quizSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  quizId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.union([z.string(), z.array(z.string())]),
      timeSpent: z.number().int().min(0).optional(),
    })
  ),
  totalTimeSpent: z.number().int().min(0),
});

/**
 * POST /api/learner/quiz - Submit a quiz attempt
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { lessonId, quizId, answers, totalTimeSpent } =
      quizSubmissionSchema.parse(body);

    // Get learner profile
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      columns: { id: true, organizationId: true, name: true, gradeLevel: true },
    });

    if (!learner) {
      return NextResponse.json(
        { error: "Learner profile not found" },
        { status: 404 }
      );
    }

    // COPPA: Enforce parental controls (screen time limits, allowed subjects, etc.)
    const controlsBlock = await enforceParentalControls(learner.id);
    if (controlsBlock) {
      return controlsBlock;
    }

    // Get quiz configuration
    const quizConfig = getQuizForLesson(lessonId);
    if (!quizConfig) {
      return NextResponse.json(
        { error: "Quiz not found for this lesson" },
        { status: 404 }
      );
    }

    // Grade the quiz
    const gradeResult = gradeQuiz(quizConfig, answers);

    // Generate activity UUID from quiz ID
    const activityUuid = await generateDeterministicUuid(quizId);

    // Get the latest attempt number for this quiz
    const latestAttempt = await db
      .select({ attemptNumber: activityAttempts.attemptNumber })
      .from(activityAttempts)
      .where(
        and(
          eq(activityAttempts.learnerId, learner.id),
          eq(activityAttempts.activityId, activityUuid)
        )
      )
      .orderBy(desc(activityAttempts.attemptNumber))
      .limit(1);

    const attemptNumber = (latestAttempt[0]?.attemptNumber ?? 0) + 1;

    // Prepare detailed answers for storage
    const detailedAnswers = gradeResult.questionResults.map((qr) => ({
      questionId: qr.questionId,
      answer: qr.answer,
      correct: qr.correct,
      timeSpent: qr.timeSpent,
    }));

    // Generate AI feedback
    const feedbackResult = await generateQuizFeedback({
      quizConfig,
      questionResults: gradeResult.questionResults,
      score: gradeResult.percentage,
      passed: gradeResult.passed,
      learnerName: learner.name ?? undefined,
      gradeLevel: learner.gradeLevel ?? undefined,
    });
    const aiFeedback = formatFeedbackAsString(feedbackResult);

    // Insert the attempt
    const [attempt] = await db
      .insert(activityAttempts)
      .values({
        learnerId: learner.id,
        activityId: activityUuid,
        organizationId: learner.organizationId,
        attemptNumber,
        score: gradeResult.percentage,
        maxScore: 100,
        passed: gradeResult.passed,
        timeSpent: totalTimeSpent,
        answers: detailedAnswers,
        aiFeedback,
        startedAt: new Date(Date.now() - totalTimeSpent * 1000),
        completedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      attemptNumber,
      score: gradeResult.percentage,
      passed: gradeResult.passed,
      feedback: aiFeedback,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/learner/quiz - Get quiz attempts for a lesson
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return NextResponse.json(
      { error: "lessonId query parameter required" },
      { status: 400 }
    );
  }

  try {
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      columns: { id: true },
    });

    if (!learner) {
      return NextResponse.json(
        { error: "Learner profile not found" },
        { status: 404 }
      );
    }

    // Get quiz configuration to find quiz ID
    const quizConfig = getQuizForLesson(lessonId);
    if (!quizConfig) {
      return NextResponse.json({
        hasQuiz: false,
        attempts: [],
        bestScore: null,
        latestAttempt: null,
      });
    }

    const activityUuid = await generateDeterministicUuid(quizConfig.id);

    // Get all attempts for this quiz
    const attempts = await db
      .select({
        id: activityAttempts.id,
        attemptNumber: activityAttempts.attemptNumber,
        score: activityAttempts.score,
        passed: activityAttempts.passed,
        timeSpent: activityAttempts.timeSpent,
        completedAt: activityAttempts.completedAt,
        answers: activityAttempts.answers,
        aiFeedback: activityAttempts.aiFeedback,
      })
      .from(activityAttempts)
      .where(
        and(
          eq(activityAttempts.learnerId, learner.id),
          eq(activityAttempts.activityId, activityUuid)
        )
      )
      .orderBy(desc(activityAttempts.completedAt));

    // Calculate best score
    const bestScore =
      attempts.length > 0
        ? Math.max(...attempts.map((a) => a.score ?? 0))
        : null;

    return NextResponse.json({
      hasQuiz: true,
      quizConfig: {
        id: quizConfig.id,
        title: quizConfig.title,
        questionCount: quizConfig.questions.length,
        passingScore: quizConfig.passingScore ?? 70,
        allowRetry: quizConfig.allowRetry ?? true,
      },
      attempts,
      bestScore,
      latestAttempt: attempts[0] ?? null,
      hasPassed: attempts.some((a) => a.passed),
    });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz attempts" },
      { status: 500 }
    );
  }
}

/**
 * Generate a deterministic UUID v5 from a quiz ID
 */
async function generateDeterministicUuid(quizId: string): Promise<string> {
  const namespace = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  const encoder = new TextEncoder();
  const data = encoder.encode(namespace + quizId);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);

  const hex = Array.from(hashArray)
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${(
    (parseInt(hex.slice(16, 18), 16) & 0x3f) |
    0x80
  )
    .toString(16)
    .padStart(2, "0")}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

