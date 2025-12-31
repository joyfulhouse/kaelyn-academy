import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  learnerStreaks,
  streakFreezeHistory,
  streakRepairHistory,
  streakMilestones,
} from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// ============================================
// STREAK CONSTANTS
// ============================================

// Default milestones if none are configured in the database
const DEFAULT_MILESTONES = [
  { days: 7, name: "Week Warrior", freezeTokenReward: 1, points: 50 },
  { days: 14, name: "Two Week Titan", freezeTokenReward: 1, points: 100 },
  { days: 30, name: "Monthly Master", freezeTokenReward: 2, points: 200 },
  { days: 60, name: "Double Month Champion", freezeTokenReward: 2, points: 350 },
  { days: 100, name: "Century Achiever", freezeTokenReward: 3, points: 500 },
  { days: 365, name: "Year Legend", freezeTokenReward: 5, points: 1000 },
];

// Repair cost calculation: base + (days missed * multiplier)
const REPAIR_BASE_COST = 2;
const REPAIR_PER_DAY_COST = 1;
const MAX_REPAIR_DAYS = 7; // Can only repair if missed <= 7 days

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get start of day in UTC for consistent date comparisons
 */
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the number of days between two dates (ignoring time)
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate repair cost based on days missed
 */
function calculateRepairCost(daysMissed: number): number {
  if (daysMissed > MAX_REPAIR_DAYS) {
    return -1; // Cannot repair
  }
  return REPAIR_BASE_COST + (daysMissed * REPAIR_PER_DAY_COST);
}

/**
 * Get or create learner streak record
 */
async function getOrCreateStreak(learnerId: string, organizationId: string) {
  const existing = await db.query.learnerStreaks.findFirst({
    where: eq(learnerStreaks.learnerId, learnerId),
  });

  if (existing) {
    return existing;
  }

  // Create new streak record
  const [created] = await db
    .insert(learnerStreaks)
    .values({
      learnerId,
      organizationId,
      currentStreak: 0,
      longestStreak: 0,
      freezeTokens: 1, // Start with 1 free freeze token
      totalFreezeTokensEarned: 1,
      milestones: {
        reachedMilestones: [],
        unclaimedRewards: [],
      },
    })
    .returning();

  // Log the initial token grant
  await db.insert(streakFreezeHistory).values({
    learnerId,
    organizationId,
    action: "earned",
    tokensChange: 1,
    reason: "Welcome bonus - starting freeze token",
    streakAtTime: 0,
  });

  return created;
}

// NOTE: Milestone check logic is implemented inline in the activity recording endpoint
// (to be called when a lesson is completed). This function stub is reserved for that purpose.

// ============================================
// API ROUTES
// ============================================

