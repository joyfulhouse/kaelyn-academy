import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { learners } from "./users";
import { lessons, concepts } from "./curriculum";

// AI tutoring conversations
export const tutoringConversations = pgTable("tutoring_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Context
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),
  topic: varchar("topic", { length: 255 }),

  // Conversation state
  status: varchar("status", { length: 50 }).default("active"), // active, completed, archived

  // AI provider used
  provider: varchar("provider", { length: 50 }).notNull(), // claude, openai, gemini
  model: varchar("model", { length: 100 }),

  // Summary for context
  summary: text("summary"),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual messages in a conversation
export const tutoringMessages = pgTable("tutoring_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").notNull().references(() => tutoringConversations.id, { onDelete: "cascade" }),

  role: varchar("role", { length: 20 }).notNull(), // user, assistant, system
  content: text("content").notNull(),

  // Token usage tracking
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),

  // Metadata
  metadata: jsonb("metadata").$type<{
    processingTime?: number;
    model?: string;
    feedback?: "helpful" | "not_helpful" | null;
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Adaptive difficulty settings per learner
export const adaptiveDifficulty = pgTable("adaptive_difficulty", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Per-subject difficulty levels
  subjectDifficulties: jsonb("subject_difficulties").$type<Record<string, {
    currentLevel: number; // 1-5
    recentAccuracy: number; // 0-100
    adjustedAt: string; // ISO date
  }>>(),

  // Overall learning profile
  learningProfile: jsonb("learning_profile").$type<{
    pacePreference: "slow" | "normal" | "fast";
    explanationStyle: "detailed" | "concise" | "visual";
    challengeLevel: "easy" | "medium" | "hard";
    strengths: string[];
    areasForImprovement: string[];
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI-generated practice problems
export const generatedProblems = pgTable("generated_problems", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "set null" }),

  // Problem content
  problem: jsonb("problem").$type<{
    type: "multiple_choice" | "fill_blank" | "word_problem" | "calculation";
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    hints?: string[];
    difficulty: number; // 1-5
  }>().notNull(),

  // Generation metadata
  provider: varchar("provider", { length: 50 }).notNull(),
  prompt: text("prompt"),

  // Usage tracking
  wasUsed: integer("was_used").default(0),
  averageScore: integer("average_score"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI content recommendations
export const contentRecommendations = pgTable("content_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Recommendation
  recommendationType: varchar("recommendation_type", { length: 50 }).notNull(), // lesson, concept, practice, review
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }),

  reason: text("reason"), // Why this was recommended
  priority: integer("priority").default(0), // Higher = more important

  // Status
  status: varchar("status", { length: 50 }).default("pending"), // pending, viewed, completed, dismissed
  viewedAt: timestamp("viewed_at"),
  completedAt: timestamp("completed_at"),

  expiresAt: timestamp("expires_at"), // Recommendations can expire

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const tutoringConversationsRelations = relations(tutoringConversations, ({ one, many }) => ({
  learner: one(learners, {
    fields: [tutoringConversations.learnerId],
    references: [learners.id],
  }),
  lesson: one(lessons, {
    fields: [tutoringConversations.lessonId],
    references: [lessons.id],
  }),
  concept: one(concepts, {
    fields: [tutoringConversations.conceptId],
    references: [concepts.id],
  }),
  messages: many(tutoringMessages),
}));

export const tutoringMessagesRelations = relations(tutoringMessages, ({ one }) => ({
  conversation: one(tutoringConversations, {
    fields: [tutoringMessages.conversationId],
    references: [tutoringConversations.id],
  }),
}));

export const adaptiveDifficultyRelations = relations(adaptiveDifficulty, ({ one }) => ({
  learner: one(learners, {
    fields: [adaptiveDifficulty.learnerId],
    references: [learners.id],
  }),
}));

export const generatedProblemsRelations = relations(generatedProblems, ({ one }) => ({
  learner: one(learners, {
    fields: [generatedProblems.learnerId],
    references: [learners.id],
  }),
  concept: one(concepts, {
    fields: [generatedProblems.conceptId],
    references: [concepts.id],
  }),
}));

export const contentRecommendationsRelations = relations(contentRecommendations, ({ one }) => ({
  learner: one(learners, {
    fields: [contentRecommendations.learnerId],
    references: [learners.id],
  }),
  lesson: one(lessons, {
    fields: [contentRecommendations.lessonId],
    references: [lessons.id],
  }),
  concept: one(concepts, {
    fields: [contentRecommendations.conceptId],
    references: [concepts.id],
  }),
}));
