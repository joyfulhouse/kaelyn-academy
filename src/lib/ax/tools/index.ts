// Agent tools for database queries
// These provide structured access to curriculum and progress data for AI agents

import { db } from "@/lib/db";
import { subjects, units, lessons, concepts, activities } from "@/lib/db/schema/curriculum";
import {
  learnerSubjectProgress,
  conceptMastery,
  activityAttempts,
  lessonProgress,
} from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, desc, lte, sql } from "drizzle-orm";

// Tool schemas for Ax ReAct agents
export const toolSchemas = {
  getCurriculumConcepts: {
    name: "getCurriculumConcepts",
    description: "Get concepts for a specific subject and grade level",
    parameters: {
      type: "object",
      properties: {
        subjectSlug: { type: "string", description: "Subject identifier (e.g., 'math', 'reading')" },
        gradeLevel: { type: "number", description: "Grade level (0 = Kindergarten, 1-12)" },
        limit: { type: "number", description: "Maximum concepts to return" },
      },
      required: ["subjectSlug", "gradeLevel"],
    },
  },

  getLearnerProgress: {
    name: "getLearnerProgress",
    description: "Get a learner's progress across subjects",
    parameters: {
      type: "object",
      properties: {
        learnerId: { type: "string", description: "Learner UUID" },
        subjectSlug: { type: "string", description: "Optional subject filter" },
      },
      required: ["learnerId"],
    },
  },

  getConceptMastery: {
    name: "getConceptMastery",
    description: "Get a learner's mastery level for specific concepts",
    parameters: {
      type: "object",
      properties: {
        learnerId: { type: "string", description: "Learner UUID" },
        conceptIds: { type: "array", items: { type: "string" }, description: "Concept UUIDs" },
      },
      required: ["learnerId"],
    },
  },

  getRecentAttempts: {
    name: "getRecentAttempts",
    description: "Get a learner's recent activity attempts for adaptive difficulty",
    parameters: {
      type: "object",
      properties: {
        learnerId: { type: "string", description: "Learner UUID" },
        limit: { type: "number", description: "Number of recent attempts" },
        subjectSlug: { type: "string", description: "Optional subject filter" },
      },
      required: ["learnerId"],
    },
  },

  getWeakConcepts: {
    name: "getWeakConcepts",
    description: "Identify concepts where the learner is struggling",
    parameters: {
      type: "object",
      properties: {
        learnerId: { type: "string", description: "Learner UUID" },
        masteryThreshold: { type: "number", description: "Mastery below this is 'weak' (0-100)" },
        limit: { type: "number", description: "Maximum concepts to return" },
      },
      required: ["learnerId"],
    },
  },

  getNextLessons: {
    name: "getNextLessons",
    description: "Get recommended next lessons for a learner",
    parameters: {
      type: "object",
      properties: {
        learnerId: { type: "string", description: "Learner UUID" },
        subjectSlug: { type: "string", description: "Subject to get lessons for" },
        limit: { type: "number", description: "Maximum lessons to return" },
      },
      required: ["learnerId", "subjectSlug"],
    },
  },
};

