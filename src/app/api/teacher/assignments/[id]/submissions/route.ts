import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignments, assignmentSubmissions, classes } from "@/lib/db/schema/classroom";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";
import type {
  SubmissionsListResponse,
  SubmissionWithLearner,
  GradingStats,
  SubmissionStatus,
} from "@/types/grading";

async function verifyTeacher(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "teacher" || session?.user?.role === "admin";
}

// GET /api/teacher/assignments/[id]/submissions - List all submissions for an assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: assignmentId } = await params;
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") as SubmissionStatus | "all" | null;

  try {
    // 1. Verify assignment ownership via class -> teacher relationship
    const assignmentData = await db
      .select({
        assignment: assignments,
        class: classes,
      })
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .where(
        and(
          eq(assignments.id, assignmentId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      )
      .limit(1);

    if (assignmentData.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const { assignment, class: classData } = assignmentData[0];

    // 2. Fetch all submissions with learner info
    const submissionsData = await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        learnerId: assignmentSubmissions.learnerId,
        learnerName: learners.name,
        learnerAvatar: learners.avatarUrl,
        submittedAt: assignmentSubmissions.submittedAt,
        attemptNumber: assignmentSubmissions.attemptNumber,
        score: assignmentSubmissions.score,
        percentageScore: assignmentSubmissions.percentageScore,
        feedback: assignmentSubmissions.feedback,
        gradedAt: assignmentSubmissions.gradedAt,
        gradedBy: assignmentSubmissions.gradedBy,
        status: assignmentSubmissions.status,
      })
      .from(assignmentSubmissions)
      .innerJoin(learners, eq(assignmentSubmissions.learnerId, learners.id))
      .where(
        and(
          eq(assignmentSubmissions.assignmentId, assignmentId),
          isNull(learners.deletedAt)
        )
      )
      .orderBy(learners.name);

    // 3. Transform to SubmissionWithLearner format
    let submissions: SubmissionWithLearner[] = submissionsData.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      learner: {
        id: s.learnerId,
        name: s.learnerName,
        avatarUrl: s.learnerAvatar,
      },
      submittedAt: s.submittedAt,
      attemptNumber: s.attemptNumber ?? 1,
      score: s.score,
      percentageScore: s.percentageScore,
      feedback: s.feedback,
      gradedAt: s.gradedAt,
      gradedBy: s.gradedBy,
      status: s.status as SubmissionStatus,
    }));

    // 4. Apply status filter if provided
    if (statusFilter && statusFilter !== "all") {
      submissions = submissions.filter((s) => s.status === statusFilter);
    }

    // 5. Calculate stats (from all submissions, not filtered)
    const allSubmissions = submissionsData;
    const gradedSubmissions = allSubmissions.filter((s) => s.gradedAt);
    const scores = gradedSubmissions
      .map((s) => s.percentageScore)
      .filter((score): score is number => score !== null);

    const stats: GradingStats = {
      total: allSubmissions.length,
      submitted: allSubmissions.filter((s) => s.submittedAt).length,
      graded: gradedSubmissions.length,
      notStarted: allSubmissions.filter((s) => s.status === "not_started").length,
      late: allSubmissions.filter((s) => s.status === "late").length,
      avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      highScore: scores.length > 0 ? Math.max(...scores) : null,
      lowScore: scores.length > 0 ? Math.min(...scores) : null,
    };

    const response: SubmissionsListResponse = {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        totalPoints: assignment.totalPoints ?? 100,
        passingScore: assignment.passingScore,
        classId: classData.id,
        className: classData.name,
        dueDate: assignment.dueDate,
      },
      submissions,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
