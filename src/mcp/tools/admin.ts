/**
 * Admin Management Tools for MCP Server
 *
 * Provides tools for AI agents to support administrative functions.
 *
 * @module mcp/tools/admin
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema/organizations";
import { users, learners } from "@/lib/db/schema/users";
import { eq, and, desc, sql, gte } from "drizzle-orm";

/**
 * Register admin management tools with the MCP server
 */
export function registerAdminTools(server: McpServer): void {
  // List organizations
  server.tool(
    "admin:list-organizations",
    "List all organizations in the platform",
    {
      status: z.enum(["all", "active", "suspended"]).default("active").describe("Filter by status"),
      limit: z.number().min(1).max(100).default(20).describe("Maximum results"),
    },
    async ({ status, limit }) => {
      try {
        // Organizations don't have a status column in this schema
        // Filter by deletedAt for active/suspended filtering
        let orgs;
        if (status === "suspended") {
          orgs = await db
            .select()
            .from(organizations)
            .where(sql`${organizations.deletedAt} IS NOT NULL`)
            .orderBy(desc(organizations.createdAt))
            .limit(limit);
        } else if (status === "active") {
          orgs = await db
            .select()
            .from(organizations)
            .where(sql`${organizations.deletedAt} IS NULL`)
            .orderBy(desc(organizations.createdAt))
            .limit(limit);
        } else {
          orgs = await db
            .select()
            .from(organizations)
            .orderBy(desc(organizations.createdAt))
            .limit(limit);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: orgs.length,
                organizations: orgs.map((o) => ({
                  id: o.id,
                  name: o.name,
                  slug: o.slug,
                  type: o.type,
                  subscriptionTier: o.subscriptionTier,
                  subscriptionExpiresAt: o.subscriptionExpiresAt,
                  createdAt: o.createdAt,
                  isActive: o.deletedAt === null,
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

  // Get organization details
  server.tool(
    "admin:get-organization",
    "Get detailed information about an organization",
    {
      organizationId: z.string().uuid().describe("The organization ID"),
    },
    async ({ organizationId }) => {
      try {
        const org = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .limit(1);

        if (org.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Organization not found",
                }),
              },
            ],
          };
        }

        // Get user counts
        const userCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.organizationId, organizationId));

        const learnerCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(learners)
          .where(eq(learners.organizationId, organizationId));

        // Teachers are users with role='teacher'
        const teacherCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(
            and(
              eq(users.organizationId, organizationId),
              eq(users.role, "teacher")
            )
          );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                organization: {
                  ...org[0],
                  stats: {
                    totalUsers: userCount[0]?.count || 0,
                    learners: learnerCount[0]?.count || 0,
                    teachers: teacherCount[0]?.count || 0,
                  },
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

  // Get platform statistics
  server.tool(
    "admin:get-platform-stats",
    "Get overall platform statistics",
    {},
    async () => {
      try {
        const orgCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(organizations);

        const userCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(users);

        const learnerCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(learners);

        // Teachers are users with role='teacher'
        const teacherCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(users)
          .where(eq(users.role, "teacher"));

        // Note: users table doesn't have lastLoginAt - would need to track via sessions
        // For now, return learner activity as a proxy for active users
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const activeLearners = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(learners)
          .where(gte(learners.lastActiveAt, weekAgo));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                stats: {
                  organizations: orgCount[0]?.count || 0,
                  users: userCount[0]?.count || 0,
                  learners: learnerCount[0]?.count || 0,
                  teachers: teacherCount[0]?.count || 0,
                  activeLearnersLast7Days: activeLearners[0]?.count || 0,
                },
                generatedAt: new Date().toISOString(),
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

  // Search users
  server.tool(
    "admin:search-users",
    "Search for users across the platform",
    {
      query: z.string().min(2).describe("Search query (name or email)"),
      role: z.enum(["all", "admin", "teacher", "parent", "learner"]).default("all").describe("Filter by role"),
      organizationId: z.string().uuid().optional().describe("Filter by organization"),
      limit: z.number().min(1).max(50).default(20).describe("Maximum results"),
    },
    async ({ query, role, organizationId, limit }) => {
      try {
        // Build search condition
        const searchPattern = `%${query}%`;

        let baseQuery = db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            organizationId: users.organizationId,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(
            sql`(${users.name} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`
          );

        if (role !== "all") {
          baseQuery = db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              organizationId: users.organizationId,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(
              and(
                sql`(${users.name} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`,
                eq(users.role, role)
              )
            );
        }

        if (organizationId) {
          baseQuery = db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
              organizationId: users.organizationId,
              createdAt: users.createdAt,
            })
            .from(users)
            .where(
              and(
                sql`(${users.name} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`,
                eq(users.organizationId, organizationId)
              )
            );
        }

        const results = await baseQuery.limit(limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                query,
                count: results.length,
                users: results.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  organizationId: u.organizationId,
                  createdAt: u.createdAt,
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

  // Get system health
  server.tool(
    "admin:get-system-health",
    "Check system health and connectivity",
    {},
    async () => {
      try {
        // Test database connectivity
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - dbStart;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                health: {
                  status: "healthy",
                  database: {
                    connected: true,
                    latencyMs: dbLatency,
                  },
                  timestamp: new Date().toISOString(),
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
                health: {
                  status: "unhealthy",
                  database: {
                    connected: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                  },
                  timestamp: new Date().toISOString(),
                },
              }),
            },
          ],
        };
      }
    }
  );

  // Update organization active status
  server.tool(
    "admin:update-organization-status",
    "Activate or suspend an organization (requires admin permissions)",
    {
      organizationId: z.string().uuid().describe("The organization ID"),
      active: z.boolean().describe("Whether the organization should be active"),
      reason: z.string().optional().describe("Reason for status change"),
    },
    async ({ organizationId, active, reason }) => {
      try {
        const org = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .limit(1);

        if (org.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Organization not found",
                }),
              },
            ],
          };
        }

        const wasActive = org[0].deletedAt === null;

        await db
          .update(organizations)
          .set({
            deletedAt: active ? null : new Date(),
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, organizationId));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                organizationId,
                previouslyActive: wasActive,
                nowActive: active,
                reason: reason || null,
                updatedAt: new Date().toISOString(),
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
