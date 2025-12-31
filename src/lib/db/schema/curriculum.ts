import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";

// Subjects (Math, Reading, Science, History, Technology)
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 100 }), // Lucide icon name
  color: varchar("color", { length: 7 }), // Hex color
  order: integer("order").default(0),

  // For custom subjects per organization
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").default(true), // Platform-wide subjects

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Grade levels with metadata
export const gradeLevels = pgTable("grade_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  grade: integer("grade").notNull().unique(), // 0 = K, 1-12
  name: varchar("name", { length: 100 }).notNull(), // "Kindergarten", "1st Grade", etc.
  ageRange: varchar("age_range", { length: 50 }), // "5-6", "6-7", etc.
  ageGroup: varchar("age_group", { length: 20 }).notNull(), // early, elementary, middle, high

  // UI customization per grade
  theme: jsonb("theme").$type<{
    primaryColor?: string;
    fontSize?: "large" | "medium" | "small";
    iconStyle?: "playful" | "standard" | "minimal";
  }>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Educational standards (Common Core, NGSS, etc.)
export const standards = pgTable("standards", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "CCSS.MATH.CONTENT.K.CC.A.1"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  standardBody: varchar("standard_body", { length: 100 }).notNull(), // "Common Core", "NGSS", "Custom"
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  gradeLevel: integer("grade_level"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Units (chapters/modules within a subject)
export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  gradeLevel: integer("grade_level").notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").default(0),

  // Estimated duration
  estimatedMinutes: integer("estimated_minutes"),

  // Prerequisites
  prerequisiteUnitIds: uuid("prerequisite_unit_ids").array(),

  // Organization scope (null = platform default)
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),

  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Lessons within units
export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").default(0),

  // Content
  content: jsonb("content").$type<{
    type: "text" | "video" | "interactive" | "quiz" | "game";
    body?: string; // Markdown content
    videoUrl?: string;
    interactiveConfig?: Record<string, unknown>;
  }>(),

  // 3D visualization config
  visualization3d: jsonb("visualization_3d").$type<{
    enabled: boolean;
    componentName?: string; // React component to render
    config?: Record<string, unknown>;
  }>(),

  // Standards alignment
  standardIds: uuid("standard_ids").array(),

  // Estimated duration
  estimatedMinutes: integer("estimated_minutes"),

  // Difficulty
  difficultyLevel: integer("difficulty_level").default(1), // 1-5

  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Concepts within lessons
export const concepts = pgTable("concepts", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  explanation: text("explanation"), // Markdown
  order: integer("order").default(0),

  // Visual aids
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),

  // 3D visualization (required for all concepts)
  visualization3d: jsonb("visualization_3d").$type<{
    componentName: string; // React Three Fiber component
    config: Record<string, unknown>;
    altDescription: string; // Accessibility
  }>().notNull(),

  // Key terms
  keyTerms: jsonb("key_terms").$type<Array<{
    term: string;
    definition: string;
  }>>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interactive activity type definitions
export type InteractiveActivityType =
  | "quiz"
  | "exercise"
  | "game"
  | "practice"
  | "drag_drop"
  | "code_editor"
  | "fill_blank"
  | "drawing"
  | "matching"
  | "sorting";

// Drag-and-drop item configuration
export interface DragDropItem {
  id: string;
  content: string;
  category?: string;
  imageUrl?: string;
}

// Drag-and-drop zone configuration
export interface DragDropZone {
  id: string;
  label: string;
  acceptedItemIds: string[];
  maxItems?: number;
}

// Code editor configuration
export interface CodeEditorConfig {
  language: "javascript" | "typescript" | "python" | "html" | "css" | "sql" | "json";
  starterCode?: string;
  solution?: string;
  testCases?: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    description?: string;
    isHidden?: boolean;
  }>;
  hints?: string[];
  allowedImports?: string[];
  executionTimeLimit?: number; // milliseconds
}

// Fill-in-the-blank configuration
export interface FillBlankConfig {
  text: string; // Text with {{blank:id}} placeholders
  blanks: Array<{
    id: string;
    correctAnswers: string[]; // Multiple acceptable answers
    caseSensitive?: boolean;
    hint?: string;
    points?: number;
  }>;
  showWordBank?: boolean;
  wordBank?: string[]; // Optional word bank for younger learners
}

// Drawing/annotation configuration
export interface DrawingConfig {
  backgroundImage?: string;
  backgroundType?: "blank" | "grid" | "lined" | "image";
  gridSize?: number;
  allowedTools: Array<"pen" | "highlighter" | "eraser" | "shape" | "text" | "stamp">;
  colors?: string[];
  strokeWidths?: number[];
  rubric?: Array<{
    criterion: string;
    description: string;
    points: number;
  }>;
  referenceAnswer?: string; // Base64 encoded image for teacher reference
}

// Activity configuration type
export interface ActivityConfig {
  // Quiz/exercise questions
  questions?: Array<{
    id: string;
    type: "multiple_choice" | "true_false" | "fill_blank" | "matching" | "ordering";
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points?: number;
  }>;

  // Drag-and-drop configuration
  dragDrop?: {
    items: DragDropItem[];
    zones: DragDropZone[];
    enableReorder?: boolean;
    shuffleItems?: boolean;
  };

  // Code editor configuration
  codeEditor?: CodeEditorConfig;

  // Fill-in-the-blank configuration
  fillBlank?: FillBlankConfig;

  // Drawing/annotation configuration
  drawing?: DrawingConfig;

  // Matching pairs (for matching activity type)
  matchingPairs?: Array<{
    id: string;
    left: string;
    right: string;
    leftImage?: string;
    rightImage?: string;
  }>;

  // Sorting items (for sorting activity type)
  sortingItems?: Array<{
    id: string;
    content: string;
    correctPosition: number;
    imageUrl?: string;
  }>;

  // Game configuration
  gameConfig?: Record<string, unknown>;

  // Time and retry settings
  timeLimit?: number; // seconds
  allowRetry?: boolean;
  maxAttempts?: number;
  showExplanations?: boolean;

  // Accessibility
  accessibilityDescription?: string;
  screenReaderInstructions?: string;
}

// Activities (quizzes, exercises, games, interactive activities)
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  conceptId: uuid("concept_id").references(() => concepts.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().$type<InteractiveActivityType>(),
  instructions: text("instructions"),

  // Activity configuration
  config: jsonb("config").$type<ActivityConfig>(),

  // Scoring
  maxPoints: integer("max_points").default(100),
  passingScore: integer("passing_score").default(70),

  // Grade level appropriateness
  minGradeLevel: integer("min_grade_level"),
  maxGradeLevel: integer("max_grade_level"),

  // Accessibility flags
  hasAudioSupport: boolean("has_audio_support").default(false),
  hasVisualAlternative: boolean("has_visual_alternative").default(false),
  mobileOptimized: boolean("mobile_optimized").default(true),

  order: integer("order").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const subjectsRelations = relations(subjects, ({ many }) => ({
  units: many(units),
  standards: many(standards),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [units.subjectId],
    references: [subjects.id],
  }),
  organization: one(organizations, {
    fields: [units.organizationId],
    references: [organizations.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  concepts: many(concepts),
  activities: many(activities),
}));

export const conceptsRelations = relations(concepts, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [concepts.lessonId],
    references: [lessons.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  lesson: one(lessons, {
    fields: [activities.lessonId],
    references: [lessons.id],
  }),
  concept: one(concepts, {
    fields: [activities.conceptId],
    references: [concepts.id],
  }),
}));

export const standardsRelations = relations(standards, ({ one }) => ({
  subject: one(subjects, {
    fields: [standards.subjectId],
    references: [subjects.id],
  }),
}));
