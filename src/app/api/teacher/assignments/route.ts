import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignments, assignmentSubmissions, classes, classEnrollments } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, sql, isNull, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher";
}

// GET /api/teacher/assignments - Get all assignments for the teacher
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    // Get all assignments for classes the teacher owns
    const teacherClasses = await db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .where(
        and(
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    const classIds = teacherClasses.map((c) => c.id);
    const classMap = Object.fromEntries(teacherClasses.map((c) => [c.id, c.name]));

    if (classIds.length === 0) {
      return NextResponse.json({
        assignments: [],
        summary: {
          total: 0,
          active: 0,
          needsGrading: 0,
          totalSubmissions: 0,
          completionRate: 0,
        },
      });
    }

    // Get all assignments
    const allAssignments = await db
      .select()
      .from(assignments)
      .where(inArray(assignments.classId, classIds))
      .orderBy(desc(assignments.createdAt));

    const assignmentIds = allAssignments.map((a) => a.id);

    // Batch query: Get enrollment counts per class
    const enrollmentCounts = await db
      .select({
        classId: classEnrollments.classId,
        count: sql<number>`count(*)::int`,
      })
      .from(classEnrollments)
      .where(
        and(
          inArray(classEnrollments.classId, classIds),
          eq(classEnrollments.status, "active")
        )
      )
      .groupBy(classEnrollments.classId);

    const enrollmentByClass = new Map(
      enrollmentCounts.map((e) => [e.classId, e.count])
    );

    // Batch query: Get submission stats for all assignments at once
    const allSubmissionStats = assignmentIds.length > 0
      ? await db
          .select({
            assignmentId: assignmentSubmissions.assignmentId,
            submitted: sql<number>`count(*) filter (where ${assignmentSubmissions.submittedAt} is not null)::int`,
            graded: sql<number>`count(*) filter (where ${assignmentSubmissions.gradedAt} is not null)::int`,
            avgScore: sql<number>`coalesce(avg(${assignmentSubmissions.percentageScore}) filter (where ${assignmentSubmissions.gradedAt} is not null), 0)::int`,
          })
          .from(assignmentSubmissions)
          .where(inArray(assignmentSubmissions.assignmentId, assignmentIds))
          .groupBy(assignmentSubmissions.assignmentId)
      : [];

    const submissionsByAssignment = new Map(
      allSubmissionStats.map((s) => [s.assignmentId, s])
    );

    // Map assignments with stats using in-memory data
    const now = new Date();
    const assignmentsWithStats = allAssignments.map((assignment) => {
      const totalStudents = enrollmentByClass.get(assignment.classId) || 0;
      const stats = submissionsByAssignment.get(assignment.id);

      const submitted = stats?.submitted || 0;
      const graded = stats?.graded || 0;
      const avgScore = stats?.avgScore || null;

      // Determine status
      const isPastDue = assignment.dueDate && assignment.dueDate < now;
      const isComplete = submitted === totalStudents && submitted > 0;

      let status: "active" | "completed" | "past_due" = "active";
      if (isComplete) status = "completed";
      else if (isPastDue) status = "past_due";

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        classId: assignment.classId,
        className: classMap[assignment.classId] || "Unknown Class",
        dueDate: assignment.dueDate,
        assignedAt: assignment.assignedAt,
        totalPoints: assignment.totalPoints,
        passingScore: assignment.passingScore,
        submissions: {
          submitted,
          total: totalStudents,
          graded,
        },
        avgScore: graded > 0 ? avgScore : null,
        status,
      };
    });

    // Calculate summary stats
    const activeCount = assignmentsWithStats.filter((a) => a.status === "active").length;
    const needsGradingCount = assignmentsWithStats.filter(
      (a) => a.submissions.submitted > a.submissions.graded
    ).length;
    const totalSubmissions = assignmentsWithStats.reduce(
      (acc, a) => acc + a.submissions.submitted,
      0
    );
    const totalPossible = assignmentsWithStats.reduce(
      (acc, a) => acc + a.submissions.total,
      0
    );

    return NextResponse.json({
      assignments: assignmentsWithStats,
      summary: {
        total: allAssignments.length,
        active: activeCount,
        needsGrading: needsGradingCount,
        totalSubmissions,
        completionRate: totalPossible > 0 ? Math.round((totalSubmissions / totalPossible) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// Schema for creating an assignment
const createAssignmentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  instructions: z.string().optional(),
  classId: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  totalPoints: z.number().int().min(0).max(10000).optional().default(100),
  passingScore: z.number().int().min(0).max(100).optional().default(70),
  allowLateSubmissions: z.boolean().optional().default(true),
  maxAttempts: z.number().int().min(1).max(10).optional().default(1),
  lessonIds: z.array(z.string().uuid()).optional(),
  activityIds: z.array(z.string().uuid()).optional(),
});

// POST /api/teacher/assignments - Create a new assignment
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createAssignmentSchema.parse(body);

    // Verify teacher owns this class
    const [cls] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, data.classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    const [newAssignment] = await db
      .insert(assignments)
      .values({
        classId: data.classId,
        teacherId: session.user.id,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        totalPoints: data.totalPoints,
        passingScore: data.passingScore,
        allowLateSubmissions: data.allowLateSubmissions,
        maxAttempts: data.maxAttempts,
        lessonIds: data.lessonIds,
        activityIds: data.activityIds,
      })
      .returning();

    return NextResponse.json({ assignment: newAssignment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
