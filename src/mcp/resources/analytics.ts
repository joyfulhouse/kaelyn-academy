/**
 * Analytics Resources for MCP Server
 *
 * Provides resource URIs for accessing analytics data.
 *
 * @module mcp/resources/analytics
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { activityAttempts } from "@/lib/db/schema/progress";
import { gte, sql, and } from "drizzle-orm";

/**
 * Register analytics resources with the MCP server
 */
export function registerAnalyticsResources(server: McpServer): void {
  // Daily activity resource
  server.resource(
    "analytics-daily",
    "analytics://daily",
    async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayActivity = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(activityAttempts)
          .where(gte(activityAttempts.startedAt, today));

        const todayCompleted = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(activityAttempts)
          .where(
            and(
              gte(activityAttempts.startedAt, today),
              sql`${activityAttempts.completedAt} IS NOT NULL`
            )
          );

        return {
          contents: [
            {
              uri: "analytics://daily",
              mimeType: "application/json",
              text: JSON.stringify({
                success: true,
                date: today.toISOString().split("T")[0],
                analytics: {
                  activitiesStarted: todayActivity[0]?.count || 0,
                  activitiesCompleted: todayCompleted[0]?.count || 0,
                },
              }),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "analytics://daily",
              mimeType: "application/json",
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
