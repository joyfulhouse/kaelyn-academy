import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignments, assignmentSubmissions, classes } from "@/lib/db/schema/classroom";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import type { GradeSubmissionResponse, SubmissionWithLearner, SubmissionStatus } from "@/types/grading";

const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().max(5000).optional(),
  markAsGraded: z.boolean().default(false),
});

async function verifyTeacher(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "teacher" || session?.user?.role === "admin";
}

// GET /api/teacher/assignments/[id]/submissions/[submissionId] - Get single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: assignmentId, submissionId } = await params;

  try {
    // Verify ownership via submission -> assignment -> class -> teacher chain
    const submissionData = await db
      .select({
        submission: assignmentSubmissions,
        assignment: assignments,
        class: classes,
        learner: learners,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .innerJoin(learners, eq(assignmentSubmissions.learnerId, learners.id))
      .where(
        and(
          eq(assignmentSubmissions.id, submissionId),
          eq(assignments.id, assignmentId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt),
          isNull(learners.deletedAt)
        )
      )
      .limit(1);

    if (submissionData.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const { submission, learner } = submissionData[0];

    const result: SubmissionWithLearner = {
      id: submission.id,
      assignmentId: submission.assignmentId,
      learner: {
        id: learner.id,
        name: learner.name,
        avatarUrl: learner.avatarUrl,
      },
      submittedAt: submission.submittedAt,
      attemptNumber: submission.attemptNumber ?? 1,
      score: submission.score,
      percentageScore: submission.percentageScore,
      feedback: submission.feedback,
      gradedAt: submission.gradedAt,
      gradedBy: submission.gradedBy,
      status: submission.status as SubmissionStatus,
    };

    return NextResponse.json({ submission: result });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

// PATCH /api/teacher/assignments/[id]/submissions/[submissionId] - Update grade
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: assignmentId, submissionId } = await params;

  try {
    const body = await request.json();
    const data = gradeSubmissionSchema.parse(body);

    // 1. Verify ownership and get assignment details for percentage calculation
    const submissionData = await db
      .select({
        submission: assignmentSubmissions,
        assignment: assignments,
        class: classes,
        learner: learners,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .innerJoin(learners, eq(assignmentSubmissions.learnerId, learners.id))
      .where(
        and(
          eq(assignmentSubmissions.id, submissionId),
          eq(assignments.id, assignmentId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      )
      .limit(1);

    if (submissionData.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const { assignment, learner } = submissionData[0];
    const totalPoints = assignment.totalPoints ?? 100;

    // 2. Validate score doesn't exceed total points
    if (data.score > totalPoints) {
      return NextResponse.json(
        { error: `Score cannot exceed total points (${totalPoints})` },
        { status: 400 }
      );
    }

    // 3. Calculate percentage score
    const percentageScore =
      totalPoints > 0
        ? Math.round((data.score / totalPoints) * 100 * 100) / 100
        : 0;

    // 4. Update submission
    const [updated] = await db
      .update(assignmentSubmissions)
      .set({
        score: data.score,
        percentageScore,
        feedback: data.feedback ?? null,
        gradedAt: data.markAsGraded ? new Date() : null,
        gradedBy: data.markAsGraded ? session.user.id : null,
        status: data.markAsGraded ? "graded" : "submitted",
        updatedAt: new Date(),
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();

    const result: SubmissionWithLearner = {
      id: updated.id,
      assignmentId: updated.assignmentId,
      learner: {
        id: learner.id,
        name: learner.name,
        avatarUrl: learner.avatarUrl,
      },
      submittedAt: updated.submittedAt,
      attemptNumber: updated.attemptNumber ?? 1,
      score: updated.score,
      percentageScore: updated.percentageScore,
      feedback: updated.feedback,
      gradedAt: updated.gradedAt,
      gradedBy: updated.gradedBy,
      status: updated.status as SubmissionStatus,
    };

    const response: GradeSubmissionResponse = { submission: result };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
