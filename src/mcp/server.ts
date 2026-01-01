/**
 * Kaelyn's Academy MCP Server
 *
 * Model Context Protocol server enabling AI agents to interact with the educational platform.
 * Provides tools for authentication, curriculum browsing, progress tracking, and assessment.
 *
 * @module mcp/server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool handlers
import { registerAuthTools } from "./tools/auth";
import { registerCurriculumTools } from "./tools/curriculum";
import { registerProgressTools } from "./tools/progress";
import { registerAssessmentTools } from "./tools/assessment";
import { registerClassroomTools } from "./tools/classroom";
import { registerParentTools } from "./tools/parent";
import { registerAdminTools } from "./tools/admin";

// Import resource providers
import { registerLessonResources } from "./resources/lessons";
import { registerStudentResources } from "./resources/students";
import { registerAnalyticsResources } from "./resources/analytics";

// Import prompt templates
import { registerTutoringPrompts } from "./prompts/tutoring";
import { registerAssessmentPrompts } from "./prompts/assessment";

/**
 * Create and configure the MCP server
 */
export async function createMcpServer(): Promise<McpServer> {
  const server = new McpServer({
    name: "kaelyns-academy",
    version: "1.0.0",
  });

  // Register all tool categories
  registerAuthTools(server);
  registerCurriculumTools(server);
  registerProgressTools(server);
  registerAssessmentTools(server);
  registerClassroomTools(server);
  registerParentTools(server);
  registerAdminTools(server);

  // Register resource providers
  registerLessonResources(server);
  registerStudentResources(server);
  registerAnalyticsResources(server);

  // Register prompt templates
  registerTutoringPrompts(server);
  registerAssessmentPrompts(server);

  return server;
}

/**
 * Start the MCP server with stdio transport
 */
async function main(): Promise<void> {
  const server = await createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Kaelyn's Academy MCP Server started");
}

// Run server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { McpServer };
