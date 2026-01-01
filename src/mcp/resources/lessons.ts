/**
 * Lesson Resources for MCP Server
 *
 * Provides resource URIs for accessing lesson content.
 *
 * @module mcp/resources/lessons
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import { subjects } from "@/lib/db/schema/curriculum";
import { asc } from "drizzle-orm";

/**
 * Register lesson resources with the MCP server
 */
export function registerLessonResources(server: McpServer): void {
  // List available lesson resources
  server.resource(
    "lessons-list",
    "lessons://list",
    async () => {
      try {
        const allSubjects = await db
          .select({
            id: subjects.id,
            name: subjects.name,
            slug: subjects.slug,
          })
          .from(subjects)
          .orderBy(asc(subjects.order));

        const resources = allSubjects.map((s) => ({
          uri: `lessons://subject/${s.slug}`,
          name: s.name,
          description: `Lessons for ${s.name}`,
          mimeType: "application/json",
        }));

        return {
          contents: [
            {
              uri: "lessons://list",
              mimeType: "application/json",
              text: JSON.stringify({
                success: true,
                count: resources.length,
                resources,
              }),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "lessons://list",
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
