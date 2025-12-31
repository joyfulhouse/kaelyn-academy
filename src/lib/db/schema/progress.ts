import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, real, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { learners } from "./users";
import { lessons, concepts, activities, units, subjects } from "./curriculum";

// Overall learner progress per subject
export const learnerSubjectProgress = pgTable("learner_subject_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Progress metrics
  completedLessons: integer("completed_lessons").default(0),
  totalLessons: integer("total_lessons").default(0),
  completedUnits: integer("completed_units").default(0),
  totalUnits: integer("total_units").default(0),

  // Mastery
  masteryLevel: real("mastery_level").default(0), // 0-100
  currentStreak: integer("current_streak").default(0), // days
  longestStreak: integer("longest_streak").default(0),

  // Time tracking
  totalTimeSpent: integer("total_time_spent").default(0), // seconds
  lastActivityAt: timestamp("last_activity_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  // Composite index for efficient lookups by learner and subject
  index("learner_subject_progress_learner_subject_idx").on(table.learnerId, table.subjectId),
  // Index for organization filtering
  index("learner_subject_progress_org_idx").on(table.organizationId),
]);

// Progress per unit
export const unitProgress = pgTable("unit_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  unitId: uuid("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  status: varchar("status", { length: 50 }).notNull().default("not_started"), // not_started, in_progress, completed
  progressPercent: real("progress_percent").default(0),

  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // seconds

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("unit_progress_learner_unit_idx").on(table.learnerId, table.unitId),
  index("unit_progress_org_idx").on(table.organizationId),
]);

// Progress per lesson
export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  status: varchar("status", { length: 50 }).notNull().default("not_started"),
  progressPercent: real("progress_percent").default(0),

  // Completion tracking
  conceptsCompleted: integer("concepts_completed").default(0),
  activitiesCompleted: integer("activities_completed").default(0),

  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0),

  // Bookmarking
  isBookmarked: boolean("is_bookmarked").default(false),
  lastPosition: jsonb("last_position").$type<{
    conceptId?: string;
    scrollPosition?: number;
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("lesson_progress_learner_lesson_idx").on(table.learnerId, table.lessonId),
  index("lesson_progress_org_idx").on(table.organizationId),
]);

// Concept mastery
export const conceptMastery = pgTable("concept_mastery", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Mastery tracking
  masteryLevel: real("mastery_level").default(0), // 0-100
  attempts: integer("attempts").default(0),
  correctAttempts: integer("correct_attempts").default(0),

  // Learning pattern
  learningPattern: jsonb("learning_pattern").$type<{
    preferredExplanationType?: "visual" | "text" | "video" | "interactive";
    averageTimeToUnderstand?: number;
    commonMistakes?: string[];
  }>(),

  firstViewedAt: timestamp("first_viewed_at"),
  masteredAt: timestamp("mastered_at"),
  timeSpent: integer("time_spent").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("concept_mastery_learner_concept_idx").on(table.learnerId, table.conceptId),
  index("concept_mastery_org_idx").on(table.organizationId),
]);

// Activity attempts (quizzes, exercises)
export const activityAttempts = pgTable("activity_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  activityId: uuid("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  attemptNumber: integer("attempt_number").notNull().default(1),

  // Results
  score: real("score"), // 0-100
  maxScore: real("max_score"),
  passed: boolean("passed"),
  timeSpent: integer("time_spent"), // seconds

  // Detailed answers
  answers: jsonb("answers").$type<Array<{
    questionId: string;
    answer: string | string[];
    correct: boolean;
    timeSpent?: number;
  }>>(),

  // AI-generated feedback
  aiFeedback: text("ai_feedback"),

  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("activity_attempts_learner_activity_idx").on(table.learnerId, table.activityId),
  index("activity_attempts_org_idx").on(table.organizationId),
]);

// Achievements and badges
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  type: varchar("type", { length: 50 }).notNull(), // streak, mastery, completion, special

  // Criteria for earning
  criteria: jsonb("criteria").$type<{
    type: "streak_days" | "lessons_completed" | "mastery_level" | "subject_completion" | "custom";
    threshold: number;
    subjectId?: string;
    gradeLevel?: number;
  }>(),

  points: integer("points").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learnerAchievements = pgTable("learner_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  notifiedAt: timestamp("notified_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("learner_achievements_learner_idx").on(table.learnerId),
  index("learner_achievements_org_idx").on(table.organizationId),
]);

// Relations
export const learnerSubjectProgressRelations = relations(learnerSubjectProgress, ({ one }) => ({
  learner: one(learners, {
    fields: [learnerSubjectProgress.learnerId],
    references: [learners.id],
  }),
  subject: one(subjects, {
    fields: [learnerSubjectProgress.subjectId],
    references: [subjects.id],
  }),
}));

export const unitProgressRelations = relations(unitProgress, ({ one }) => ({
  learner: one(learners, {
    fields: [unitProgress.learnerId],
    references: [learners.id],
  }),
  unit: one(units, {
    fields: [unitProgress.unitId],
    references: [units.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  learner: one(learners, {
    fields: [lessonProgress.learnerId],
    references: [learners.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const conceptMasteryRelations = relations(conceptMastery, ({ one }) => ({
  learner: one(learners, {
    fields: [conceptMastery.learnerId],
    references: [learners.id],
  }),
  concept: one(concepts, {
    fields: [conceptMastery.conceptId],
    references: [concepts.id],
  }),
}));

export const activityAttemptsRelations = relations(activityAttempts, ({ one }) => ({
  learner: one(learners, {
    fields: [activityAttempts.learnerId],
    references: [learners.id],
  }),
  activity: one(activities, {
    fields: [activityAttempts.activityId],
    references: [activities.id],
  }),
}));

export const learnerAchievementsRelations = relations(learnerAchievements, ({ one }) => ({
  learner: one(learners, {
    fields: [learnerAchievements.learnerId],
    references: [learners.id],
  }),
  achievement: one(achievements, {
    fields: [learnerAchievements.achievementId],
    references: [achievements.id],
  }),
}));
