import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityAttempts } from "@/lib/db/schema/progress";
import { learners, users } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema for grading an activity attempt
 */
const gradeActivitySchema = z.object({
  attemptId: z.string().uuid(),
  score: z.number().min(0).max(100),
  feedback: z.string().max(5000).optional(),
  rubricScores: z
    .array(
      z.object({
        criterion: z.string(),
        score: z.number().min(0),
        maxScore: z.number().min(0),
        comment: z.string().optional(),
      })
    )
    .optional(),
});

/**
 * POST /api/activities/grade - Grade an activity attempt (teacher only)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { attemptId, score, feedback, rubricScores } =
      gradeActivitySchema.parse(body);

    // Verify user is a teacher or admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { id: true, role: true, organizationId: true },
    });

    if (!user || !["teacher", "admin"].includes(user.role ?? "")) {
      return NextResponse.json(
        { error: "Only teachers and admins can grade activities" },
        { status: 403 }
      );
    }

    // Get the attempt
    const attempt = await db.query.activityAttempts.findFirst({
      where: eq(activityAttempts.id, attemptId),
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Activity attempt not found" },
        { status: 404 }
      );
    }

    // Verify teacher has access to this learner's organization
    // (In a full implementation, this would also check class enrollment)
    if (user.organizationId !== attempt.organizationId && user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied to this learner's attempts" },
        { status: 403 }
      );
    }

    // Prepare grading data
    const gradingData = {
      gradedBy: session.user.id,
      gradedAt: new Date().toISOString(),
      rubricScores,
    };

    // Update the attempt with grade and feedback
    const [updated] = await db
      .update(activityAttempts)
      .set({
        score,
        passed: score >= 70,
        aiFeedback: feedback
          ? `Teacher Feedback: ${feedback}`
          : attempt.aiFeedback,
        // Store grading metadata in answers field
        answers: [
          ...(Array.isArray(attempt.answers) ? attempt.answers : []),
          {
            questionId: "_grading",
            answer: JSON.stringify(gradingData),
            correct: true,
          },
        ],
      })
      .where(eq(activityAttempts.id, attemptId))
      .returning();

    return NextResponse.json({
      success: true,
      attempt: {
        id: updated.id,
        score: updated.score,
        passed: updated.passed,
        feedback: feedback,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error grading activity:", error);
    return NextResponse.json(
      { error: "Failed to grade activity" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/activities/grade - Get pending activities to grade (teacher only)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify user is a teacher or admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { id: true, role: true, organizationId: true },
    });

    if (!user || !["teacher", "admin"].includes(user.role ?? "")) {
      return NextResponse.json(
        { error: "Only teachers and admins can access this endpoint" },
        { status: 403 }
      );
    }

    // Note: activityType and classId query params are available for future filtering
    // const activityType = request.nextUrl.searchParams.get("activityType");
    // const classId = request.nextUrl.searchParams.get("classId");

    // For drawing activities, we need to find attempts that haven't been graded yet
    // This is a simplified query - in production, you'd join with class enrollment
    // and filter by the teacher's classes

    // Get attempts that might need manual grading
    // (e.g., drawing activities, code activities without all tests passing)
    const pendingAttempts = await db
      .select({
        id: activityAttempts.id,
        learnerId: activityAttempts.learnerId,
        activityId: activityAttempts.activityId,
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
          eq(activityAttempts.organizationId, user.organizationId!),
          // Only show attempts that haven't been manually graded
          // (no _grading entry in answers)
          isNull(activityAttempts.aiFeedback) // Simplified check
        )
      )
      .limit(50);

    // Get learner names
    const learnerIds = [...new Set(pendingAttempts.map((a) => a.learnerId))];
    const learnerProfiles =
      learnerIds.length > 0
        ? await db.query.learners.findMany({
            where: and(
              isNull(learners.deletedAt)
              // Would filter by learnerIds here
            ),
            columns: { id: true, name: true, gradeLevel: true },
          })
        : [];

    const learnerMap = new Map(learnerProfiles.map((l) => [l.id, l]));

    // Enrich attempts with learner info
    const enrichedAttempts = pendingAttempts.map((attempt) => ({
      ...attempt,
      learner: learnerMap.get(attempt.learnerId) ?? null,
    }));

    return NextResponse.json({
      attempts: enrichedAttempts,
      total: enrichedAttempts.length,
    });
  } catch (error) {
    console.error("Error fetching pending activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending activities" },
      { status: 500 }
    );
  }
}
