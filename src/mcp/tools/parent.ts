/**
 * Parent Oversight Tools for MCP Server
 *
 * Provides tools for AI agents to support parent oversight and control features.
 *
 * @module mcp/tools/parent
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { parentalConsentRecords } from "@/lib/db/schema/consent";
import { eq, and, desc, gte } from "drizzle-orm";

/**
 * Register parent oversight tools with the MCP server
 */
export function registerParentTools(server: McpServer): void {
  // List children for a parent
  // In this schema, learners.userId is the parent's user ID
  server.tool(
    "parent:list-children",
    "List all children linked to a parent account",
    {
      parentId: z.string().uuid().describe("The parent's user ID"),
    },
    async ({ parentId }) => {
      try {
        const children = await db
          .select({
            id: learners.id,
            name: learners.name,
            gradeLevel: learners.gradeLevel,
            avatarUrl: learners.avatarUrl,
            createdAt: learners.createdAt,
            isActive: learners.isActive,
            lastActiveAt: learners.lastActiveAt,
          })
          .from(learners)
          .where(eq(learners.userId, parentId))
          .orderBy(desc(learners.createdAt));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: children.length,
                children: children.map((c) => ({
                  id: c.id,
                  name: c.name,
                  gradeLevel: c.gradeLevel,
                  avatarUrl: c.avatarUrl,
                  isActive: c.isActive,
                  lastActiveAt: c.lastActiveAt,
                  addedAt: c.createdAt,
                })),
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
        };
      }
    }
  );

  // Get child's activity summary
  server.tool(
    "parent:get-child-activity",
    "Get a summary of a child's recent learning activity",
    {
      parentId: z.string().uuid().describe("The parent's user ID"),
      childId: z.string().uuid().describe("The child's learner ID"),
      days: z.number().min(1).max(30).default(7).describe("Number of days to look back"),
    },
    async ({ parentId, childId, days }) => {
      try {
        // Verify parent-child relationship (learner.userId = parent's user ID)
        const child = await db
          .select()
          .from(learners)
          .where(
            and(
              eq(learners.userId, parentId),
              eq(learners.id, childId)
            )
          )
          .limit(1);

        if (child.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Child not found or not linked to this parent",
                }),
              },
            ],
          };
        }

        const since = new Date();
        since.setDate(since.getDate() - days);

        // Get recent activity attempts
        const recentActivity = await db
          .select()
          .from(activityAttempts)
          .where(
            and(
              eq(activityAttempts.learnerId, childId),
              gte(activityAttempts.startedAt, since)
            )
          )
          .orderBy(desc(activityAttempts.startedAt))
          .limit(50);

        // Get subject progress for streak info
        const subjectProgress = await db
          .select()
          .from(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, childId))
          .limit(1);

        // Calculate summary stats
        const totalTime = recentActivity.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
        const completedCount = recentActivity.filter((a) => a.completedAt !== null).length;
        const averageScore = recentActivity.length > 0
          ? recentActivity.reduce((sum, a) => sum + (a.score || 0), 0) / recentActivity.length
          : 0;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                childId,
                period: {
                  days,
                  from: since.toISOString(),
                  to: new Date().toISOString(),
                },
                summary: {
                  activitiesCompleted: completedCount,
                  totalTimeMinutes: Math.round(totalTime / 60),
                  averageScore: Math.round(averageScore),
                  currentStreak: subjectProgress[0]?.currentStreak || 0,
                },
                recentActivities: recentActivity.slice(0, 10).map((a) => ({
                  id: a.id,
                  activityId: a.activityId,
                  startedAt: a.startedAt,
                  completedAt: a.completedAt,
                  score: a.score,
                  passed: a.passed,
                })),
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
        };
      }
    }
  );

  // Get parental controls for a child
  server.tool(
    "parent:get-controls",
    "Get the current parental control settings for a child",
    {
      parentId: z.string().uuid().describe("The parent's user ID"),
      childId: z.string().uuid().describe("The child's learner ID"),
    },
    async ({ parentId, childId }) => {
      try {
        // Verify parent-child relationship and get learner with embedded controls
        const child = await db
          .select()
          .from(learners)
          .where(
            and(
              eq(learners.userId, parentId),
              eq(learners.id, childId)
            )
          )
          .limit(1);

        if (child.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Child not found or not linked to this parent",
                }),
              },
            ],
          };
        }

        // Get COPPA consent status
        const consent = await db
          .select()
          .from(parentalConsentRecords)
          .where(eq(parentalConsentRecords.learnerId, childId))
          .orderBy(desc(parentalConsentRecords.createdAt))
          .limit(1);

        // Parental controls are embedded in the learner record
        const controls = child[0].parentalControls;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                childId,
                controls: controls || {
                  screenTimeLimit: null,
                  allowedSubjects: null,
                  blockedContent: null,
                  requireParentApproval: false,
                },
                coppaConsent: consent[0] ? {
                  status: consent[0].status,
                  givenAt: consent[0].consentedAt,
                  expiresAt: consent[0].expiresAt,
                } : null,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
        };
      }
    }
  );

  // Update parental controls
  server.tool(
    "parent:update-controls",
    "Update parental control settings for a child",
    {
      parentId: z.string().uuid().describe("The parent's user ID"),
      childId: z.string().uuid().describe("The child's learner ID"),
      screenTimeLimit: z.number().min(0).max(480).optional().describe("Daily time limit in minutes"),
      allowedSubjects: z.array(z.string()).optional().describe("List of allowed subject IDs"),
      blockedContent: z.array(z.string()).optional().describe("List of blocked content IDs"),
      requireParentApproval: z.boolean().optional().describe("Require parent approval for new content"),
    },
    async ({ parentId, childId, screenTimeLimit, allowedSubjects, blockedContent, requireParentApproval }) => {
      try {
        // Verify parent-child relationship
        const child = await db
          .select()
          .from(learners)
          .where(
            and(
              eq(learners.userId, parentId),
              eq(learners.id, childId)
            )
          )
          .limit(1);

        if (child.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Child not found or not linked to this parent",
                }),
              },
            ],
          };
        }

        // Get current controls and merge with updates
        const currentControls = child[0].parentalControls || {};
        const updatedControls = {
          ...currentControls,
          ...(screenTimeLimit !== undefined && { screenTimeLimit }),
          ...(allowedSubjects !== undefined && { allowedSubjects }),
          ...(blockedContent !== undefined && { blockedContent }),
          ...(requireParentApproval !== undefined && { requireParentApproval }),
        };

        // Update the learner record with new parental controls
        await db
          .update(learners)
          .set({
            parentalControls: updatedControls,
            updatedAt: new Date(),
          })
          .where(eq(learners.id, childId));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Parental controls updated",
                controls: updatedControls,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
        };
      }
    }
  );

  // Get weekly progress report
  server.tool(
    "parent:get-weekly-report",
    "Get a weekly progress report for a child",
    {
      parentId: z.string().uuid().describe("The parent's user ID"),
      childId: z.string().uuid().describe("The child's learner ID"),
    },
    async ({ parentId, childId }) => {
      try {
        // Verify parent-child relationship and get learner info
        const learner = await db
          .select()
          .from(learners)
          .where(
            and(
              eq(learners.userId, parentId),
              eq(learners.id, childId)
            )
          )
          .limit(1);

        if (learner.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Child not found or not linked to this parent",
                }),
              },
            ],
          };
        }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get this week's activity
        const weekActivity = await db
          .select()
          .from(activityAttempts)
          .where(
            and(
              eq(activityAttempts.learnerId, childId),
              gte(activityAttempts.startedAt, weekAgo)
            )
          );

        // Get subject progress for streak
        const subjectProgress = await db
          .select()
          .from(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, childId))
          .limit(1);

        // Calculate stats
        const totalTime = weekActivity.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
        const completed = weekActivity.filter((a) => a.completedAt !== null);
        const avgScore = completed.length > 0
          ? completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length
          : 0;

        // Group by day
        const byDay: Record<string, number> = {};
        weekActivity.forEach((a) => {
          const day = a.startedAt?.toISOString().split("T")[0] || "";
          byDay[day] = (byDay[day] || 0) + 1;
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                childId,
                childName: learner[0]?.name || "Unknown",
                gradeLevel: learner[0]?.gradeLevel,
                weekOf: weekAgo.toISOString().split("T")[0],
                summary: {
                  daysActive: Object.keys(byDay).length,
                  activitiesCompleted: completed.length,
                  totalTimeMinutes: Math.round(totalTime / 60),
                  averageScore: Math.round(avgScore),
                  currentStreak: subjectProgress[0]?.currentStreak || 0,
                },
                dailyBreakdown: byDay,
                highlights: [], // Would be populated with achievements, milestones
              }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            },
          ],
        };
      }
    }
  );
}
