/**
 * Messaging Schema
 * Database tables for parent-teacher communication
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { users } from "./users";
import { learners } from "./users";

/**
 * Conversations - Thread containers for messages between participants
 * Each conversation is scoped to an organization and can involve parent(s) and teacher(s)
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Multi-tenant isolation
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Subject line for the thread
    subject: varchar("subject", { length: 255 }).notNull(),

    // Optional learner context (who the conversation is about)
    learnerId: uuid("learner_id").references(() => learners.id, { onDelete: "set null" }),

    // Conversation type
    type: varchar("type", { length: 50 }).notNull().default("general"),
    // Types: general, progress_report, behavior, scheduling, assignment, other

    // Status
    status: varchar("status", { length: 50 }).notNull().default("open"),
    // Statuses: open, closed, archived

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
    lastMessageAt: timestamp("last_message_at"),
  },
  (table) => [
    index("conversations_org_idx").on(table.organizationId),
    index("conversations_learner_idx").on(table.learnerId),
    index("conversations_status_idx").on(table.status),
    index("conversations_last_message_idx").on(table.lastMessageAt),
  ]
);

/**
 * Conversation Participants - Who is involved in each conversation
 */
export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Role in this conversation
    role: varchar("role", { length: 50 }).notNull(),
    // Roles: parent, teacher, admin

    // Has left the conversation
    leftAt: timestamp("left_at"),

    // Last read tracking
    lastReadAt: timestamp("last_read_at"),

    // Notification preferences for this conversation
    notificationsEnabled: boolean("notifications_enabled").default(true),

    // Timestamps
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("participants_conversation_idx").on(table.conversationId),
    index("participants_user_idx").on(table.userId),
  ]
);

/**
 * Messages - Individual messages within conversations
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),

    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Message content
    content: text("content").notNull(),

    // Message type
    type: varchar("type", { length: 50 }).notNull().default("text"),
    // Types: text, system, attachment

    // For system messages (e.g., "Teacher joined the conversation")
    systemEventType: varchar("system_event_type", { length: 50 }),

    // Edit tracking
    isEdited: boolean("is_edited").default(false),
    editedAt: timestamp("edited_at"),

    // Soft delete
    deletedAt: timestamp("deleted_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_sender_idx").on(table.senderId),
    index("messages_created_idx").on(table.createdAt),
  ]
);

/**
 * Message Attachments - Files attached to messages
 */
export const messageAttachments = pgTable(
  "message_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),

    // File info
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: varchar("file_size", { length: 50 }).notNull(), // Store as string for flexibility

    // Storage URL (could be S3, Cloudflare R2, etc.)
    storageUrl: text("storage_url").notNull(),

    // Optional thumbnail for images
    thumbnailUrl: text("thumbnail_url"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("attachments_message_idx").on(table.messageId)]
);

/**
 * Read Receipts - Track who has read which messages
 */
export const readReceipts = pgTable(
  "read_receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    readAt: timestamp("read_at").defaultNow().notNull(),
  },
  (table) => [
    index("receipts_message_idx").on(table.messageId),
    index("receipts_user_idx").on(table.userId),
  ]
);

// Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [conversations.organizationId],
    references: [organizations.id],
  }),
  learner: one(learners, {
    fields: [conversations.learnerId],
    references: [learners.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  attachments: many(messageAttachments),
  readReceipts: many(readReceipts),
}));

export const messageAttachmentsRelations = relations(messageAttachments, ({ one }) => ({
  message: one(messages, {
    fields: [messageAttachments.messageId],
    references: [messages.id],
  }),
}));

export const readReceiptsRelations = relations(readReceipts, ({ one }) => ({
  message: one(messages, {
    fields: [readReceipts.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [readReceipts.userId],
    references: [users.id],
  }),
}));
