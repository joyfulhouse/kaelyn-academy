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
  announcements: many(classAnnouncements),
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

// Class announcements (teacher broadcasts to students)
export const classAnnouncements = pgTable(
  "class_announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id),

    // Content
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),

    // Priority level: normal, important, urgent
    priority: varchar("priority", { length: 20 }).notNull().default("normal"),

    // Publishing - null means draft
    publishedAt: timestamp("published_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  }
);

export const classAnnouncementsRelations = relations(classAnnouncements, ({ one }) => ({
  class: one(classes, {
    fields: [classAnnouncements.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [classAnnouncements.teacherId],
    references: [users.id],
  }),
}));

// =====================================================
// RUBRICS
// =====================================================

// Rubrics (teacher-created grading rubrics)
export const rubrics = pgTable("rubrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id),

  // Details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Scoring
  totalPoints: integer("total_points").notNull().default(100),

  // Metadata
  isTemplate: boolean("is_template").default(false), // Shared templates that can be copied
  isPublic: boolean("is_public").default(false), // Visible to other teachers in org

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Rubric criteria (individual grading criteria within a rubric)
export const rubricCriteria = pgTable("rubric_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  rubricId: uuid("rubric_id").notNull().references(() => rubrics.id, { onDelete: "cascade" }),

  // Details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Scoring
  maxPoints: integer("max_points").notNull().default(25),
  weight: real("weight").default(1.0), // Weighting factor for scoring

  // Ordering
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Performance levels for each criterion (e.g., Excellent, Good, Needs Improvement)
export const rubricPerformanceLevels = pgTable("rubric_performance_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  criterionId: uuid("criterion_id").notNull().references(() => rubricCriteria.id, { onDelete: "cascade" }),

  // Details
  name: varchar("name", { length: 100 }).notNull(), // "Excellent", "Proficient", "Developing", "Beginning"
  description: text("description"), // Detailed description of what this level looks like

  // Scoring
  points: integer("points").notNull(), // Points awarded for this level
  percentage: real("percentage").notNull(), // Percentage of max points (0-100)

  // Ordering
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assignment-Rubric linking (optional assignment attachment)
export const assignmentRubrics = pgTable("assignment_rubrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  rubricId: uuid("rubric_id").notNull().references(() => rubrics.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rubric Relations
export const rubricsRelations = relations(rubrics, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [rubrics.organizationId],
    references: [organizations.id],
  }),
  teacher: one(users, {
    fields: [rubrics.teacherId],
    references: [users.id],
  }),
  criteria: many(rubricCriteria),
  assignmentRubrics: many(assignmentRubrics),
}));

export const rubricCriteriaRelations = relations(rubricCriteria, ({ one, many }) => ({
  rubric: one(rubrics, {
    fields: [rubricCriteria.rubricId],
    references: [rubrics.id],
  }),
  performanceLevels: many(rubricPerformanceLevels),
}));

export const rubricPerformanceLevelsRelations = relations(rubricPerformanceLevels, ({ one }) => ({
  criterion: one(rubricCriteria, {
    fields: [rubricPerformanceLevels.criterionId],
    references: [rubricCriteria.id],
  }),
}));

export const assignmentRubricsRelations = relations(assignmentRubrics, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentRubrics.assignmentId],
    references: [assignments.id],
  }),
  rubric: one(rubrics, {
    fields: [assignmentRubrics.rubricId],
    references: [rubrics.id],
  }),
}));

// =====================================================
// ASSIGNMENT TEMPLATES
// =====================================================

