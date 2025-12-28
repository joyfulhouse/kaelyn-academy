/**
 * Session Management Utilities
 *
 * SECURITY: Provides functions for session invalidation on privilege changes.
 * When a user's role changes, all their existing sessions should be invalidated
 * to prevent privilege escalation or stale permission attacks.
 */

import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";

/**
 * Invalidate all sessions for a user.
 *
 * SECURITY: Call this when:
 * - User's role changes
 * - User's organization changes
 * - User is deactivated
 * - User requests logout from all devices
 * - Security incident requires session reset
 *
 * @param userId - The user ID whose sessions to invalidate
 * @returns Number of sessions deleted
 */
export async function invalidateUserSessions(userId: string): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(eq(sessions.userId, userId))
    .returning({ token: sessions.sessionToken });

  return result.length;
}

/**
 * Check if a role change requires session invalidation
 *
 * @param oldRole - Previous role
 * @param newRole - New role
 * @returns Whether sessions should be invalidated
 */
export function requiresSessionInvalidation(
  oldRole: string | null | undefined,
  newRole: string | null | undefined
): boolean {
  // Always invalidate on any role change
  if (oldRole !== newRole) {
    return true;
  }
  return false;
}

/**
 * Invalidate sessions and return info for logging
 */
export async function invalidateSessionsWithLogging(
  userId: string,
  reason: string
): Promise<{ sessionsInvalidated: number; reason: string }> {
  const count = await invalidateUserSessions(userId);

  if (count > 0) {
    console.log(
      `[Session Security] Invalidated ${count} session(s) for user ${userId}. Reason: ${reason}`
    );
  }

  return {
    sessionsInvalidated: count,
    reason,
  };
}
