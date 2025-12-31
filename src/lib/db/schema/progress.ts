import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, real, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { learners, users } from "./users";
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

// ============================================
// LEARNING GOALS (Parent-set goals per child)
// ============================================

// Goal types for structured target metrics
export type GoalMetricType =
  | "lessons_per_week"       // Complete X lessons per week
  | "minutes_per_day"        // Study for X minutes per day
  | "mastery_level"          // Achieve X% mastery in a subject
  | "streak_days"            // Maintain a streak for X days
  | "activities_completed"   // Complete X activities
  | "subject_progress"       // Complete X% of a subject
  | "custom";                // Custom goal with free-form target

export type GoalStatus = "active" | "completed" | "expired" | "paused";

// Learning goals set by parents for their children
export const learningGoals = pgTable("learning_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdByUserId: uuid("created_by_user_id").notNull(), // Parent who created the goal

  // Goal details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // Target metrics
  metricType: varchar("metric_type", { length: 50 }).notNull().$type<GoalMetricType>(),
  targetValue: integer("target_value").notNull(), // The target number (e.g., 5 lessons, 30 minutes)
  currentValue: integer("current_value").default(0), // Current progress towards goal

  // Optional subject scope (null = applies to all subjects)
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),

  // Additional configuration
  config: jsonb("config").$type<{
    recurrence?: "daily" | "weekly" | "monthly" | "once"; // For recurring goals
    resetDay?: number; // Day of week (0-6) or month (1-31) for reset
    reminderEnabled?: boolean;
    reminderTime?: string; // HH:MM format
    rewardDescription?: string; // Optional reward for completing the goal
    difficultyLevel?: 1 | 2 | 3 | 4 | 5; // Goal difficulty
  }>(),

  // Date range
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),

  // Status tracking
  status: varchar("status", { length: 50 }).notNull().default("active").$type<GoalStatus>(),
  completedAt: timestamp("completed_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("learning_goals_learner_idx").on(table.learnerId),
  index("learning_goals_org_idx").on(table.organizationId),
  index("learning_goals_status_idx").on(table.status),
  index("learning_goals_dates_idx").on(table.startDate, table.endDate),
]);

// Progress history for goals (tracks progress over time)
export const goalProgressHistory = pgTable("goal_progress_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id").notNull().references(() => learningGoals.id, { onDelete: "cascade" }),

  // Snapshot of progress at this point
  value: integer("value").notNull(),
  percentComplete: real("percent_complete").notNull(), // 0-100

  // Optional notes about progress
  notes: text("notes"),

  // Timestamp
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => [
  index("goal_progress_history_goal_idx").on(table.goalId),
  index("goal_progress_history_recorded_idx").on(table.recordedAt),
]);

// Relations for learning goals
export const learningGoalsRelations = relations(learningGoals, ({ one, many }) => ({
  learner: one(learners, {
    fields: [learningGoals.learnerId],
    references: [learners.id],
  }),
  subject: one(subjects, {
    fields: [learningGoals.subjectId],
    references: [subjects.id],
  }),
  progressHistory: many(goalProgressHistory),
}));

export const goalProgressHistoryRelations = relations(goalProgressHistory, ({ one }) => ({
  goal: one(learningGoals, {
    fields: [goalProgressHistory.goalId],
    references: [learningGoals.id],
  }),
}));

// ============================================
// LEARNING STREAK MANAGEMENT
// ============================================

// Main learner streaks table - tracks overall streak state
export const learnerStreaks = pgTable("learner_streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Core streak tracking
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"), // Date of last qualifying activity

  // Streak protection tokens
  freezeTokens: integer("freeze_tokens").default(0).notNull(), // Available freeze tokens
  totalFreezeTokensEarned: integer("total_freeze_tokens_earned").default(0).notNull(),
  totalFreezeTokensUsed: integer("total_freeze_tokens_used").default(0).notNull(),

  // Streak repair tracking
  totalRepairs: integer("total_repairs").default(0).notNull(),
  lastRepairDate: timestamp("last_repair_date"),

  // Milestone tracking
  milestones: jsonb("milestones").$type<{
    reachedMilestones: number[]; // e.g., [7, 14, 30, 60, 100]
    unclaimedRewards: number[]; // Milestones with unclaimed rewards
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("learner_streaks_learner_idx").on(table.learnerId),
  index("learner_streaks_org_idx").on(table.organizationId),
]);

