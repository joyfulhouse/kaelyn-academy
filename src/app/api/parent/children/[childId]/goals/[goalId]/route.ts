import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema/users";
import { learningGoals, goalProgressHistory, type GoalStatus } from "@/lib/db/schema/progress";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";

const ALLOWED_RECURRENCES = ["daily", "weekly", "monthly", "once"] as const;

// Schema for goal configuration
const goalConfigSchema = z.object({
  recurrence: z.enum(ALLOWED_RECURRENCES).optional(),
  resetDay: z.number().int().min(0).max(31).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  rewardDescription: z.string().max(500).optional(),
  difficultyLevel: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).optional(),
}).strict();

// Schema for updating a goal
const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  targetValue: z.number().int().min(1).max(10000).optional(),
  config: goalConfigSchema.optional(),
  endDate: z.string().datetime().or(z.date()).optional().nullable(),
  status: z.enum(["active", "completed", "expired", "paused"]).optional(),
}).strict();

// Helper to find child by slug
async function findChildBySlug(userId: string, slug: string) {
  const children = await db.query.learners.findMany({
    where: and(
      eq(learners.userId, userId),
      isNull(learners.deletedAt)
    ),
  });

  const allNames = children.map(c => c.name);

  for (const child of children) {
    const parts = child.name.toLowerCase().split(" ");
    const firstName = parts[0];
    const middleInitial = parts.length > 2 ? parts[1][0] : null;

    const sameFirstName = allNames.filter(n =>
      n.toLowerCase().startsWith(firstName + " ") && n !== child.name
    );

    const childSlug = sameFirstName.length > 0 && middleInitial
      ? `${firstName}-${middleInitial}`
      : firstName;

    if (childSlug === slug) {
      return child;
    }
  }

  return null;
}

// GET - Get a specific goal by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string; goalId: string }> }
) {
  try {
    const session = await auth();
    const { childId, goalId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Fetch the goal with subject info
    const [goal] = await db
      .select({
        id: learningGoals.id,
        title: learningGoals.title,
        description: learningGoals.description,
        metricType: learningGoals.metricType,
        targetValue: learningGoals.targetValue,
        currentValue: learningGoals.currentValue,
        subjectId: learningGoals.subjectId,
        subjectName: subjects.name,
        config: learningGoals.config,
        startDate: learningGoals.startDate,
        endDate: learningGoals.endDate,
        status: learningGoals.status,
        completedAt: learningGoals.completedAt,
        createdAt: learningGoals.createdAt,
        updatedAt: learningGoals.updatedAt,
      })
      .from(learningGoals)
      .leftJoin(subjects, eq(learningGoals.subjectId, subjects.id))
      .where(
        and(
          eq(learningGoals.id, goalId),
          eq(learningGoals.learnerId, child.id),
          isNull(learningGoals.deletedAt)
        )
      );

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Fetch progress history for this goal
    const progressHistory = await db
      .select({
        id: goalProgressHistory.id,
        value: goalProgressHistory.value,
        percentComplete: goalProgressHistory.percentComplete,
        notes: goalProgressHistory.notes,
        recordedAt: goalProgressHistory.recordedAt,
      })
      .from(goalProgressHistory)
      .where(eq(goalProgressHistory.goalId, goalId))
      .orderBy(desc(goalProgressHistory.recordedAt))
      .limit(50);

    return NextResponse.json({
      goal: {
        ...goal,
        progressPercent: goal.targetValue > 0
          ? Math.min(100, Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100))
          : 0,
      },
      progressHistory,
      childName: child.name,
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

// PUT - Update a goal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string; goalId: string }> }
) {
  try {
    const session = await auth();
    const { childId, goalId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Fetch existing goal
    const [existingGoal] = await db
      .select()
      .from(learningGoals)
      .where(
        and(
          eq(learningGoals.id, goalId),
          eq(learningGoals.learnerId, child.id),
          isNull(learningGoals.deletedAt)
        )
      );

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, targetValue, config, endDate, status } = parsed.data;

    // Build update object
    const updateData: Partial<typeof learningGoals.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (targetValue !== undefined) {
      updateData.targetValue = targetValue;
    }
    if (config !== undefined) {
      // Merge with existing config
      updateData.config = { ...existingGoal.config, ...config };
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }
    if (status !== undefined) {
      updateData.status = status as GoalStatus;
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
    }

    // Update the goal
    const [updatedGoal] = await db
      .update(learningGoals)
      .set(updateData)
      .where(eq(learningGoals.id, goalId))
      .returning();

    return NextResponse.json({
      success: true,
      goal: {
        ...updatedGoal,
        progressPercent: updatedGoal.targetValue > 0
          ? Math.min(100, Math.round(((updatedGoal.currentValue ?? 0) / updatedGoal.targetValue) * 100))
          : 0,
      },
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a goal
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string; goalId: string }> }
) {
  try {
    const session = await auth();
    const { childId, goalId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Check goal exists and belongs to this child
    const [existingGoal] = await db
      .select()
      .from(learningGoals)
      .where(
        and(
          eq(learningGoals.id, goalId),
          eq(learningGoals.learnerId, child.id),
          isNull(learningGoals.deletedAt)
        )
      );

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Soft delete the goal
    await db
      .update(learningGoals)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(learningGoals.id, goalId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
