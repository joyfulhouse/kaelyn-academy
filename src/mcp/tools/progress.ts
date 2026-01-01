/**
 * Progress Tracking Tools for MCP Server
 *
 * Provides tools for AI agents to track and update learner progress.
 *
 * @module mcp/tools/progress
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db";
import { learnerSubjectProgress, lessonProgress, activityAttempts, learnerAchievements, conceptMastery } from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Register progress tracking tools with the MCP server
 */
export function registerProgressTools(server: McpServer): void {
  // Get learner progress summary
  server.tool(
    "progress:get-summary",
    "Get a summary of a learner's overall progress",
    {
      learnerId: z.string().uuid().describe("The learner ID to get progress for"),
    },
    async ({ learnerId }) => {
      try {
        // Get learner info
        const learner = await db
          .select()
          .from(learners)
          .where(eq(learners.id, learnerId))
          .limit(1);

        if (learner.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Learner not found",
                }),
              },
            ],
          };
        }

        // Get subject progress records
        const subjectProgress = await db
          .select()
          .from(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, learnerId))
          .orderBy(desc(learnerSubjectProgress.updatedAt))
          .limit(100);

        // Get achievement count
        const achievementCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(learnerAchievements)
          .where(eq(learnerAchievements.learnerId, learnerId));

        // Calculate summary stats from subject progress
        const completedLessons = subjectProgress.reduce((sum, p) => sum + (p.completedLessons || 0), 0);
        const totalTimeMinutes = subjectProgress.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0) / 60;
        const avgMastery = subjectProgress.length > 0
          ? subjectProgress.reduce((sum, p) => sum + (p.masteryLevel || 0), 0) / subjectProgress.length
          : 0;
        const currentStreak = Math.max(...subjectProgress.map(p => p.currentStreak || 0), 0);
        const longestStreak = Math.max(...subjectProgress.map(p => p.longestStreak || 0), 0);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                learner: {
                  id: learner[0].id,
                  name: learner[0].name,
                  gradeLevel: learner[0].gradeLevel,
                },
                summary: {
                  lessonsCompleted: completedLessons,
                  totalTimeMinutes: Math.round(totalTimeMinutes),
                  averageMasteryPercent: Math.round(avgMastery),
                  currentStreak,
                  longestStreak,
                  achievementsEarned: achievementCount[0]?.count || 0,
                },
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

  // Get mastery levels by subject
  server.tool(
    "progress:get-mastery-levels",
    "Get a learner's mastery levels for specific subjects",
    {
      learnerId: z.string().uuid().describe("The learner ID"),
      subjectId: z.string().uuid().optional().describe("Filter by subject"),
    },
    async ({ learnerId, subjectId }) => {
      try {
        let whereClause = eq(learnerSubjectProgress.learnerId, learnerId);
        if (subjectId) {
          whereClause = and(
            eq(learnerSubjectProgress.learnerId, learnerId),
            eq(learnerSubjectProgress.subjectId, subjectId)
          )!;
        }

        const levels = await db
          .select()
          .from(learnerSubjectProgress)
          .where(whereClause)
          .orderBy(desc(learnerSubjectProgress.updatedAt));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: levels.length,
                masteryLevels: levels.map((m) => ({
                  id: m.id,
                  subjectId: m.subjectId,
                  masteryLevel: m.masteryLevel,
                  completedLessons: m.completedLessons,
                  totalLessons: m.totalLessons,
                  currentStreak: m.currentStreak,
                  lastActivityAt: m.lastActivityAt,
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

  // Get recent activity
  server.tool(
    "progress:get-recent-activity",
    "Get a learner's recent learning activity",
    {
      learnerId: z.string().uuid().describe("The learner ID"),
      limit: z.number().min(1).max(50).default(10).describe("Number of recent activities"),
    },
    async ({ learnerId, limit }) => {
      try {
        const recentAttempts = await db
          .select()
          .from(activityAttempts)
          .where(eq(activityAttempts.learnerId, learnerId))
          .orderBy(desc(activityAttempts.startedAt))
          .limit(limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: recentAttempts.length,
                activities: recentAttempts.map((a) => ({
                  id: a.id,
                  activityId: a.activityId,
                  startedAt: a.startedAt,
                  completedAt: a.completedAt,
                  score: a.score,
                  maxScore: a.maxScore,
                  timeSpent: a.timeSpent,
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

  // Record activity completion
  server.tool(
    "progress:record-activity",
    "Record completion of an activity (requires authentication)",
    {
      learnerId: z.string().uuid().describe("The learner ID"),
      activityId: z.string().uuid().describe("The activity ID"),
      organizationId: z.string().uuid().describe("The organization ID"),
      score: z.number().min(0).max(100).describe("Score achieved (0-100)"),
      timeSpent: z.number().min(0).describe("Time spent in seconds"),
      answers: z.array(z.object({
        questionId: z.string(),
        answer: z.union([z.string(), z.array(z.string())]),
        correct: z.boolean(),
        timeSpent: z.number().optional(),
      })).optional().describe("Activity answers data"),
    },
    async ({ learnerId, activityId, organizationId, score, timeSpent, answers }) => {
      try {
        // Create activity attempt record
        const attempt = await db
          .insert(activityAttempts)
          .values({
            learnerId,
            activityId,
            organizationId,
            score,
            maxScore: 100,
            timeSpent,
            answers: answers ?? [],
            startedAt: new Date(Date.now() - timeSpent * 1000),
            completedAt: new Date(),
            passed: score >= 70,
          })
          .returning();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                attempt: {
                  id: attempt[0].id,
                  score: attempt[0].score,
                  passed: attempt[0].passed,
                  completedAt: attempt[0].completedAt,
                },
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

  // Get learning path recommendations
  server.tool(
    "progress:get-learning-path",
    "Get recommended next steps for a learner based on their progress",
    {
      learnerId: z.string().uuid().describe("The learner ID"),
    },
    async ({ learnerId }) => {
      try {
        // Get learner's grade level and preferences
        const learner = await db
          .select()
          .from(learners)
          .where(eq(learners.id, learnerId))
          .limit(1);

        if (learner.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Learner not found",
                }),
              },
            ],
          };
        }

        // Get incomplete lessons (lessons started but not completed)
        const incompleteProgress = await db
          .select()
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.learnerId, learnerId),
              sql`${lessonProgress.completedAt} IS NULL`,
              sql`${lessonProgress.startedAt} IS NOT NULL`
            )
          )
          .limit(5);

        // Get concepts with low mastery
        const lowMastery = await db
          .select()
          .from(conceptMastery)
          .where(
            and(
              eq(conceptMastery.learnerId, learnerId),
              sql`${conceptMastery.masteryLevel} < 70`
            )
          )
          .limit(3);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                learner: {
                  gradeLevel: learner[0].gradeLevel,
                  preferences: learner[0].preferences,
                },
                recommendations: {
                  continueLearning: incompleteProgress.map((p) => ({
                    lessonId: p.lessonId,
                    progress: p.progressPercent,
                    lastAccessed: p.updatedAt,
                  })),
                  needsPractice: lowMastery.map((m) => ({
                    conceptId: m.conceptId,
                    currentLevel: m.masteryLevel,
                  })),
                },
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
