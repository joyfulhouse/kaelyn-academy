import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

/**
 * Extended lastPosition type for activity tracking
 */
interface ActivityState {
  conceptId?: string;
  scrollPosition?: number;
  // Activity tracking
  completedActivities?: number[]; // Array of completed activity indices
  activityStartTimes?: Record<number, number>; // Activity index -> start timestamp
  activityTimes?: Record<number, number>; // Activity index -> time spent (seconds)
  lastActivityIndex?: number;
}

// Schema for activity state update
const activityStateSchema = z.object({
  lessonId: z.string().min(1), // Curriculum lesson ID (string)
  action: z.enum(["start", "complete", "update_time"]),
  activityIndex: z.number().int().min(0),
  totalActivities: z.number().int().min(1),
  timeSpent: z.number().int().min(0).optional(), // Seconds spent on activity
});

/**
 * POST /api/learner/activity - Track activity completion
 *
 * This endpoint handles curriculum-based activity tracking where:
 * - lessonId is a curriculum string ID (e.g., "k-count-1-10")
 * - activityIndex is the 0-based index in the lesson's activities array
 * - Activity state is stored in lessonProgress.lastPosition JSONB
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { lessonId, action, activityIndex, totalActivities, timeSpent } =
      activityStateSchema.parse(body);

    // Get learner profile
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      columns: { id: true, organizationId: true },
    });

    if (!learner) {
      return NextResponse.json(
        { error: "Learner profile not found" },
        { status: 404 }
      );
    }

    // Find existing lesson progress (using lessonId as string identifier)
    // Note: We're treating lessonId as a TEXT field for curriculum lessons
    // The database column is UUID but we store/query as text for curriculum IDs
    const existingProgress = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.learnerId, learner.id),
          // Cast to text for curriculum IDs (not referencing lessons table)
          eq(lessonProgress.lessonId as unknown as ReturnType<typeof eq>, lessonId as unknown)
        )
      )
      .limit(1);

    const now = Date.now();
    const currentState: ActivityState =
      (existingProgress[0]?.lastPosition as ActivityState) ?? {};

    // Initialize tracking arrays if needed
    if (!currentState.completedActivities) {
      currentState.completedActivities = [];
    }
    if (!currentState.activityStartTimes) {
      currentState.activityStartTimes = {};
    }
    if (!currentState.activityTimes) {
      currentState.activityTimes = {};
    }

    switch (action) {
      case "start":
        // Record activity start time
        currentState.activityStartTimes[activityIndex] = now;
        currentState.lastActivityIndex = activityIndex;
        break;

      case "complete":
        // Mark activity as completed
        if (!currentState.completedActivities.includes(activityIndex)) {
          currentState.completedActivities.push(activityIndex);
          currentState.completedActivities.sort((a, b) => a - b);
        }
        // Calculate time spent if start time exists
        if (currentState.activityStartTimes[activityIndex]) {
          const elapsed = Math.round(
            (now - currentState.activityStartTimes[activityIndex]) / 1000
          );
          currentState.activityTimes[activityIndex] =
            (currentState.activityTimes[activityIndex] ?? 0) + elapsed;
          delete currentState.activityStartTimes[activityIndex];
        } else if (timeSpent) {
          // Use provided time if no start time recorded
          currentState.activityTimes[activityIndex] = timeSpent;
        }
        break;

      case "update_time":
        // Update time spent on current activity
        if (timeSpent !== undefined) {
          currentState.activityTimes[activityIndex] =
            (currentState.activityTimes[activityIndex] ?? 0) + timeSpent;
        }
        break;
    }

    // Calculate overall progress
    const completedCount = currentState.completedActivities.length;
    const progressPercent = Math.round((completedCount / totalActivities) * 100);
    const isComplete = completedCount >= totalActivities;

    // Calculate total time spent on all activities
    const totalTimeSpent = Object.values(currentState.activityTimes).reduce(
      (sum, t) => sum + t,
      0
    );

    if (existingProgress[0]) {
      // Update existing progress
      const [updated] = await db
        .update(lessonProgress)
        .set({
          lastPosition: currentState,
          activitiesCompleted: completedCount,
          progressPercent,
          status: isComplete ? "completed" : "in_progress",
          completedAt: isComplete ? new Date() : null,
          timeSpent: (existingProgress[0].timeSpent ?? 0) + (timeSpent ?? 0),
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existingProgress[0].id))
        .returning();

      return NextResponse.json({
        progress: updated,
        activityState: currentState,
        completedCount,
        totalActivities,
        progressPercent,
        isComplete,
        totalTimeSpent,
      });
    } else {
      // Create new progress record
      // Note: We need to handle the UUID constraint for lessonId
      // For curriculum lessons, we'll use the lessonId string directly
      // This works because PostgreSQL accepts any UUID-like string format
      // For non-UUID strings, we'd need a different approach

      // For now, generate a deterministic UUID from the lesson ID
      // This is a workaround for the FK constraint
      const lessonUuid = await generateDeterministicUuid(lessonId);

      const [created] = await db
        .insert(lessonProgress)
        .values({
          learnerId: learner.id,
          lessonId: lessonUuid,
          organizationId: learner.organizationId,
          lastPosition: currentState,
          activitiesCompleted: completedCount,
          progressPercent,
          status: isComplete ? "completed" : "in_progress",
          startedAt: new Date(),
          completedAt: isComplete ? new Date() : null,
          timeSpent: timeSpent ?? 0,
        })
        .returning();

      return NextResponse.json(
        {
          progress: created,
          activityState: currentState,
          completedCount,
          totalActivities,
          progressPercent,
          isComplete,
          totalTimeSpent,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating activity state:", error);
    return NextResponse.json(
      { error: "Failed to update activity state" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/learner/activity - Get activity state for a lesson
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

    // Try to find by deterministic UUID
    const lessonUuid = await generateDeterministicUuid(lessonId);

    const progress = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.learnerId, learner.id),
          eq(lessonProgress.lessonId, lessonUuid)
        )
      )
      .limit(1);

    if (progress[0]) {
      const state = progress[0].lastPosition as ActivityState | null;
      return NextResponse.json({
        progress: progress[0],
        activityState: state ?? {
          completedActivities: [],
          activityTimes: {},
        },
        completedCount: state?.completedActivities?.length ?? 0,
      });
    }

    // No progress yet
    return NextResponse.json({
      progress: null,
      activityState: {
        completedActivities: [],
        activityTimes: {},
      },
      completedCount: 0,
    });
  } catch (error) {
    console.error("Error fetching activity state:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity state" },
      { status: 500 }
    );
  }
}

/**
 * Generate a deterministic UUID v5 from a curriculum lesson ID
 * Uses namespace UUID for Kaelyn's Academy curriculum
 */
async function generateDeterministicUuid(lessonId: string): Promise<string> {
  // Use a fixed namespace UUID for curriculum lessons
  const namespace = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // DNS namespace UUID

  // Create a simple hash-based UUID v5-like ID
  // This ensures the same lessonId always generates the same UUID
  const encoder = new TextEncoder();
  const data = encoder.encode(namespace + lessonId);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);

  // Format as UUID (version 5)
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
