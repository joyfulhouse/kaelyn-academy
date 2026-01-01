/**
 * Classroom Management Tools for MCP Server
 *
 * Provides tools for AI agents to manage classrooms and students.
 *
 * @module mcp/tools/classroom
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db";
import { classes, classEnrollments, assignments } from "@/lib/db/schema/classroom";
import { learners } from "@/lib/db/schema/users";
import { eq, and, desc, asc, sql } from "drizzle-orm";

/**
 * Register classroom management tools with the MCP server
 */
export function registerClassroomTools(server: McpServer): void {
  // List classes for a teacher
  server.tool(
    "classroom:list-classes",
    "List all classes for a teacher",
    {
      teacherId: z.string().uuid().describe("The teacher's user ID"),
      includeArchived: z.boolean().default(false).describe("Include archived classes"),
    },
    async ({ teacherId, includeArchived }) => {
      try {
        // Note: The classes table uses isActive instead of isArchived
        const teacherClasses = await db
          .select()
          .from(classes)
          .where(
            includeArchived
              ? eq(classes.teacherId, teacherId)
              : and(eq(classes.teacherId, teacherId), eq(classes.isActive, true))
          )
          .orderBy(asc(classes.name));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: teacherClasses.length,
                classes: teacherClasses.map((c) => ({
                  id: c.id,
                  name: c.name,
                  description: c.description,
                  gradeLevel: c.gradeLevel,
                  academicYear: c.academicYear,
                  subjectIds: c.subjectIds,
                  isActive: c.isActive,
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

  // Get class details with enrollment
  server.tool(
    "classroom:get-class-details",
    "Get detailed information about a class including enrolled students",
    {
      classId: z.string().uuid().describe("The class ID"),
    },
    async ({ classId }) => {
      try {
        const classInfo = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);

        if (classInfo.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Class not found",
                }),
              },
            ],
          };
        }

        // Get enrolled students
        const enrollments = await db
          .select({
            id: classEnrollments.id,
            learnerId: classEnrollments.learnerId,
            enrolledAt: classEnrollments.enrolledAt,
            status: classEnrollments.status,
            learnerName: learners.name,
            gradeLevel: learners.gradeLevel,
          })
          .from(classEnrollments)
          .leftJoin(learners, eq(classEnrollments.learnerId, learners.id))
          .where(eq(classEnrollments.classId, classId))
          .orderBy(asc(learners.name));

        // Get assignment count
        const assignmentCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(assignments)
          .where(eq(assignments.classId, classId));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                class: {
                  ...classInfo[0],
                  enrollmentCount: enrollments.length,
                  assignmentCount: assignmentCount[0]?.count || 0,
                  students: enrollments.map((e) => ({
                    enrollmentId: e.id,
                    learnerId: e.learnerId,
                    name: e.learnerName,
                    gradeLevel: e.gradeLevel,
                    enrolledAt: e.enrolledAt,
                    status: e.status,
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

  // Get class performance summary
  server.tool(
    "classroom:get-performance-summary",
    "Get aggregate performance metrics for a class",
    {
      classId: z.string().uuid().describe("The class ID"),
    },
    async ({ classId }) => {
      try {
        // Get class info
        const classInfo = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);

        if (classInfo.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Class not found",
                }),
              },
            ],
          };
        }

        // Get enrollment count
        const enrollmentCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(classEnrollments)
          .where(
            and(
              eq(classEnrollments.classId, classId),
              eq(classEnrollments.status, "active")
            )
          );

        // Performance data would require joining with progress tables
        // This is a simplified version
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                classId,
                className: classInfo[0].name,
                summary: {
                  totalStudents: enrollmentCount[0]?.count || 0,
                  averageMastery: 0, // Would calculate from progress data
                  completionRate: 0, // Would calculate from assignment submissions
                  activeThisWeek: 0, // Would calculate from activity data
                },
                message: "Detailed analytics requires progress data integration",
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

  // Enroll student in class
  server.tool(
    "classroom:enroll-student",
    "Enroll a student in a class by class ID",
    {
      classId: z.string().uuid().describe("The class ID"),
      learnerId: z.string().uuid().describe("The learner's ID"),
    },
    async ({ classId, learnerId }) => {
      try {
        // Find class by ID
        const classInfo = await db
          .select()
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1);

        if (classInfo.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Class not found",
                }),
              },
            ],
          };
        }

        // Check if already enrolled
        const existing = await db
          .select()
          .from(classEnrollments)
          .where(
            and(
              eq(classEnrollments.classId, classId),
              eq(classEnrollments.learnerId, learnerId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Student is already enrolled in this class",
                  enrollment: existing[0],
                }),
              },
            ],
          };
        }

        // Create enrollment
        const enrollment = await db
          .insert(classEnrollments)
          .values({
            classId,
            learnerId,
            status: "active",
          })
          .returning();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                enrollment: {
                  id: enrollment[0].id,
                  classId,
                  className: classInfo[0].name,
                  learnerId,
                  enrolledAt: enrollment[0].enrolledAt,
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

  // Get assignments for a class
  server.tool(
    "classroom:list-assignments",
    "List assignments for a class",
    {
      classId: z.string().uuid().describe("The class ID"),
      status: z.enum(["all", "active", "past_due", "completed"]).default("all").describe("Filter by status"),
    },
    async ({ classId, status }) => {
      try {
        const classAssignments = await db
          .select()
          .from(assignments)
          .where(eq(assignments.classId, classId))
          .orderBy(desc(assignments.dueDate));

        const now = new Date();
        const filtered = status === "all"
          ? classAssignments
          : classAssignments.filter((a) => {
              if (status === "active") return a.dueDate && new Date(a.dueDate) > now;
              if (status === "past_due") return a.dueDate && new Date(a.dueDate) <= now;
              return true;
            });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: filtered.length,
                assignments: filtered.map((a) => ({
                  id: a.id,
                  title: a.title,
                  description: a.description,
                  dueDate: a.dueDate,
                  points: a.totalPoints,
                  lessonIds: a.lessonIds,
                  activityIds: a.activityIds,
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
}
