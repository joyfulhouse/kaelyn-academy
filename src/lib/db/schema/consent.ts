import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users, learners } from "./users";

/**
 * COPPA Parental Consent Records
 *
 * This table stores verifiable parental consent with proper audit trail.
 * COPPA requires "verifiable parental consent" (VPC) before collecting
 * personal information from children under 13.
 *
 * Verification Methods (FTC approved):
 * - email_plus: Email verification + knowledge-based question
 * - credit_card: Small credit card transaction
 * - signed_form: Physical signed consent form
 * - video_call: Video verification with ID
 * - government_id: Upload and verify government ID
 */
export const parentalConsentRecords = pgTable("parental_consent_records", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Parent who gave consent
  parentUserId: uuid("parent_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Child the consent is for
  learnerId: uuid("learner_id")
    .references(() => learners.id, { onDelete: "set null" }),

  // Verification method used
  verificationMethod: varchar("verification_method", { length: 50 }).notNull(),
  // email_plus | credit_card | signed_form | video_call | government_id

  // Status of consent
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  // pending | email_sent | verified | active | revoked | expired

  // Parent information (as provided)
  parentName: varchar("parent_name", { length: 255 }).notNull(),
  parentEmail: varchar("parent_email", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 50 }).notNull(),
  // parent | legal_guardian | foster_parent

  // Child information (as provided)
  childName: varchar("child_name", { length: 255 }).notNull(),
  childBirthdate: timestamp("child_birthdate").notNull(),

  // Verification data
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationCode: varchar("verification_code", { length: 10 }), // 6-digit code for email_plus
  verificationCodeExpires: timestamp("verification_code_expires"),
  verificationAttempts: jsonb("verification_attempts").$type<{
    timestamp: string;
    success: boolean;
    method: string;
    ipAddress?: string;
    userAgent?: string;
  }[]>().default([]),

  // Knowledge-based verification (for email_plus method)
  securityQuestion: varchar("security_question", { length: 255 }),
  securityAnswerHash: varchar("security_answer_hash", { length: 255 }),

  // Agreements consented to (specific items)
  agreements: jsonb("agreements").$type<{
    dataCollection: boolean;
    dataUse: boolean;
    communication: boolean;
    termsOfService: boolean;
    privacyPolicy: boolean;
    timestamp: string;
  }>().notNull(),

  // Electronic signature
  signatureText: varchar("signature_text", { length: 255 }).notNull(),
  signatureTimestamp: timestamp("signature_timestamp").notNull(),
  signatureIpAddress: varchar("signature_ip_address", { length: 45 }),
  signatureUserAgent: text("signature_user_agent"),

  // Consent validity
  consentedAt: timestamp("consented_at"),
  expiresAt: timestamp("expires_at"), // Optional: some implementations require renewal
  revokedAt: timestamp("revoked_at"),
  revocationReason: text("revocation_reason"),

  // Audit trail
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  parentUserIdIdx: index("consent_parent_user_id_idx").on(table.parentUserId),
  learnerIdIdx: index("consent_learner_id_idx").on(table.learnerId),
  statusIdx: index("consent_status_idx").on(table.status),
  verificationTokenIdx: index("consent_verification_token_idx").on(table.verificationToken),
}));

// Relations
export const parentalConsentRecordsRelations = relations(parentalConsentRecords, ({ one }) => ({
  parent: one(users, {
    fields: [parentalConsentRecords.parentUserId],
    references: [users.id],
  }),
  learner: one(learners, {
    fields: [parentalConsentRecords.learnerId],
    references: [learners.id],
  }),
}));

/**
 * Content Approval Requests
 *
 * This table stores content that requires parental approval before
 * a learner can access it. This is triggered when parental controls
 * have "requireApprovalForNew" enabled.
 *
 * Content Types:
 * - subject: Access to a new subject
 * - unit: Access to a specific unit
 * - lesson: Access to a specific lesson
 * - activity: Access to a specific activity
 * - feature: Access to a platform feature (e.g., AI tutor, messaging)
 * - external_link: Access to external content
 */
export const contentApprovalRequests = pgTable("content_approval_requests", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Child requesting access
  learnerId: uuid("learner_id")
    .notNull()
    .references(() => learners.id, { onDelete: "cascade" }),

  // Parent who needs to approve
  parentUserId: uuid("parent_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Content being requested
  contentType: varchar("content_type", { length: 50 }).notNull(),
  // subject | unit | lesson | activity | feature | external_link

  contentId: uuid("content_id"), // FK to the content table (subject/unit/lesson/activity)
  contentTitle: varchar("content_title", { length: 255 }).notNull(),
  contentDescription: text("content_description"),

  // Additional metadata about the content
  contentMetadata: jsonb("content_metadata").$type<{
    subjectName?: string;
    gradeLevel?: number;
    estimatedMinutes?: number;
    difficultyLevel?: number;
    externalUrl?: string;
    featureName?: string;
  }>(),

  // Approval status
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  // pending | approved | denied | expired

  // Reason for request (optional message from learner)
  requestReason: text("request_reason"),

  // Parent response
  responseReason: text("response_reason"), // Reason for denial (optional)
  respondedAt: timestamp("responded_at"),
  respondedBy: uuid("responded_by").references(() => users.id, { onDelete: "set null" }),

  // Expiration (optional - auto-expire after X days if not responded)
  expiresAt: timestamp("expires_at"),

  // Audit trail
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  learnerIdIdx: index("approval_learner_id_idx").on(table.learnerId),
  parentUserIdIdx: index("approval_parent_user_id_idx").on(table.parentUserId),
  statusIdx: index("approval_status_idx").on(table.status),
  contentTypeIdx: index("approval_content_type_idx").on(table.contentType),
  pendingApprovalIdx: index("approval_pending_idx").on(table.parentUserId, table.status),
}));

// Relations for content approval requests
export const contentApprovalRequestsRelations = relations(contentApprovalRequests, ({ one }) => ({
  learner: one(learners, {
    fields: [contentApprovalRequests.learnerId],
    references: [learners.id],
  }),
  parent: one(users, {
    fields: [contentApprovalRequests.parentUserId],
    references: [users.id],
    relationName: "parentApprovals",
  }),
  responder: one(users, {
    fields: [contentApprovalRequests.respondedBy],
    references: [users.id],
    relationName: "responderApprovals",
  }),
}));

// Type exports
export type ParentalConsentRecord = typeof parentalConsentRecords.$inferSelect;
export type NewParentalConsentRecord = typeof parentalConsentRecords.$inferInsert;
export type ContentApprovalRequest = typeof contentApprovalRequests.$inferSelect;
export type NewContentApprovalRequest = typeof contentApprovalRequests.$inferInsert;
