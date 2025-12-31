import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema/users";
import { learningGoals, goalProgressHistory, type GoalMetricType, type GoalStatus } from "@/lib/db/schema/progress";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";

// Allowed metric types whitelist
const ALLOWED_METRIC_TYPES = [
  "lessons_per_week",
  "minutes_per_day",
  "mastery_level",
  "streak_days",
  "activities_completed",
  "subject_progress",
  "custom",
] as const;

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

// Schema for creating a new goal
const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  metricType: z.enum(ALLOWED_METRIC_TYPES),
  targetValue: z.number().int().min(1).max(10000),
  subjectId: z.string().uuid().optional().nullable(),
  config: goalConfigSchema.optional(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional().nullable(),
}).strict();

// Note: updateGoalSchema is in the [goalId]/route.ts file for PUT operations

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

// GET - Get all learning goals for a child
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    const { childId } = await params;

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

    // Fetch goals with their progress history
    const goals = await db
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
          eq(learningGoals.learnerId, child.id),
          isNull(learningGoals.deletedAt)
        )
      )
      .orderBy(desc(learningGoals.createdAt));

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progressPercent: goal.targetValue > 0
        ? Math.min(100, Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100))
        : 0,
    }));

    return NextResponse.json({
      goals: goalsWithProgress,
      childName: child.name,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST - Create a new learning goal for a child
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    const { childId } = await params;

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

    const body = await request.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, metricType, targetValue, subjectId, config, startDate, endDate } = parsed.data;

    // Validate subjectId if provided
    if (subjectId) {
      const subject = await db.query.subjects.findFirst({
        where: eq(subjects.id, subjectId),
      });
      if (!subject) {
        return NextResponse.json(
          { error: "Invalid subject ID" },
          { status: 400 }
        );
      }
    }

    // Create the goal
    const [newGoal] = await db
      .insert(learningGoals)
      .values({
        learnerId: child.id,
        organizationId: child.organizationId,
        createdByUserId: session.user.id,
        title,
        description: description ?? null,
        metricType: metricType as GoalMetricType,
        targetValue,
        currentValue: 0,
        subjectId: subjectId ?? null,
        config: config ?? null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: "active" as GoalStatus,
      })
      .returning();

    // Create initial progress history entry
    await db.insert(goalProgressHistory).values({
      goalId: newGoal.id,
      value: 0,
      percentComplete: 0,
      notes: "Goal created",
    });

    return NextResponse.json({
      success: true,
      goal: {
        ...newGoal,
        progressPercent: 0,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
