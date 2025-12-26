import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { learners } from "./users";

// AI Agent definitions (reusable agent configurations)
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // tutor, adaptive, practice_gen, assessment
  description: text("description"),

  // Ax signature definition
  signature: text("signature").notNull(),
  systemPrompt: text("system_prompt"),

  // Provider configuration
  provider: varchar("provider", { length: 50 }).notNull().default("anthropic"),
  modelTier: varchar("model_tier", { length: 20 }).notNull().default("balanced"),

  // Agent-specific config
  config: jsonb("config").$type<{
    temperature?: number;
    maxOutputTokens?: number;
    tools?: string[];
    examples?: Array<{ input: Record<string, unknown>; output: Record<string, unknown> }>;
  }>(),

  // Versioning for A/B testing
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Agent execution history (audit trail)
export const agentExecutions = pgTable("agent_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").references(() => learners.id, { onDelete: "set null" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Execution details
  inputs: jsonb("inputs").$type<Record<string, unknown>>().notNull(),
  outputs: jsonb("outputs").$type<Record<string, unknown>>(),

  // Performance metrics
  durationMs: integer("duration_ms"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  cost: numeric("cost", { precision: 10, scale: 6 }),

  // Status
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),

  // Context
  metadata: jsonb("metadata").$type<{
    userAgent?: string;
    sessionId?: string;
    traceId?: string;
    toolsCalled?: string[];
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prompt signatures (versioned signatures for optimization)
export const promptSignatures = pgTable("prompt_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),

  signature: text("signature").notNull(),
  systemPrompt: text("system_prompt"),

  // Few-shot examples
  examples: jsonb("examples").$type<Array<{
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }>>(),

  // Validation constraints
  constraints: jsonb("constraints").$type<{
    maxOutputLength?: number;
    requiredFields?: string[];
    forbiddenPatterns?: string[];
  }>(),

  version: integer("version").notNull().default(1),
  isOptimized: boolean("is_optimized").notNull().default(false),

  // Metrics from optimization/evaluation
  optimizationMetrics: jsonb("optimization_metrics").$type<{
    accuracy?: number;
    latency?: number;
    cost?: number;
    tokenEfficiency?: number;
  }>(),

  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Optimization runs (track prompt optimization experiments)
export const optimizationRuns = pgTable("optimization_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  signatureId: uuid("signature_id").references(() => promptSignatures.id, { onDelete: "set null" }),

  algorithm: varchar("algorithm", { length: 50 }).notNull(), // mipro, ace, gepa, manual
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, running, completed, failed

  // Metrics comparison
  baselineMetrics: jsonb("baseline_metrics").$type<{
    accuracy?: number;
    latency?: number;
    cost?: number;
  }>(),
  optimizedMetrics: jsonb("optimized_metrics").$type<{
    accuracy?: number;
    latency?: number;
    cost?: number;
  }>(),

  // Training data
  trainingDataset: jsonb("training_dataset").$type<Array<{
    input: Record<string, unknown>;
    expectedOutput: Record<string, unknown>;
  }>>(),

  iterations: integer("iterations").default(0),

  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Agent tools (functions available to ReAct agents)
export const agentTools = pgTable("agent_tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),

  // JSON Schema for parameters
  functionSchema: jsonb("function_schema").$type<{
    type: "object";
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  }>().notNull(),

  // Function reference (e.g., "tools/curriculum.fetchConcepts")
  implementation: varchar("implementation", { length: 255 }).notNull(),

  isEnabled: boolean("is_enabled").notNull().default(true),
  isSystemTool: boolean("is_system_tool").notNull().default(false), // Platform-wide tools

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Multi-agent conversations (for agent collaboration)
export const agentConversations = pgTable("agent_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").references(() => learners.id, { onDelete: "set null" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  goal: text("goal").notNull(),
  participantAgents: jsonb("participant_agents").$type<string[]>().notNull(), // agent IDs

  status: varchar("status", { length: 50 }).notNull().default("active"), // active, completed, failed
  finalOutput: jsonb("final_output").$type<Record<string, unknown>>(),

  // Conversation steps
  steps: jsonb("steps").$type<Array<{
    agentId: string;
    action: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    timestamp: string;
  }>>(),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const agentsRelations = relations(agents, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [agents.organizationId],
    references: [organizations.id],
  }),
  executions: many(agentExecutions),
  signatures: many(promptSignatures),
  tools: many(agentTools),
  optimizationRuns: many(optimizationRuns),
}));

export const agentExecutionsRelations = relations(agentExecutions, ({ one }) => ({
  agent: one(agents, {
    fields: [agentExecutions.agentId],
    references: [agents.id],
  }),
  learner: one(learners, {
    fields: [agentExecutions.learnerId],
    references: [learners.id],
  }),
  organization: one(organizations, {
    fields: [agentExecutions.organizationId],
    references: [organizations.id],
  }),
}));

export const promptSignaturesRelations = relations(promptSignatures, ({ one }) => ({
  agent: one(agents, {
    fields: [promptSignatures.agentId],
    references: [agents.id],
  }),
}));

export const optimizationRunsRelations = relations(optimizationRuns, ({ one }) => ({
  agent: one(agents, {
    fields: [optimizationRuns.agentId],
    references: [agents.id],
  }),
  signature: one(promptSignatures, {
    fields: [optimizationRuns.signatureId],
    references: [promptSignatures.id],
  }),
}));

export const agentToolsRelations = relations(agentTools, ({ one }) => ({
  agent: one(agents, {
    fields: [agentTools.agentId],
    references: [agents.id],
  }),
}));

export const agentConversationsRelations = relations(agentConversations, ({ one }) => ({
  learner: one(learners, {
    fields: [agentConversations.learnerId],
    references: [learners.id],
  }),
  organization: one(organizations, {
    fields: [agentConversations.organizationId],
    references: [organizations.id],
  }),
}));
