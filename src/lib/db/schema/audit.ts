import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { organizations } from "./organizations";

/**
 * Admin Audit Log
 *
 * Tracks all administrative actions for security, compliance (COPPA/FERPA),
 * and debugging purposes. Every admin action should create an audit entry.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Who performed the action
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    actorRole: varchar("actor_role", { length: 50 }).notNull(), // Role at time of action
    actorEmail: varchar("actor_email", { length: 255 }), // Denormalized for historical tracking

    // Organization context (null for platform-level actions)
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),

    // What action was performed
    action: varchar("action", { length: 100 }).notNull(), // e.g., "user.create", "learner.delete", "consent.revoke"
    category: varchar("category", { length: 50 }).notNull(), // e.g., "user", "content", "settings", "data"

    // What resource was affected
    resourceType: varchar("resource_type", { length: 100 }).notNull(), // e.g., "user", "learner", "organization", "lesson"
    resourceId: uuid("resource_id"), // ID of the affected resource
    resourceName: varchar("resource_name", { length: 255 }), // Human-readable name for display

    // Details of the action
    description: text("description"), // Human-readable description
    metadata: jsonb("metadata").$type<{
      before?: Record<string, unknown>; // State before change
      after?: Record<string, unknown>; // State after change
      changes?: Record<string, { from: unknown; to: unknown }>; // Diff of changes
      reason?: string; // Optional reason for the action
      ipAddress?: string; // IP address of the actor
      userAgent?: string; // User agent string
      sessionId?: string; // Session ID if available
    }>(),

    // Result of the action
    status: varchar("status", { length: 20 })
      .notNull()
      .default("success"), // "success", "failure", "pending"
    errorMessage: text("error_message"), // Error details if status is "failure"

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_org_idx").on(table.organizationId),
    index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_category_idx").on(table.category),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
}));

// Action constants for type safety
export const AUDIT_ACTIONS = {
  // User management
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_ROLE_CHANGE: "user.role_change",
  USER_SUSPEND: "user.suspend",
  USER_ACTIVATE: "user.activate",

  // Learner management
  LEARNER_CREATE: "learner.create",
  LEARNER_UPDATE: "learner.update",
  LEARNER_DELETE: "learner.delete",
  LEARNER_ENROLL: "learner.enroll",
  LEARNER_UNENROLL: "learner.unenroll",

  // Organization management
  ORG_CREATE: "organization.create",
  ORG_UPDATE: "organization.update",
  ORG_DELETE: "organization.delete",
  ORG_SETTINGS_UPDATE: "organization.settings_update",

  // Content management
  SUBJECT_CREATE: "subject.create",
  SUBJECT_UPDATE: "subject.update",
  SUBJECT_DELETE: "subject.delete",
  UNIT_CREATE: "unit.create",
  UNIT_UPDATE: "unit.update",
  UNIT_DELETE: "unit.delete",
  LESSON_CREATE: "lesson.create",
  LESSON_UPDATE: "lesson.update",
  LESSON_DELETE: "lesson.delete",
  LESSON_PUBLISH: "lesson.publish",
  LESSON_UNPUBLISH: "lesson.unpublish",

  // Consent management (COPPA)
  CONSENT_GRANT: "consent.grant",
  CONSENT_REVOKE: "consent.revoke",
  CONSENT_VERIFY: "consent.verify",

  // Data access (FERPA)
  DATA_EXPORT: "data.export",
  DATA_VIEW_SENSITIVE: "data.view_sensitive",
  DATA_DELETE: "data.delete",

  // Settings
  SETTINGS_UPDATE: "settings.update",

  // Authentication events
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",
  AUTH_PASSWORD_RESET: "auth.password_reset",
  AUTH_MFA_ENABLE: "auth.mfa_enable",
  AUTH_MFA_DISABLE: "auth.mfa_disable",
} as const;

export const AUDIT_CATEGORIES = {
  USER: "user",
  LEARNER: "learner",
  ORGANIZATION: "organization",
  CONTENT: "content",
  CONSENT: "consent",
  DATA: "data",
  SETTINGS: "settings",
  AUTH: "auth",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
export type AuditCategory =
  (typeof AUDIT_CATEGORIES)[keyof typeof AUDIT_CATEGORIES];
