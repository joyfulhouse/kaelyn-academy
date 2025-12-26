import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents, agentExecutions } from "@/lib/db/schema/agents";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/auth/rbac";
import { ValidationError, validateBody } from "@/lib/validation";
import { z } from "zod";

// Query schema for GET
const agentQuerySchema = z.object({
  type: z.enum(["tutor", "adaptive", "practice_gen", "assessment"]).optional(),
  active: z.enum(["true", "false"]).optional(),
});

// GET /api/agents - List all agents with execution stats
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = agentQuerySchema.parse(params);

    // Build query conditions
    const conditions = [];
    if (query.type) {
      conditions.push(eq(agents.type, query.type));
    }
    if (query.active !== undefined) {
      conditions.push(eq(agents.isActive, query.active === "true"));
    }

    // Get agents with execution counts
    const agentList = await db
      .select({
        id: agents.id,
        name: agents.name,
        slug: agents.slug,
        type: agents.type,
        signature: agents.signature,
        provider: agents.provider,
        modelTier: agents.modelTier,
        version: agents.version,
        isActive: agents.isActive,
        createdAt: agents.createdAt,
        executionCount: sql<number>`(
          SELECT COUNT(*) FROM ${agentExecutions}
          WHERE ${agentExecutions.agentId} = ${agents.id}
        )`.as("execution_count"),
        avgInputTokens: sql<number>`(
          SELECT AVG(${agentExecutions.inputTokens}) FROM ${agentExecutions}
          WHERE ${agentExecutions.agentId} = ${agents.id}
        )`.as("avg_input_tokens"),
        avgOutputTokens: sql<number>`(
          SELECT AVG(${agentExecutions.outputTokens}) FROM ${agentExecutions}
          WHERE ${agentExecutions.agentId} = ${agents.id}
        )`.as("avg_output_tokens"),
      })
      .from(agents)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(agents.createdAt));

    return NextResponse.json({ agents: agentList });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError("Validation failed", error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }))).toResponse();
    }
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

// Schema for creating an agent
const createAgentSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  type: z.enum(["tutor", "adaptive", "practice_gen", "assessment"]),
  signature: z.string().min(1).max(10000),
  systemPrompt: z.string().max(50000).optional(),
  provider: z.enum(["anthropic", "openai", "google"]).default("anthropic"),
  modelTier: z.enum(["fast", "balanced", "quality"]).default("balanced"),
  config: z.record(z.string(), z.unknown()).optional(),
});

// POST /api/agents - Create a new agent (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin permission
  const userRole = (session.user as { role?: Role }).role ?? "learner";
  if (!hasPermission(userRole, "manage:agents")) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await validateBody(request, createAgentSchema);
    const { name, type, signature, systemPrompt, provider, modelTier, config } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const [newAgent] = await db
      .insert(agents)
      .values({
        name,
        slug,
        type,
        signature,
        systemPrompt,
        provider: provider || "anthropic",
        modelTier: modelTier || "balanced",
        config,
      })
      .returning();

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