/**
 * GET /api/learner/streak - Get current streak status
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get learner profile
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      columns: { id: true, organizationId: true, name: true },
    });

    if (!learner) {
      return NextResponse.json(
        { error: "Learner profile not found" },
        { status: 404 }
      );
    }

    // Get or create streak record
    const streak = await getOrCreateStreak(learner.id, learner.organizationId);

    // Calculate streak status
    const today = getStartOfDay(new Date());
    const lastActivity = streak.lastActivityDate
      ? getStartOfDay(new Date(streak.lastActivityDate))
      : null;

    let streakStatus: "active" | "at_risk" | "broken" = "active";
    let daysMissed = 0;
    let canRepair = false;
    let repairCost = 0;

    if (lastActivity) {
      daysMissed = getDaysDifference(today, lastActivity);

      if (daysMissed === 0) {
        // Already active today
        streakStatus = "active";
      } else if (daysMissed === 1) {
        // Yesterday - at risk if no activity today
        streakStatus = "at_risk";
      } else {
        // Missed multiple days
        streakStatus = "broken";
        canRepair = daysMissed <= MAX_REPAIR_DAYS && streak.currentStreak > 0;
        repairCost = canRepair ? calculateRepairCost(daysMissed) : 0;
      }
    }

    // Get recent freeze history
    const recentHistory = await db
      .select()
      .from(streakFreezeHistory)
      .where(eq(streakFreezeHistory.learnerId, learner.id))
      .orderBy(desc(streakFreezeHistory.createdAt))
      .limit(10);

    // Get milestone definitions for display
    const dbMilestones = await db.query.streakMilestones.findMany({
      orderBy: streakMilestones.days,
    });

    const milestoneInfo = (dbMilestones.length > 0 ? dbMilestones : DEFAULT_MILESTONES).map((m) => ({
      days: m.days,
      name: m.name,
      freezeTokenReward: m.freezeTokenReward,
      points: m.points,
      reached: streak.milestones?.reachedMilestones?.includes(m.days) || false,
      unclaimed: streak.milestones?.unclaimedRewards?.includes(m.days) || false,
    }));

    // Find next milestone
    const nextMilestone = milestoneInfo.find((m) => !m.reached);

    return NextResponse.json({
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate?.toISOString() || null,
        freezeTokens: streak.freezeTokens,
        totalFreezeTokensEarned: streak.totalFreezeTokensEarned,
        totalFreezeTokensUsed: streak.totalFreezeTokensUsed,
        totalRepairs: streak.totalRepairs,
      },
      status: {
        streakStatus,
        daysMissed,
        canRepair,
        repairCost,
        canFreeze: streak.freezeTokens > 0 && streakStatus === "at_risk",
      },
      milestones: milestoneInfo,
      nextMilestone: nextMilestone || null,
      recentHistory: recentHistory.map((h) => ({
        id: h.id,
        action: h.action,
        tokensChange: h.tokensChange,
        reason: h.reason,
        createdAt: h.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}

// ============================================
// POST SCHEMAS
// ============================================

const freezeStreakSchema = z.object({
  action: z.literal("freeze"),
});

const repairStreakSchema = z.object({
  action: z.literal("repair"),
});

const claimMilestoneSchema = z.object({
  action: z.literal("claim_milestone"),
  milestoneDays: z.number().int().positive(),
});

const actionSchema = z.discriminatedUnion("action", [
  freezeStreakSchema,
  repairStreakSchema,
  claimMilestoneSchema,
]);

/**
 * POST /api/learner/streak - Perform streak actions (freeze, repair, claim)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = actionSchema.parse(body);

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

    const streak = await getOrCreateStreak(learner.id, learner.organizationId);
    const today = getStartOfDay(new Date());
    const lastActivity = streak.lastActivityDate
      ? getStartOfDay(new Date(streak.lastActivityDate))
      : null;
    const daysMissed = lastActivity ? getDaysDifference(today, lastActivity) : 0;

    switch (parsed.action) {
      case "freeze": {
        // Validate freeze is possible
        if (streak.freezeTokens < 1) {
          return NextResponse.json(
            { error: "No freeze tokens available" },
            { status: 400 }
          );
        }

        if (daysMissed !== 1) {
          return NextResponse.json(
            { error: "Can only freeze when exactly 1 day missed" },
            { status: 400 }
          );
        }

        // Apply freeze
        const [updated] = await db
          .update(learnerStreaks)
          .set({
            freezeTokens: streak.freezeTokens - 1,
            totalFreezeTokensUsed: streak.totalFreezeTokensUsed + 1,
            lastActivityDate: today, // Extend the streak
            updatedAt: new Date(),
          })
          .where(eq(learnerStreaks.id, streak.id))
          .returning();

        // Log the freeze
        await db.insert(streakFreezeHistory).values({
          learnerId: learner.id,
          organizationId: learner.organizationId,
          action: "used",
          tokensChange: -1,
          reason: "Streak freeze used to protect streak",
          streakAtTime: streak.currentStreak,
          dateProtected: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        });

        return NextResponse.json({
          success: true,
          message: "Streak freeze applied successfully!",
          streak: {
            currentStreak: updated.currentStreak,
            freezeTokens: updated.freezeTokens,
          },
        });
      }

      case "repair": {
        // Validate repair is possible
        if (daysMissed > MAX_REPAIR_DAYS) {
          return NextResponse.json(
            { error: `Cannot repair streak - too many days missed (max ${MAX_REPAIR_DAYS})` },
            { status: 400 }
          );
        }

        if (streak.currentStreak === 0) {
          return NextResponse.json(
            { error: "No streak to repair" },
            { status: 400 }
          );
        }

        const cost = calculateRepairCost(daysMissed);
        if (streak.freezeTokens < cost) {
          return NextResponse.json(
            {
              error: `Not enough tokens to repair. Need ${cost}, have ${streak.freezeTokens}`,
              cost,
              available: streak.freezeTokens,
            },
            { status: 400 }
          );
        }

        // Perform repair
        const [updated] = await db
          .update(learnerStreaks)
          .set({
            freezeTokens: streak.freezeTokens - cost,
            totalFreezeTokensUsed: streak.totalFreezeTokensUsed + cost,
            totalRepairs: streak.totalRepairs + 1,
            lastRepairDate: new Date(),
            lastActivityDate: today,
            updatedAt: new Date(),
          })
          .where(eq(learnerStreaks.id, streak.id))
          .returning();

        // Log the repair
        await db.insert(streakRepairHistory).values({
          learnerId: learner.id,
          organizationId: learner.organizationId,
          streakBefore: streak.currentStreak,
          streakAfter: streak.currentStreak,
          daysMissed,
          tokensCost: cost,
          brokenAt: lastActivity || new Date(),
        });

        // Log token usage
        await db.insert(streakFreezeHistory).values({
          learnerId: learner.id,
          organizationId: learner.organizationId,
          action: "used",
          tokensChange: -cost,
          reason: `Streak repair for ${daysMissed} missed day(s)`,
          streakAtTime: streak.currentStreak,
        });

        return NextResponse.json({
          success: true,
          message: `Streak repaired! Used ${cost} tokens.`,
          streak: {
            currentStreak: updated.currentStreak,
            freezeTokens: updated.freezeTokens,
          },
        });
      }

      case "claim_milestone": {
        const { milestoneDays } = parsed;
        const milestones = streak.milestones || { reachedMilestones: [], unclaimedRewards: [] };

        // Validate milestone can be claimed
        if (!milestones.unclaimedRewards?.includes(milestoneDays)) {
          return NextResponse.json(
            { error: "Milestone reward not available to claim" },
            { status: 400 }
          );
        }

        // Get milestone definition
        const dbMilestones = await db.query.streakMilestones.findMany({
          where: eq(streakMilestones.days, milestoneDays),
        });

        const milestoneDef = dbMilestones[0] ||
          DEFAULT_MILESTONES.find((m) => m.days === milestoneDays);

        if (!milestoneDef) {
          return NextResponse.json(
            { error: "Milestone definition not found" },
            { status: 404 }
          );
        }

        const tokenReward = milestoneDef.freezeTokenReward || 0;

        // Claim the reward
        const newUnclaimedRewards = milestones.unclaimedRewards.filter(
          (d) => d !== milestoneDays
        );

        const [updated] = await db
          .update(learnerStreaks)
          .set({
            freezeTokens: streak.freezeTokens + tokenReward,
            totalFreezeTokensEarned: streak.totalFreezeTokensEarned + tokenReward,
            milestones: {
              ...milestones,
              unclaimedRewards: newUnclaimedRewards,
            },
            updatedAt: new Date(),
          })
          .where(eq(learnerStreaks.id, streak.id))
          .returning();

        // Log the earned tokens
        if (tokenReward > 0) {
          await db.insert(streakFreezeHistory).values({
            learnerId: learner.id,
            organizationId: learner.organizationId,
            action: "earned",
            tokensChange: tokenReward,
            reason: `${milestoneDef.name} milestone reward (${milestoneDays} day streak)`,
            streakAtTime: streak.currentStreak,
          });
        }

        return NextResponse.json({
          success: true,
          message: `Claimed ${milestoneDef.name} reward! +${tokenReward} freeze tokens`,
          reward: {
            name: milestoneDef.name,
            freezeTokens: tokenReward,
            points: milestoneDef.points || 0,
          },
          streak: {
            freezeTokens: updated.freezeTokens,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error performing streak action:", error);
    return NextResponse.json(
      { error: "Failed to perform streak action" },
      { status: 500 }
    );
  }
}