// Streak Freeze Usage History - tracks all token transactions
export const streakFreezeHistory = pgTable("streak_freeze_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  action: varchar("action", { length: 50 }).notNull(), // "earned", "used", "purchased", "expired", "refunded"
  tokensChange: integer("tokens_change").notNull(), // Positive for earned/purchased, negative for used
  reason: text("reason"), // Why tokens were earned/used

  // Context for the action
  streakAtTime: integer("streak_at_time"), // What the streak was when this happened
  dateProtected: timestamp("date_protected"), // If "used", which date was protected

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("streak_freeze_history_learner_idx").on(table.learnerId),
  index("streak_freeze_history_org_idx").on(table.organizationId),
  index("streak_freeze_history_created_idx").on(table.createdAt),
]);

// Streak Repair History - tracks when broken streaks are repaired
export const streakRepairHistory = pgTable("streak_repair_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Repair details
  streakBefore: integer("streak_before").notNull(), // Streak value before repair
  streakAfter: integer("streak_after").notNull(), // Streak value after repair
  daysMissed: integer("days_missed").notNull(), // Number of days that were missed
  tokensCost: integer("tokens_cost").notNull(), // How many tokens it cost to repair

  // When the streak was broken
  brokenAt: timestamp("broken_at").notNull(),
  repairedAt: timestamp("repaired_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("streak_repair_history_learner_idx").on(table.learnerId),
  index("streak_repair_history_org_idx").on(table.organizationId),
]);