// Assignment Templates (reusable assignment blueprints)
export const assignmentTemplates = pgTable("assignment_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id),

  // Template info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Template type
  templateType: varchar("template_type", { length: 50 }).notNull().default("homework"), // homework, quiz, project, exam, practice, worksheet

  // Content
  instructions: text("instructions"),
  questions: text("questions"), // JSON string of questions/prompts
  attachments: text("attachments"), // JSON string of attachment metadata

  // Default settings
  defaultTimeLimit: integer("default_time_limit"), // in minutes, null = no limit
  defaultTotalPoints: integer("default_total_points").default(100),
  defaultPassingScore: integer("default_passing_score").default(70),
  defaultAllowLateSubmissions: boolean("default_allow_late_submissions").default(true),
  defaultMaxAttempts: integer("default_max_attempts").default(1),

  // Linked curriculum
  lessonIds: uuid("lesson_ids").array(),
  activityIds: uuid("activity_ids").array(),

  // Sharing settings
  isShared: boolean("is_shared").default(false), // If true, visible to other teachers in org
  isPublic: boolean("is_public").default(false), // If true, visible to all organizations

  // Usage tracking
  usageCount: integer("usage_count").default(0),

  // Metadata
  tags: varchar("tags", { length: 50 }).array(),
  gradeLevel: integer("grade_level"), // Target grade level
  subjectId: uuid("subject_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Relations for assignment templates
export const assignmentTemplatesRelations = relations(assignmentTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [assignmentTemplates.organizationId],
    references: [organizations.id],
  }),
  teacher: one(users, {
    fields: [assignmentTemplates.teacherId],
    references: [users.id],
  }),
}));

// =====================================================
// GRADEBOOK
// =====================================================

// Grades (direct grades for students, can be standalone or linked to assignments)
export const grades = pgTable("grades", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id").notNull().references(() => users.id),

  // Grade category/type (e.g., "homework", "quiz", "test", "project", "participation")
  category: varchar("category", { length: 50 }).notNull().default("assignment"),

  // Grade item details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Scoring
  pointsEarned: real("points_earned"),
  pointsPossible: real("points_possible").notNull().default(100),
  percentage: real("percentage"), // Calculated from points
  letterGrade: varchar("letter_grade", { length: 5 }), // A+, A, A-, B+, etc.

  // Weight for calculating final grade
  weight: real("weight").default(1.0),

  // Feedback
  feedback: text("feedback"),

  // Due date for this grade item
  dueDate: timestamp("due_date"),

  // Linked assignment (optional - can be standalone grade)
  assignmentId: uuid("assignment_id").references(() => assignments.id, { onDelete: "set null" }),

  // Timestamps
  gradedAt: timestamp("graded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Grade history for tracking changes
export const gradeHistory = pgTable("grade_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  gradeId: uuid("grade_id").notNull().references(() => grades.id, { onDelete: "cascade" }),
  changedBy: uuid("changed_by").notNull().references(() => users.id),

  // Previous values
  previousPointsEarned: real("previous_points_earned"),
  previousLetterGrade: varchar("previous_letter_grade", { length: 5 }),
  previousFeedback: text("previous_feedback"),

  // New values
  newPointsEarned: real("new_points_earned"),
  newLetterGrade: varchar("new_letter_grade", { length: 5 }),
  newFeedback: text("new_feedback"),

  // Reason for change
  changeReason: text("change_reason"),

  // Timestamp
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

// Grade categories configuration per class
export const gradeCategories = pgTable("grade_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),

  // Weight percentage (e.g., 30 for 30%)
  weightPercentage: real("weight_percentage").notNull().default(100),

  // Color for UI
  color: varchar("color", { length: 20 }),

  // Display order
  displayOrder: integer("display_order").default(0),

  // Drop lowest N grades in this category
  dropLowest: integer("drop_lowest").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for grades
export const gradesRelations = relations(grades, ({ one, many }) => ({
  class: one(classes, {
    fields: [grades.classId],
    references: [classes.id],
  }),
  learner: one(learners, {
    fields: [grades.learnerId],
    references: [learners.id],
  }),
  teacher: one(users, {
    fields: [grades.teacherId],
    references: [users.id],
  }),
  assignment: one(assignments, {
    fields: [grades.assignmentId],
    references: [assignments.id],
  }),
  history: many(gradeHistory),
}));

export const gradeHistoryRelations = relations(gradeHistory, ({ one }) => ({
  grade: one(grades, {
    fields: [gradeHistory.gradeId],
    references: [grades.id],
  }),
  changedByUser: one(users, {
    fields: [gradeHistory.changedBy],
    references: [users.id],
  }),
}));

export const gradeCategoriesRelations = relations(gradeCategories, ({ one }) => ({
  class: one(classes, {
    fields: [gradeCategories.classId],
    references: [classes.id],
  }),
}));
