/**
 * Curriculum Tools for MCP Server
 *
 * Provides tools for AI agents to browse and search curriculum content.
 *
 * @module mcp/tools/curriculum
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db";
import { subjects, units, lessons, activities } from "@/lib/db/schema/curriculum";
import { eq, and, like, ilike, desc, asc } from "drizzle-orm";

/**
 * Register curriculum tools with the MCP server
 */
export function registerCurriculumTools(server: McpServer): void {
  // List subjects
  server.tool(
    "curriculum:list-subjects",
    "List all available subjects, optionally filtered by grade level",
    {
      gradeLevel: z.number().min(0).max(12).optional().describe("Filter by grade level (0=K, 1-12)"),
    },
    async ({ gradeLevel }) => {
      try {
        const allSubjects = await db.select().from(subjects).orderBy(asc(subjects.order));

        // Filter by grade if specified (subjects may have grade-specific content)
        const filtered = gradeLevel !== undefined
          ? allSubjects // For now, all subjects are available at all grades
          : allSubjects;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: filtered.length,
                subjects: filtered.map((s) => ({
                  id: s.id,
                  name: s.name,
                  slug: s.slug,
                  description: s.description,
                  icon: s.iconName,
                  color: s.color,
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

  // List lessons by subject and grade
  server.tool(
    "curriculum:list-lessons",
    "List lessons for a subject, optionally filtered by grade and unit",
    {
      subjectId: z.string().uuid().describe("The subject ID to list lessons for"),
      gradeLevel: z.number().min(0).max(12).optional().describe("Filter by grade level"),
      unitId: z.string().uuid().optional().describe("Filter by specific unit"),
      limit: z.number().min(1).max(100).default(20).describe("Maximum number of lessons to return"),
    },
    async ({ subjectId, gradeLevel, unitId, limit }) => {
      try {
        // Get units for the subject first
        const subjectUnits = await db
          .select()
          .from(units)
          .where(
            unitId
              ? and(eq(units.subjectId, subjectId), eq(units.id, unitId))
              : eq(units.subjectId, subjectId)
          )
          .orderBy(asc(units.order));

        if (subjectUnits.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  count: 0,
                  lessons: [],
                  message: "No units found for this subject",
                }),
              },
            ],
          };
        }

        // Get lessons for these units
        const unitIds = subjectUnits.map((u) => u.id);
        const allLessons = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            slug: lessons.slug,
            description: lessons.description,
            unitId: lessons.unitId,
            order: lessons.order,
            estimatedMinutes: lessons.estimatedMinutes,
            difficultyLevel: lessons.difficultyLevel,
          })
          .from(lessons)
          .where(eq(lessons.unitId, unitIds[0])) // TODO: Handle multiple units
          .orderBy(asc(lessons.order))
          .limit(limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: allLessons.length,
                lessons: allLessons,
                units: subjectUnits.map((u) => ({
                  id: u.id,
                  title: u.title,
                  order: u.order,
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

  // Get lesson content
  server.tool(
    "curriculum:get-lesson-content",
    "Get the full content of a specific lesson including activities",
    {
      lessonId: z.string().uuid().describe("The lesson ID to retrieve"),
    },
    async ({ lessonId }) => {
      try {
        const lesson = await db
          .select()
          .from(lessons)
          .where(eq(lessons.id, lessonId))
          .limit(1);

        if (lesson.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Lesson not found",
                }),
              },
            ],
          };
        }

        // Get activities for this lesson
        const lessonActivities = await db
          .select()
          .from(activities)
          .where(eq(activities.lessonId, lessonId))
          .orderBy(asc(activities.order));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                lesson: {
                  ...lesson[0],
                  activities: lessonActivities.map((a) => ({
                    id: a.id,
                    title: a.title,
                    type: a.type,
                    order: a.order,
                    maxPoints: a.maxPoints,
                    passingScore: a.passingScore,
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

  // Search curriculum
  server.tool(
    "curriculum:search",
    "Search across curriculum content by keyword",
    {
      query: z.string().min(2).describe("Search query"),
      type: z.enum(["all", "lessons", "activities"]).default("all").describe("Type of content to search"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum results to return"),
    },
    async ({ query, type, limit }) => {
      try {
        const results: Array<{
          type: string;
          id: string;
          title: string;
          description: string | null;
        }> = [];

        // Search lessons
        if (type === "all" || type === "lessons") {
          const lessonResults = await db
            .select({
              id: lessons.id,
              title: lessons.title,
              description: lessons.description,
            })
            .from(lessons)
            .where(
              ilike(lessons.title, `%${query}%`)
            )
            .limit(limit);

          results.push(
            ...lessonResults.map((l) => ({
              type: "lesson" as const,
              id: l.id,
              title: l.title,
              description: l.description,
            }))
          );
        }

        // Search activities
        if (type === "all" || type === "activities") {
          const activityResults = await db
            .select({
              id: activities.id,
              title: activities.title,
              instructions: activities.instructions,
            })
            .from(activities)
            .where(
              ilike(activities.title, `%${query}%`)
            )
            .limit(limit);

          results.push(
            ...activityResults.map((a) => ({
              type: "activity" as const,
              id: a.id,
              title: a.title,
              description: a.instructions,
            }))
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                query,
                count: results.length,
                results: results.slice(0, limit),
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
