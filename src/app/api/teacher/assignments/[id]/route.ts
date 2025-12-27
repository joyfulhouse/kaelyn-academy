import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignments, assignmentSubmissions, classes, classEnrollments } from "@/lib/db/schema/classroom";
import { learners } from "@/lib/db/schema/users";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/teacher/assignments/[id] - Get a single assignment with submissions
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Get assignment with class info
    const [assignment] = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        instructions: assignments.instructions,
        classId: assignments.classId,
        className: classes.name,
        dueDate: assignments.dueDate,
        assignedAt: assignments.assignedAt,
        totalPoints: assignments.totalPoints,
        passingScore: assignments.passingScore,
        allowLateSubmissions: assignments.allowLateSubmissions,
        maxAttempts: assignments.maxAttempts,
        lessonIds: assignments.lessonIds,
        activityIds: assignments.activityIds,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .where(
        and(
          eq(assignments.id, id),
          eq(classes.teacherId, session.user.id)
        )
      );

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Get all enrolled students with their submission status
    const enrolledStudents = await db
      .select({
        learnerId: classEnrollments.learnerId,
        learnerName: learners.name,
        enrolledAt: classEnrollments.enrolledAt,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          eq(classEnrollments.classId, assignment.classId),
          eq(classEnrollments.status, "active")
        )
      );

    // Get submissions for this assignment
    const submissions = await db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, id));

    const submissionMap = Object.fromEntries(
      submissions.map((s) => [s.learnerId, s])
    );

    // Combine student data with submission data
    const studentSubmissions = enrolledStudents.map((student) => {
      const submission = submissionMap[student.learnerId];
      return {
        learnerId: student.learnerId,
        learnerName: student.learnerName,
        status: submission?.status || "not_started",
        submittedAt: submission?.submittedAt || null,
        gradedAt: submission?.gradedAt || null,
        score: submission?.score || null,
        percentageScore: submission?.percentageScore || null,
        feedback: submission?.feedback || null,
        attemptNumber: submission?.attemptNumber || 0,
      };
    });

    // Calculate stats
    const submittedCount = studentSubmissions.filter(
      (s) => s.status === "submitted" || s.status === "graded"
    ).length;
    const gradedCount = studentSubmissions.filter((s) => s.status === "graded").length;
    const avgScore = gradedCount > 0
      ? Math.round(
          studentSubmissions
            .filter((s) => s.percentageScore !== null)
            .reduce((acc, s) => acc + (s.percentageScore || 0), 0) / gradedCount
        )
      : null;

    return NextResponse.json({
      assignment,
      students: studentSubmissions,
      stats: {
        totalStudents: enrolledStudents.length,
        submitted: submittedCount,
        graded: gradedCount,
        averageScore: avgScore,
      },
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// Schema for updating an assignment
const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  totalPoints: z.number().int().min(0).max(10000).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  allowLateSubmissions: z.boolean().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  lessonIds: z.array(z.string().uuid()).optional(),
  activityIds: z.array(z.string().uuid()).optional(),
});

// PATCH /api/teacher/assignments/[id] - Update an assignment
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Verify teacher owns this assignment
    const [existing] = await db
      .select()
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .where(
        and(
          eq(assignments.id, id),
          eq(classes.teacherId, session.user.id)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = updateAssignmentSchema.parse(body);

    const [updatedAssignment] = await db
      .update(assignments)
      .set({
        ...data,
        dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, id))
      .returning();

    return NextResponse.json({ assignment: updatedAssignment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/assignments/[id] - Delete an assignment
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Verify teacher owns this assignment
    const [existing] = await db
      .select()
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .where(
        and(
          eq(assignments.id, id),
          eq(classes.teacherId, session.user.id)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Delete the assignment (cascades to submissions)
    await db.delete(assignments).where(eq(assignments.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
