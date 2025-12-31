import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityAttempts } from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { enforceParentalControls } from "@/lib/api/parental-controls";

/**
 * Activity response types for different activity types
 */
const dragDropResponseSchema = z.object({
  placements: z.record(z.string(), z.array(z.string())), // zoneId -> itemIds
});

const fillBlankResponseSchema = z.object({
  answers: z.record(z.string(), z.string()), // blankId -> answer
  results: z.array(
    z.object({
      id: z.string(),
      userAnswer: z.string(),
      correct: z.boolean(),
      correctAnswers: z.array(z.string()),
    })
  ),
});

const codeEditorResponseSchema = z.object({
  code: z.string(),
  testResults: z.array(
    z.object({
      id: z.string(),
      description: z.string().optional(),
      passed: z.boolean(),
      expectedOutput: z.string(),
      actualOutput: z.string(),
      error: z.string().optional(),
      isHidden: z.boolean().optional(),
    })
  ),
});

const drawingResponseSchema = z.object({
  imageData: z.string(), // Base64 encoded image
});

/**
 * Schema for activity submission
 */
const activitySubmissionSchema = z.object({
  activityId: z.string().uuid(),
  activityType: z.enum([
    "drag_drop",
    "fill_blank",
    "code_editor",
    "drawing",
    "matching",
    "sorting",
  ]),
  score: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0), // seconds
  response: z.union([
    dragDropResponseSchema,
    fillBlankResponseSchema,
    codeEditorResponseSchema,
    drawingResponseSchema,
    z.record(z.string(), z.unknown()), // Generic for other types
  ]),
});

/**
 * POST /api/activities/submit - Submit an interactive activity response
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { activityId, activityType, score, timeSpent, response } =
      activitySubmissionSchema.parse(body);

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

    // COPPA: Enforce parental controls
    const controlsBlock = await enforceParentalControls(learner.id);
    if (controlsBlock) {
      return controlsBlock;
    }

    // Get the latest attempt number for this activity
    const latestAttempt = await db
      .select({ attemptNumber: activityAttempts.attemptNumber })
      .from(activityAttempts)
      .where(
        and(
          eq(activityAttempts.learnerId, learner.id),
          eq(activityAttempts.activityId, activityId)
        )
      )
      .orderBy(desc(activityAttempts.attemptNumber))
      .limit(1);

    const attemptNumber = (latestAttempt[0]?.attemptNumber ?? 0) + 1;

    // Determine if passed based on score (default passing is 70%)
    const passed = score >= 70;

    // Prepare answers for storage based on activity type
    const answersData = prepareAnswersForStorage(activityType, response);

    // Insert the attempt
    const [attempt] = await db
      .insert(activityAttempts)
      .values({
        learnerId: learner.id,
        activityId,
        organizationId: learner.organizationId,
        attemptNumber,
        score,
        maxScore: 100,
        passed,
        timeSpent,
        answers: answersData,
        startedAt: new Date(Date.now() - timeSpent * 1000),
        completedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      attemptNumber,
      score,
      passed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error submitting activity:", error);
    return NextResponse.json(
      { error: "Failed to submit activity" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/activities/submit - Get activity attempts for a specific activity
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const activityId = searchParams.get("activityId");

  if (!activityId) {
    return NextResponse.json(
      { error: "activityId query parameter required" },
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

    // Get all attempts for this activity
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
          eq(activityAttempts.activityId, activityId)
        )
      )
      .orderBy(desc(activityAttempts.completedAt));

    // Calculate best score
    const bestScore =
      attempts.length > 0
        ? Math.max(...attempts.map((a) => a.score ?? 0))
        : null;

    return NextResponse.json({
      attempts,
      bestScore,
      latestAttempt: attempts[0] ?? null,
      hasPassed: attempts.some((a) => a.passed),
      totalAttempts: attempts.length,
    });
  } catch (error) {
    console.error("Error fetching activity attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity attempts" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to prepare answers for storage based on activity type
 */
function prepareAnswersForStorage(
  activityType: string,
  response: unknown
): Array<{
  questionId: string;
  answer: string | string[];
  correct: boolean;
  timeSpent?: number;
}> {
  switch (activityType) {
    case "drag_drop": {
      const dragDropResponse = response as z.infer<typeof dragDropResponseSchema>;
      // Convert placements to answers format
      return Object.entries(dragDropResponse.placements).map(
        ([zoneId, itemIds]) => ({
          questionId: zoneId,
          answer: itemIds,
          correct: true, // Correctness is determined by the component
        })
      );
    }

    case "fill_blank": {
      const fillBlankResponse = response as z.infer<typeof fillBlankResponseSchema>;
      return fillBlankResponse.results.map((result) => ({
        questionId: result.id,
        answer: result.userAnswer,
        correct: result.correct,
      }));
    }

    case "code_editor": {
      const codeResponse = response as z.infer<typeof codeEditorResponseSchema>;
      return codeResponse.testResults.map((result) => ({
        questionId: result.id,
        answer: result.actualOutput,
        correct: result.passed,
      }));
    }

    case "drawing": {
      // Drawing activities don't have discrete answers
      // Store a reference to the image
      return [
        {
          questionId: "drawing",
          answer: "image_submitted",
          correct: true,
        },
      ];
    }

    default:
      // Generic handling
      return [];
  }
}