// Tool implementations
export async function getCurriculumConcepts(params: {
  subjectSlug: string;
  gradeLevel: number;
  limit?: number;
}) {
  const subject = await db.query.subjects.findFirst({
    where: eq(subjects.slug, params.subjectSlug),
  });

  if (!subject) {
    return { error: "Subject not found", concepts: [] };
  }

  const conceptList = await db
    .select({
      id: concepts.id,
      title: concepts.title,
      explanation: concepts.explanation,
      lessonTitle: lessons.title,
      unitTitle: units.title,
    })
    .from(concepts)
    .innerJoin(lessons, eq(concepts.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(
      and(
        eq(units.subjectId, subject.id),
        eq(units.gradeLevel, params.gradeLevel),
        eq(lessons.isPublished, true)
      )
    )
    .orderBy(units.order, lessons.order, concepts.order)
    .limit(params.limit || 20);

  return { subject: subject.name, gradeLevel: params.gradeLevel, concepts: conceptList };
}

export async function getLearnerProgress(params: {
  learnerId: string;
  subjectSlug?: string;
}) {
  const conditions = [eq(learnerSubjectProgress.learnerId, params.learnerId)];

  if (params.subjectSlug) {
    const subject = await db.query.subjects.findFirst({
      where: eq(subjects.slug, params.subjectSlug),
    });
    if (subject) {
      conditions.push(eq(learnerSubjectProgress.subjectId, subject.id));
    }
  }

  const progress = await db
    .select({
      subjectName: subjects.name,
      masteryLevel: learnerSubjectProgress.masteryLevel,
      completedLessons: learnerSubjectProgress.completedLessons,
      totalLessons: learnerSubjectProgress.totalLessons,
      currentStreak: learnerSubjectProgress.currentStreak,
      totalTimeSpent: learnerSubjectProgress.totalTimeSpent,
      lastActivityAt: learnerSubjectProgress.lastActivityAt,
    })
    .from(learnerSubjectProgress)
    .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
    .where(and(...conditions));

  return { learnerId: params.learnerId, progress };
}

export async function getConceptMastery(params: {
  learnerId: string;
  conceptIds?: string[];
}) {
  const conditions = [eq(conceptMastery.learnerId, params.learnerId)];

  if (params.conceptIds && params.conceptIds.length > 0) {
    conditions.push(sql`${conceptMastery.conceptId} = ANY(${params.conceptIds})`);
  }

  const mastery = await db
    .select({
      conceptId: conceptMastery.conceptId,
      conceptTitle: concepts.title,
      masteryLevel: conceptMastery.masteryLevel,
      attempts: conceptMastery.attempts,
      correctAttempts: conceptMastery.correctAttempts,
      timeSpent: conceptMastery.timeSpent,
    })
    .from(conceptMastery)
    .innerJoin(concepts, eq(conceptMastery.conceptId, concepts.id))
    .where(and(...conditions))
    .orderBy(desc(conceptMastery.updatedAt))
    .limit(50);

  return { learnerId: params.learnerId, mastery };
}

export async function getRecentAttempts(params: {
  learnerId: string;
  limit?: number;
  subjectSlug?: string;
}) {
  const limit = params.limit || 10;

  let subjectFilter: ReturnType<typeof eq> | undefined;
  if (params.subjectSlug) {
    const subject = await db.query.subjects.findFirst({
      where: eq(subjects.slug, params.subjectSlug),
    });
    if (subject) {
      subjectFilter = eq(units.subjectId, subject.id);
    }
  }

  const attempts = await db
    .select({
      activityId: activityAttempts.activityId,
      activityTitle: activities.title,
      score: activityAttempts.score,
      maxScore: activityAttempts.maxScore,
      passed: activityAttempts.passed,
      timeSpent: activityAttempts.timeSpent,
      completedAt: activityAttempts.completedAt,
    })
    .from(activityAttempts)
    .innerJoin(activities, eq(activityAttempts.activityId, activities.id))
    .innerJoin(lessons, eq(activities.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(
      subjectFilter
        ? and(eq(activityAttempts.learnerId, params.learnerId), subjectFilter)
        : eq(activityAttempts.learnerId, params.learnerId)
    )
    .orderBy(desc(activityAttempts.completedAt))
    .limit(limit);

  // Format for adaptive agent
  return {
    learnerId: params.learnerId,
    attempts: attempts.map((a) => ({
      questionDifficulty: 5, // Default difficulty
      correct: a.passed ?? false,
      timeSpent: a.timeSpent ?? 0,
      hintsUsed: 0, // Would need separate tracking
      score: a.score,
      maxScore: a.maxScore,
    })),
  };
}

export async function getWeakConcepts(params: {
  learnerId: string;
  masteryThreshold?: number;
  limit?: number;
}) {
  const threshold = params.masteryThreshold ?? 60;
  const limit = params.limit ?? 10;

  const weakConcepts = await db
    .select({
      conceptId: conceptMastery.conceptId,
      conceptTitle: concepts.title,
      masteryLevel: conceptMastery.masteryLevel,
      attempts: conceptMastery.attempts,
      lessonTitle: lessons.title,
      unitTitle: units.title,
      subjectName: subjects.name,
    })
    .from(conceptMastery)
    .innerJoin(concepts, eq(conceptMastery.conceptId, concepts.id))
    .innerJoin(lessons, eq(concepts.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(subjects, eq(units.subjectId, subjects.id))
    .where(
      and(
        eq(conceptMastery.learnerId, params.learnerId),
        lte(conceptMastery.masteryLevel, threshold)
      )
    )
    .orderBy(conceptMastery.masteryLevel)
    .limit(limit);

  return {
    learnerId: params.learnerId,
    threshold,
    weakConcepts: weakConcepts.map((c) => ({
      ...c,
      needsReview: true,
    })),
  };
}

export async function getNextLessons(params: {
  learnerId: string;
  subjectSlug: string;
  limit?: number;
}) {
  const limit = params.limit ?? 5;

  const subject = await db.query.subjects.findFirst({
    where: eq(subjects.slug, params.subjectSlug),
  });

  if (!subject) {
    return { error: "Subject not found", lessons: [] };
  }

  // Get learner's grade level
  const learner = await db.query.learners.findFirst({
    where: eq(learners.id, params.learnerId),
  });

  if (!learner) {
    return { error: "Learner not found", lessons: [] };
  }

  // Find lessons not yet completed or in progress
  const nextLessons = await db
    .select({
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonDescription: lessons.description,
      unitTitle: units.title,
      estimatedMinutes: lessons.estimatedMinutes,
      difficultyLevel: lessons.difficultyLevel,
      progressStatus: lessonProgress.status,
      progressPercent: lessonProgress.progressPercent,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, lessons.id),
        eq(lessonProgress.learnerId, params.learnerId)
      )
    )
    .where(
      and(
        eq(units.subjectId, subject.id),
        eq(units.gradeLevel, learner.gradeLevel),
        eq(lessons.isPublished, true),
        sql`(${lessonProgress.status} IS NULL OR ${lessonProgress.status} != 'completed')`
      )
    )
    .orderBy(units.order, lessons.order)
    .limit(limit);

  return {
    learnerId: params.learnerId,
    subject: subject.name,
    gradeLevel: learner.gradeLevel,
    nextLessons: nextLessons.map((l) => ({
      ...l,
      recommended: true,
    })),
  };
}

// Tool registry for dynamic invocation
export const tools = {
  getCurriculumConcepts,
  getLearnerProgress,
  getConceptMastery,
  getRecentAttempts,
  getWeakConcepts,
  getNextLessons,
};

export type ToolName = keyof typeof tools;

// Parameter types for each tool
export interface ToolParams {
  getCurriculumConcepts: Parameters<typeof getCurriculumConcepts>[0];
  getLearnerProgress: Parameters<typeof getLearnerProgress>[0];
  getConceptMastery: Parameters<typeof getConceptMastery>[0];
  getRecentAttempts: Parameters<typeof getRecentAttempts>[0];
  getWeakConcepts: Parameters<typeof getWeakConcepts>[0];
  getNextLessons: Parameters<typeof getNextLessons>[0];
}

// Return types for each tool
export interface ToolResults {
  getCurriculumConcepts: Awaited<ReturnType<typeof getCurriculumConcepts>>;
  getLearnerProgress: Awaited<ReturnType<typeof getLearnerProgress>>;
  getConceptMastery: Awaited<ReturnType<typeof getConceptMastery>>;
  getRecentAttempts: Awaited<ReturnType<typeof getRecentAttempts>>;
  getWeakConcepts: Awaited<ReturnType<typeof getWeakConcepts>>;
  getNextLessons: Awaited<ReturnType<typeof getNextLessons>>;
}

// Type-safe tool executor with overloads for each tool
export function executeTool<T extends ToolName>(
  toolName: T,
  params: ToolParams[T]
): Promise<ToolResults[T]>;

export async function executeTool(
  toolName: ToolName,
  params: ToolParams[ToolName]
): Promise<ToolResults[ToolName]> {
  switch (toolName) {
    case "getCurriculumConcepts":
      return getCurriculumConcepts(params as ToolParams["getCurriculumConcepts"]);
    case "getLearnerProgress":
      return getLearnerProgress(params as ToolParams["getLearnerProgress"]);
    case "getConceptMastery":
      return getConceptMastery(params as ToolParams["getConceptMastery"]);
    case "getRecentAttempts":
      return getRecentAttempts(params as ToolParams["getRecentAttempts"]);
    case "getWeakConcepts":
      return getWeakConcepts(params as ToolParams["getWeakConcepts"]);
    case "getNextLessons":
      return getNextLessons(params as ToolParams["getNextLessons"]);
    default: {
      // Exhaustive check - this ensures all cases are handled
      const _exhaustiveCheck: never = toolName;
      throw new Error(`Unknown tool: ${_exhaustiveCheck}`);
    }
  }
}
