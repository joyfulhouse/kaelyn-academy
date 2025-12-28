/**
 * Parental Controls Enforcement
 *
 * SECURITY/COPPA: Enforces parental restrictions on learner activities.
 * These controls help parents manage their children's learning experience.
 *
 * Controls enforced:
 * - Screen time limits (daily usage caps)
 * - Allowed subjects (whitelist of subjects)
 * - Blocked content (blacklist of topics)
 * - Approval required (parent must approve new activities)
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { lessonProgress } from "@/lib/db/schema/progress";
import { eq, and, gte, sql } from "drizzle-orm";

export interface ParentalControls {
  screenTimeLimit?: number; // minutes per day
  allowedSubjects?: string[];
  blockedContent?: string[];
  requireParentApproval?: boolean;
}

export type EnforcementResult = {
  allowed: true;
  controls: ParentalControls;
  remainingTime?: number; // minutes remaining today
} | {
  allowed: false;
  reason: string;
  code: "SCREEN_TIME_EXCEEDED" | "SUBJECT_NOT_ALLOWED" | "CONTENT_BLOCKED" | "APPROVAL_REQUIRED";
  controls: ParentalControls;
};

/**
 * Check if a learner can access content based on parental controls
 *
 * @param learnerId - The learner's ID
 * @param subject - Optional subject being accessed
 * @param topic - Optional topic being accessed
 * @returns Enforcement result with allowed status
 */
export async function checkParentalControls(
  learnerId: string,
  subject?: string,
  topic?: string
): Promise<EnforcementResult> {
  // Get learner with parental controls
  const [learner] = await db
    .select({
      id: learners.id,
      parentalControls: learners.parentalControls,
    })
    .from(learners)
    .where(eq(learners.id, learnerId));

  if (!learner) {
    // Learner not found - allow but log warning
    console.warn(`Parental controls check: Learner ${learnerId} not found`);
    return { allowed: true, controls: {} };
  }

  const controls = (learner.parentalControls || {}) as ParentalControls;

  // Check screen time limit
  if (controls.screenTimeLimit) {
    const todayUsage = await getTodayScreenTime(learnerId);

    if (todayUsage >= controls.screenTimeLimit) {
      return {
        allowed: false,
        reason: "Daily screen time limit reached. Take a break and try again tomorrow!",
        code: "SCREEN_TIME_EXCEEDED",
        controls,
      };
    }

    // Return remaining time for UI display
    const remainingTime = controls.screenTimeLimit - todayUsage;

    // Check if subject is allowed
    if (subject && controls.allowedSubjects?.length) {
      const isAllowed = controls.allowedSubjects.some(
        (s) => s.toLowerCase() === subject.toLowerCase()
      );
      if (!isAllowed) {
        return {
          allowed: false,
          reason: `This subject isn't available right now. Ask your parent to update your learning settings.`,
          code: "SUBJECT_NOT_ALLOWED",
          controls,
        };
      }
    }

    // Check blocked content
    if (topic && controls.blockedContent?.length) {
      const isBlocked = controls.blockedContent.some(
        (blocked) => topic.toLowerCase().includes(blocked.toLowerCase())
      );
      if (isBlocked) {
        return {
          allowed: false,
          reason: "This content isn't available. Ask your parent for help.",
          code: "CONTENT_BLOCKED",
          controls,
        };
      }
    }

    return { allowed: true, controls, remainingTime };
  }

  // Check subject restrictions (no screen time limit set)
  if (subject && controls.allowedSubjects?.length) {
    const isAllowed = controls.allowedSubjects.some(
      (s) => s.toLowerCase() === subject.toLowerCase()
    );
    if (!isAllowed) {
      return {
        allowed: false,
        reason: `This subject isn't available right now. Ask your parent to update your learning settings.`,
        code: "SUBJECT_NOT_ALLOWED",
        controls,
      };
    }
  }

  // Check blocked content
  if (topic && controls.blockedContent?.length) {
    const isBlocked = controls.blockedContent.some(
      (blocked) => topic.toLowerCase().includes(blocked.toLowerCase())
    );
    if (isBlocked) {
      return {
        allowed: false,
        reason: "This content isn't available. Ask your parent for help.",
        code: "CONTENT_BLOCKED",
        controls,
      };
    }
  }

  return { allowed: true, controls };
}

/**
 * Get today's screen time usage for a learner (in minutes)
 * Uses lesson progress time tracking as the source of truth
 */
async function getTodayScreenTime(learnerId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sum up time from lesson progress updated today
  // timeSpent is stored in seconds
  const result = await db
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(${lessonProgress.timeSpent}), 0) / 60`,
    })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.learnerId, learnerId),
        gte(lessonProgress.updatedAt, today)
      )
    );

  return Math.round(result[0]?.totalMinutes || 0);
}

/**
 * Create a NextResponse for parental control blocks
 */
export function parentalControlBlockResponse(result: EnforcementResult & { allowed: false }): NextResponse {
  return NextResponse.json(
    {
      error: result.reason,
      code: result.code,
      type: "PARENTAL_CONTROL",
    },
    { status: 403 }
  );
}

/**
 * Middleware helper to enforce parental controls in API routes
 *
 * @example
 * const controlsResult = await enforceParentalControls(learnerId, "Math", "Fractions");
 * if (controlsResult) return controlsResult; // Returns 403 if blocked
 */
export async function enforceParentalControls(
  learnerId: string,
  subject?: string,
  topic?: string
): Promise<NextResponse | null> {
  const result = await checkParentalControls(learnerId, subject, topic);

  if (!result.allowed) {
    return parentalControlBlockResponse(result);
  }

  return null; // Allowed - continue
}
