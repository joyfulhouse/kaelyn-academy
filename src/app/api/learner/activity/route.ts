import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessonProgress } from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { enforceParentalControls } from "@/lib/api/parental-controls";

/**
 * Extended lastPosition type for activity tracking
 */
interface ActivityState {
  conceptId?: string;
  scrollPosition?: number;
  // Activity tracking
  completedActivities?: number[]; // Array of completed activity indices
  activityStartTimes?: Record<string, number>; // Activity index (as string key) -> start timestamp
  activityTimes?: Record<string, number>; // Activity index (as string key) -> time spent (seconds)
  lastActivityIndex?: number;
}

// SECURITY: Maximum limits to prevent resource exhaustion
const MAX_ACTIVITY_INDEX = 1000; // Maximum activity index allowed
const MAX_ACTIVITIES = 500; // Maximum activities per lesson
const MAX_TIME_PER_ACTIVITY = 86400; // 24 hours in seconds
const MAX_SCROLL_POSITION = 1000000; // Maximum scroll position

// Schema for activity state update
const activityStateSchema = z.object({
  lessonId: z.string().min(1).max(100), // Curriculum lesson ID (string)
  action: z.enum(["start", "complete", "update_time"]),
  activityIndex: z.number().int().min(0).max(MAX_ACTIVITY_INDEX),
  totalActivities: z.number().int().min(1).max(MAX_ACTIVITIES),
  timeSpent: z.number().int().min(0).max(MAX_TIME_PER_ACTIVITY).optional(), // Seconds spent on activity
});

// SECURITY: Schema for validating stored activity state from database
// This prevents JSONB injection attacks via persisted malicious data
const storedActivityStateSchema = z.object({
  conceptId: z.string().max(100).optional(),
  scrollPosition: z.number().int().min(0).max(MAX_SCROLL_POSITION).optional(),
  completedActivities: z.array(z.number().int().min(0).max(MAX_ACTIVITY_INDEX)).max(MAX_ACTIVITIES).optional(),
  activityStartTimes: z.record(
    z.string().regex(/^\d+$/), // Keys must be numeric strings
    z.number().int().min(0)
  ).optional(),
  activityTimes: z.record(
    z.string().regex(/^\d+$/), // Keys must be numeric strings
    z.number().int().min(0).max(MAX_TIME_PER_ACTIVITY)
  ).optional(),
  lastActivityIndex: z.number().int().min(0).max(MAX_ACTIVITY_INDEX).optional(),
}).strict();

/**
 * SECURITY: Safely parse stored activity state from database
 * Returns validated data or empty defaults, never unvalidated JSONB
 */
function safeParseActivityState(state: unknown): ActivityState {
  const result = storedActivityStateSchema.safeParse(state);
  if (result.success) {
    return result.data;
  }
  // If validation fails, log and return empty state
  console.warn("Invalid activity state in database, using defaults:", result.error.issues);
  return {
    completedActivities: [],
    activityStartTimes: {},
    activityTimes: {},
  };
}

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

    // COPPA: Enforce parental controls (screen time limits, allowed subjects, etc.)
    const controlsBlock = await enforceParentalControls(learner.id);
    if (controlsBlock) {
      return controlsBlock;
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

    // SECURITY: Validate stored JSONB before trusting it
    const currentState: ActivityState = safeParseActivityState(
      existingProgress[0]?.lastPosition
    );

    // Ensure tracking arrays/objects are initialized
    if (!currentState.completedActivities) {
      currentState.completedActivities = [];
    }
    if (!currentState.activityStartTimes) {
      currentState.activityStartTimes = {};
    }
    if (!currentState.activityTimes) {
      currentState.activityTimes = {};
    }

    // SECURITY: Use string keys for object access to prevent prototype pollution
    const activityKey = String(activityIndex);

    switch (action) {
      case "start":
        // Record activity start time
        currentState.activityStartTimes[activityKey] = now;
        currentState.lastActivityIndex = activityIndex;
        break;

      case "complete":
        // Mark activity as completed
        if (!currentState.completedActivities.includes(activityIndex)) {
          currentState.completedActivities.push(activityIndex);
          currentState.completedActivities.sort((a, b) => a - b);
        }
        // Calculate time spent if start time exists
        if (currentState.activityStartTimes[activityKey]) {
          const elapsed = Math.round(
            (now - currentState.activityStartTimes[activityKey]) / 1000
          );
          // SECURITY: Clamp total time to prevent overflow
          const newTime = Math.min(
            (currentState.activityTimes[activityKey] ?? 0) + elapsed,
            MAX_TIME_PER_ACTIVITY
          );
          currentState.activityTimes[activityKey] = newTime;
          delete currentState.activityStartTimes[activityKey];
        } else if (timeSpent) {
          // Use provided time if no start time recorded
          currentState.activityTimes[activityKey] = Math.min(timeSpent, MAX_TIME_PER_ACTIVITY);
        }
        break;

      case "update_time":
        // Update time spent on current activity
        if (timeSpent !== undefined) {
          // SECURITY: Clamp total time to prevent overflow
          const newTime = Math.min(
            (currentState.activityTimes[activityKey] ?? 0) + timeSpent,
            MAX_TIME_PER_ACTIVITY
          );
          currentState.activityTimes[activityKey] = newTime;
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
      // SECURITY: Validate stored JSONB before returning to client
      const state = safeParseActivityState(progress[0].lastPosition);
      return NextResponse.json({
        progress: progress[0],
        activityState: state,
        completedCount: state.completedActivities?.length ?? 0,
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
