/**
 * Student Resources for MCP Server
 *
 * Provides resource URIs for accessing student data.
 * Note: Most student data access is via tools to ensure proper authorization.
 *
 * @module mcp/resources/students
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register student resources with the MCP server
 *
 * Student data is primarily accessed through tools (progress:get-summary, etc.)
 * to ensure proper authorization checks. This module provides minimal static resources.
 */
export function registerStudentResources(server: McpServer): void {
  // Student resources info
  server.resource(
    "students-info",
    "students://info",
    async () => {
      return {
        contents: [
          {
            uri: "students://info",
            mimeType: "application/json",
            text: JSON.stringify({
              success: true,
              message: "Student data access requires authentication. Use tools like progress:get-summary, progress:get-mastery-levels, and progress:get-recent-activity.",
              availableTools: [
                "progress:get-summary",
                "progress:get-mastery-levels",
                "progress:get-recent-activity",
                "progress:get-learning-path",
                "parent:list-children",
                "parent:get-child-activity",
              ],
            }),
          },
        ],
      };
    }
  );
}
