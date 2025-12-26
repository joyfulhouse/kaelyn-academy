import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";

// Auth.js required tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),

  // Organization membership
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  role: varchar("role", { length: 50 }).notNull().default("parent"), // parent, teacher, school_admin, platform_admin

  // COPPA compliance
  isAdult: boolean("is_adult").default(true),
  dateOfBirth: timestamp("date_of_birth"),
  parentalConsentGiven: boolean("parental_consent_given").default(false),
  parentalConsentDate: timestamp("parental_consent_date"),

  // Preferences
  preferences: jsonb("preferences").$type<{
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      achievements?: boolean;
    };
    accessibility?: {
      highContrast?: boolean;
      largeText?: boolean;
      reducedMotion?: boolean;
    };
  }>(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// Learner profiles (children)
export const learners = pgTable("learners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Parent user
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Profile
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  dateOfBirth: timestamp("date_of_birth"),
  gradeLevel: integer("grade_level").notNull(), // 0 = K, 1-12

  // Learning preferences
  preferences: jsonb("preferences").$type<{
    favoriteSubjects?: string[];
    learningStyle?: "visual" | "auditory" | "kinesthetic";
    readingLevel?: string;
    mathLevel?: string;
  }>(),

  // Parental controls
  parentalControls: jsonb("parental_controls").$type<{
    screenTimeLimit?: number; // minutes per day
    allowedSubjects?: string[];
    blockedContent?: string[];
    requireParentApproval?: boolean;
  }>(),

  // Status
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  learners: many(learners),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const learnersRelations = relations(learners, ({ one }) => ({
  user: one(users, {
    fields: [learners.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [learners.organizationId],
    references: [organizations.id],
  }),
}));
