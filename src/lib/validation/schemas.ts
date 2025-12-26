/**
 * API Validation Schemas
 * Zod schemas for validating API request inputs
 */

import { z } from "zod";

// ============================================================================
// Common Schemas
// ============================================================================

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  { message: "Start date must be before end date" }
);

// ============================================================================
// Learner Schemas
// ============================================================================

export const learnerIdSchema = z.object({
  learnerId: uuidSchema,
});

export const createLearnerSchema = z.object({
  userId: uuidSchema,
  name: z.string().min(1).max(100).trim(),
  gradeLevel: z.number().int().min(0).max(12),
  preferences: z.object({
    favoriteSubjects: z.array(z.string()).optional(),
    learningStyle: z.enum(["visual", "auditory", "kinesthetic"]).optional(),
    readingLevel: z.string().optional(),
    mathLevel: z.string().optional(),
  }).optional(),
});

export const updateLearnerSchema = createLearnerSchema.partial().extend({
  learnerId: uuidSchema,
});

// ============================================================================
// Progress Schemas
// ============================================================================

export const progressQuerySchema = z.object({
  learnerId: uuidSchema,
  subjectId: uuidSchema.optional(),
  includeDetails: z.coerce.boolean().default(false),
});

export const activityAttemptSchema = z.object({
  learnerId: uuidSchema,
  activityId: uuidSchema,
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())]),
    timeSpent: z.number().int().min(0).optional(),
  })),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

// ============================================================================
// Agent Schemas
// ============================================================================

export const agentTypeSchema = z.enum([
  "tutor",
  "adaptive",
  "practice_gen",
  "assessment",
]);

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  type: agentTypeSchema,
  signature: z.string().min(1).max(10000),
  systemPrompt: z.string().min(1).max(50000),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const tutorMessageSchema = z.object({
  studentMessage: z.string().min(1).max(5000).trim(),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).max(50).optional(),
  gradeLevel: z.number().int().min(0).max(12).optional(),
  subject: z.string().min(1).max(50).optional(),
  topic: z.string().min(1).max(100).optional(),
  context: z.object({
    currentLesson: z.string().optional(),
    recentErrors: z.array(z.string()).max(10).optional(),
    masteryLevel: z.number().min(0).max(100).optional(),
  }).optional(),
});

export const practiceGeneratorSchema = z.object({
  subject: z.string().min(1).max(50),
  topic: z.string().min(1).max(100),
  gradeLevel: z.number().int().min(0).max(12),
  difficulty: z.number().int().min(1).max(5).optional(),
  count: z.number().int().min(1).max(10).default(5),
  problemType: z.enum([
    "multiple-choice",
    "fill-blank",
    "short-answer",
    "matching",
    "ordering",
    "true-false",
  ]).optional(),
});

export const adaptiveDifficultySchema = z.object({
  learnerId: uuidSchema,
  subjectId: uuidSchema,
  currentDifficulty: z.number().int().min(1).max(10),
  recentPerformance: z.object({
    correctCount: z.number().int().min(0),
    totalCount: z.number().int().min(1),
    averageTime: z.number().min(0),
    streakCorrect: z.number().int().min(0),
    streakIncorrect: z.number().int().min(0),
  }),
});

// ============================================================================
// Curriculum Schemas
// ============================================================================

export const curriculumQuerySchema = z.object({
  subjectId: uuidSchema.optional(),
  gradeLevel: z.coerce.number().int().min(0).max(12).optional(),
  includeUnits: z.coerce.boolean().default(false),
  includeLessons: z.coerce.boolean().default(false),
});

// ============================================================================
// User Schemas
// ============================================================================

export const userRoleSchema = z.enum(["learner", "parent", "teacher", "admin"]);

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  role: userRoleSchema.optional(),
  organizationId: uuidSchema.optional().nullable(),
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate request body against a schema
 * Returns parsed data or throws a ValidationError
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new ValidationError("Validation failed", issues);
    }
    throw new ValidationError("Invalid JSON body", []);
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public issues: { path: string; message: string }[];

  constructor(message: string, issues: { path: string; message: string }[]) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }

  toResponse(): Response {
    return Response.json(
      {
        error: this.message,
        issues: this.issues,
      },
      { status: 400 }
    );
  }
}
