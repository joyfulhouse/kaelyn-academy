import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Submitter info
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  organization: varchar("organization", { length: 255 }),
  role: varchar("role", { length: 100 }), // parent, teacher, administrator, other

  // Inquiry
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  inquiryType: varchar("inquiry_type", { length: 50 }).notNull().default("general"), // general, schools, demo, support, partnership, press

  // Metadata
  metadata: jsonb("metadata").$type<{
    userAgent?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    ipAddress?: string;
  }>(),

  // Follow-up
  status: varchar("status", { length: 20 }).notNull().default("new"), // new, contacted, in_progress, resolved, spam
  notes: text("notes"),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),

  // Response tracking
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),

  // Subscription status
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, unsubscribed, bounced
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),

  // Preferences
  interests: varchar("interests", { length: 50 }).array(), // curriculum, product_updates, tips, events

  // Source
  source: varchar("source", { length: 100 }), // footer, blog, schools_page, etc.

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Demo requests (schools page)
export const demoRequests = pgTable("demo_requests", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Contact info
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),

  // Organization info
  schoolName: varchar("school_name", { length: 255 }).notNull(),
  schoolDistrict: varchar("school_district", { length: 255 }),
  schoolType: varchar("school_type", { length: 50 }), // public, private, charter, homeschool_coop
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).default("United States"),

  // Role and needs
  jobTitle: varchar("job_title", { length: 100 }),
  estimatedStudents: varchar("estimated_students", { length: 50 }), // 1-50, 51-200, 201-500, 500+
  gradeRange: varchar("grade_range", { length: 50 }), // K-5, 6-8, 9-12, K-12
  subjects: varchar("subjects", { length: 50 }).array(), // interested subjects
  timeline: varchar("timeline", { length: 50 }), // immediate, this_semester, next_school_year, researching
  message: text("message"),

  // Follow-up
  status: varchar("status", { length: 20 }).notNull().default("new"), // new, contacted, demo_scheduled, demo_completed, proposal_sent, won, lost
  notes: text("notes"),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),

  // Scheduling
  preferredDemoDate: timestamp("preferred_demo_date"),
  scheduledDemoDate: timestamp("scheduled_demo_date"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications (system-wide)
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Content
  type: varchar("type", { length: 50 }).notNull(), // achievement, assignment_due, progress_report, system, announcement
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: text("link"), // Optional link to navigate to

  // Metadata
  metadata: jsonb("metadata").$type<{
    achievementId?: string;
    assignmentId?: string;
    learnerId?: string;
    icon?: string;
  }>(),

  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),

  // Scheduling
  scheduledFor: timestamp("scheduled_for"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const contactSubmissionsRelations = relations(contactSubmissions, ({ one }) => ({
  assignee: one(users, {
    fields: [contactSubmissions.assignedTo],
    references: [users.id],
  }),
}));

export const demoRequestsRelations = relations(demoRequests, ({ one }) => ({
  assignee: one(users, {
    fields: [demoRequests.assignedTo],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
