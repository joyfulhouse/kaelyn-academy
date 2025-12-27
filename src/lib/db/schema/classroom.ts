import { pgTable, uuid, varchar, text, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { users, learners } from "./users";

// Classes (teacher-managed groups of students)
export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id),

  // Details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  gradeLevel: integer("grade_level").notNull(),
  academicYear: varchar("academic_year", { length: 20 }), // "2024-2025"

  // Settings
  subjectIds: uuid("subject_ids").array(), // Subjects taught in this class

  // Status
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Class enrollments (student-class relationship)
export const classEnrollments = pgTable("class_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),

  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, completed, withdrawn
});

// Assignments (teacher-created tasks)
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id),

  // Content
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),

  // Linked curriculum
  lessonIds: uuid("lesson_ids").array(),
  activityIds: uuid("activity_ids").array(),

  // Scheduling
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),

  // Scoring
  totalPoints: integer("total_points").default(100),
  passingScore: integer("passing_score").default(70),

  // Settings
  allowLateSubmissions: boolean("allow_late_submissions").default(true),
  maxAttempts: integer("max_attempts").default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assignment submissions
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),

  // Submission
  submittedAt: timestamp("submitted_at"),
  attemptNumber: integer("attempt_number").default(1),

  // Grading
  score: real("score"),
  percentageScore: real("percentage_score"),
  feedback: text("feedback"),
  gradedAt: timestamp("graded_at"),
  gradedBy: uuid("graded_by").references(() => users.id),

  // Status
  status: varchar("status", { length: 20 }).notNull().default("not_started"), // not_started, in_progress, submitted, graded, late

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teacher notes on students
export const teacherStudentNotes = pgTable("teacher_student_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),

  // Content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).default("general"), // general, academic, behavioral, communication, goals

  // Flags
  isPinned: boolean("is_pinned").default(false),
  isPrivate: boolean("is_private").default(true), // If false, shared with other teachers

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Relations
export const classesRelations = relations(classes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [classes.organizationId],
    references: [organizations.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  enrollments: many(classEnrollments),
  assignments: many(assignments),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  class: one(classes, {
    fields: [classEnrollments.classId],
    references: [classes.id],
  }),
  learner: one(learners, {
    fields: [classEnrollments.learnerId],
    references: [learners.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  class: one(classes, {
    fields: [assignments.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [assignments.teacherId],
    references: [users.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
  }),
  learner: one(learners, {
    fields: [assignmentSubmissions.learnerId],
    references: [learners.id],
  }),
  grader: one(users, {
    fields: [assignmentSubmissions.gradedBy],
    references: [users.id],
  }),
}));

export const teacherStudentNotesRelations = relations(teacherStudentNotes, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherStudentNotes.teacherId],
    references: [users.id],
  }),
  learner: one(learners, {
    fields: [teacherStudentNotes.learnerId],
    references: [learners.id],
  }),
}));