// Streak Milestone Definitions - global milestone configurations
export const streakMilestones = pgTable("streak_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),

  days: integer("days").notNull().unique(), // e.g., 7, 14, 30, 60, 100, 365
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Week Warrior"
  description: text("description"),
  iconUrl: text("icon_url"),

  // Rewards
  freezeTokenReward: integer("freeze_token_reward").default(0), // Freeze tokens earned
  points: integer("points").default(0), // Achievement points
  badgeId: uuid("badge_id"), // Optional linked achievement badge

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for streak tables
export const learnerStreaksRelations = relations(learnerStreaks, ({ one, many }) => ({
  learner: one(learners, {
    fields: [learnerStreaks.learnerId],
    references: [learners.id],
  }),
  freezeHistory: many(streakFreezeHistory),
  repairHistory: many(streakRepairHistory),
}));

export const streakFreezeHistoryRelations = relations(streakFreezeHistory, ({ one }) => ({
  learner: one(learners, {
    fields: [streakFreezeHistory.learnerId],
    references: [learners.id],
  }),
  streak: one(learnerStreaks, {
    fields: [streakFreezeHistory.learnerId],
    references: [learnerStreaks.learnerId],
  }),
}));

export const streakRepairHistoryRelations = relations(streakRepairHistory, ({ one }) => ({
  learner: one(learners, {
    fields: [streakRepairHistory.learnerId],
    references: [learners.id],
  }),
  streak: one(learnerStreaks, {
    fields: [streakRepairHistory.learnerId],
    references: [learnerStreaks.learnerId],
  }),
}));

// ============================================
// LEARNING SESSIONS (Real-time parent monitoring)
// ============================================

// Learning sessions for real-time parent monitoring
export const learningSessions = pgTable("learning_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Session timing
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  lastHeartbeatAt: timestamp("last_heartbeat_at").defaultNow(),

  // Session status
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, paused, completed, abandoned

  // Current activity context
  currentActivityType: varchar("current_activity_type", { length: 50 }), // lesson, quiz, practice, tutor
  currentLessonId: uuid("current_lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  currentActivityId: uuid("current_activity_id").references(() => activities.id, { onDelete: "set null" }),
  currentSubjectId: uuid("current_subject_id").references(() => subjects.id, { onDelete: "set null" }),

  // Session metrics
  totalActiveTime: integer("total_active_time").default(0), // seconds of actual engagement
  totalPausedTime: integer("total_paused_time").default(0), // seconds paused
  activitiesCompleted: integer("activities_completed").default(0),
  lessonsViewed: integer("lessons_viewed").default(0),

  // Progress during session
  progressSnapshot: jsonb("progress_snapshot").$type<{
    startMasteryLevel?: number;
    endMasteryLevel?: number;
    questionsAttempted?: number;
    questionsCorrect?: number;
    conceptsStudied?: string[];
  }>(),

  // Device info for monitoring
  deviceType: varchar("device_type", { length: 50 }), // desktop, tablet, mobile
  browserInfo: varchar("browser_info", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("learning_sessions_learner_idx").on(table.learnerId),
  index("learning_sessions_org_idx").on(table.organizationId),
  index("learning_sessions_status_idx").on(table.status),
  index("learning_sessions_started_at_idx").on(table.startedAt),
]);

// Session events for detailed activity tracking
export const sessionEvents = pgTable("session_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => learningSessions.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Event type
  eventType: varchar("event_type", { length: 50 }).notNull(),
  // Types: session_start, session_pause, session_resume, session_end,
  //        lesson_start, lesson_complete, activity_start, activity_complete,
  //        tutor_request, break_taken, idle_detected

  // Event context
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  activityId: uuid("activity_id").references(() => activities.id, { onDelete: "set null" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),

  // Event data
  eventData: jsonb("event_data").$type<{
    score?: number;
    duration?: number;
    reason?: string;
    activityName?: string;
    lessonName?: string;
    subjectName?: string;
  }>(),

  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("session_events_session_idx").on(table.sessionId),
  index("session_events_learner_idx").on(table.learnerId),
  index("session_events_occurred_at_idx").on(table.occurredAt),
]);

// Parent session notifications
export const parentSessionNotifications = pgTable("parent_session_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentUserId: uuid("parent_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  learnerId: uuid("learner_id").notNull().references(() => learners.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => learningSessions.id, { onDelete: "set null" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Notification type
  notificationType: varchar("notification_type", { length: 50 }).notNull(),
  // Types: session_started, session_ended, long_session, break_needed,
  //        activity_completed, milestone_reached, struggling_detected, idle_detected

  // Notification content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),

  // Status
  read: boolean("read").default(false),
  dismissed: boolean("dismissed").default(false),
  readAt: timestamp("read_at"),

  // Metadata
  metadata: jsonb("metadata").$type<{
    sessionDuration?: number;
    activityName?: string;
    subjectName?: string;
    score?: number;
    milestone?: string;
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("parent_session_notifications_parent_idx").on(table.parentUserId),
  index("parent_session_notifications_learner_idx").on(table.learnerId),
  index("parent_session_notifications_read_idx").on(table.read),
  index("parent_session_notifications_created_at_idx").on(table.createdAt),
]);

// Relations for learning sessions
export const learningSessionsRelations = relations(learningSessions, ({ one, many }) => ({
  learner: one(learners, {
    fields: [learningSessions.learnerId],
    references: [learners.id],
  }),
  currentLesson: one(lessons, {
    fields: [learningSessions.currentLessonId],
    references: [lessons.id],
  }),
  currentActivity: one(activities, {
    fields: [learningSessions.currentActivityId],
    references: [activities.id],
  }),
  currentSubject: one(subjects, {
    fields: [learningSessions.currentSubjectId],
    references: [subjects.id],
  }),
  events: many(sessionEvents),
}));

export const sessionEventsRelations = relations(sessionEvents, ({ one }) => ({
  session: one(learningSessions, {
    fields: [sessionEvents.sessionId],
    references: [learningSessions.id],
  }),
  learner: one(learners, {
    fields: [sessionEvents.learnerId],
    references: [learners.id],
  }),
  lesson: one(lessons, {
    fields: [sessionEvents.lessonId],
    references: [lessons.id],
  }),
  activity: one(activities, {
    fields: [sessionEvents.activityId],
    references: [activities.id],
  }),
  subject: one(subjects, {
    fields: [sessionEvents.subjectId],
    references: [subjects.id],
  }),
}));

export const parentSessionNotificationsRelations = relations(parentSessionNotifications, ({ one }) => ({
  parent: one(users, {
    fields: [parentSessionNotifications.parentUserId],
    references: [users.id],
  }),
  learner: one(learners, {
    fields: [parentSessionNotifications.learnerId],
    references: [learners.id],
  }),
  session: one(learningSessions, {
    fields: [parentSessionNotifications.sessionId],
    references: [learningSessions.id],
  }),
}));
