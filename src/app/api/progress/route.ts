import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  learnerSubjectProgress,
  lessonProgress,
  conceptMastery,
  activityAttempts,
  learnerAchievements,
} from "@/lib/db/schema/progress";
import { subjects, lessons, concepts, activities } from "@/lib/db/schema/curriculum";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requireLearnerAccess, AuthorizationError, type Role } from "@/lib/auth/rbac";
import { ValidationError } from "@/lib/validation";
import { z } from "zod";

// Query schema for GET
const progressQuerySchema = z.object({
  learnerId: z.string().uuid(),
  type: z.enum(["subject", "unit", "lesson", "concept"]).optional(),
  subject: z.string().optional(),
});

// GET /api/progress - Get learner progress
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = progressQuerySchema.parse(params);

    // Verify access to this learner's data
    try {
      await requireLearnerAccess(query.learnerId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return error.toResponse();
      }
      throw error;
    }

    const learnerId = query.learnerId;
    const type = query.type;
    switch (type) {
      case "subject": {
        const progress = await db
          .select({
            id: learnerSubjectProgress.id,
            subjectId: learnerSubjectProgress.subjectId,
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
          .where(eq(learnerSubjectProgress.learnerId, learnerId));

        return NextResponse.json({ progress });
      }

      case "lesson": {
        const subjectSlug = searchParams.get("subject");
        let subjectFilter: ReturnType<typeof eq> | undefined;

        if (subjectSlug) {
          const subject = await db.query.subjects.findFirst({
            where: eq(subjects.slug, subjectSlug),
          });
          if (subject) {
            subjectFilter = eq(lessons.unitId, subject.id);
          }
        }

        const progress = await db
          .select({
            id: lessonProgress.id,
            lessonId: lessonProgress.lessonId,
            lessonTitle: lessons.title,
            status: lessonProgress.status,
            progressPercent: lessonProgress.progressPercent,
            conceptsCompleted: lessonProgress.conceptsCompleted,
            activitiesCompleted: lessonProgress.activitiesCompleted,
            timeSpent: lessonProgress.timeSpent,
            isBookmarked: lessonProgress.isBookmarked,
          })
          .from(lessonProgress)
          .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
          .where(
            subjectFilter
              ? and(eq(lessonProgress.learnerId, learnerId), subjectFilter)
              : eq(lessonProgress.learnerId, learnerId)
          )
          .orderBy(desc(lessonProgress.updatedAt));

        return NextResponse.json({ progress });
      }

      case "concept": {
        const progress = await db
          .select({
            id: conceptMastery.id,
            conceptId: conceptMastery.conceptId,
            conceptTitle: concepts.title,
            masteryLevel: conceptMastery.masteryLevel,
            attempts: conceptMastery.attempts,
            correctAttempts: conceptMastery.correctAttempts,
            timeSpent: conceptMastery.timeSpent,
          })
          .from(conceptMastery)
          .innerJoin(concepts, eq(conceptMastery.conceptId, concepts.id))
          .where(eq(conceptMastery.learnerId, learnerId))
          .orderBy(desc(conceptMastery.updatedAt));

        return NextResponse.json({ progress });
      }

      default: {
        // Return summary of all progress
        const subjectProgress = await db
          .select({
            id: learnerSubjectProgress.id,
            subjectId: learnerSubjectProgress.subjectId,
            subjectName: subjects.name,
            masteryLevel: learnerSubjectProgress.masteryLevel,
            completedLessons: learnerSubjectProgress.completedLessons,
            totalLessons: learnerSubjectProgress.totalLessons,
            currentStreak: learnerSubjectProgress.currentStreak,
            longestStreak: learnerSubjectProgress.longestStreak,
            totalTimeSpent: learnerSubjectProgress.totalTimeSpent,
            lastActivityAt: learnerSubjectProgress.lastActivityAt,
          })
          .from(learnerSubjectProgress)
          .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
          .where(eq(learnerSubjectProgress.learnerId, learnerId));

        const recentAttempts = await db
          .select({
            activityTitle: activities.title,
            score: activityAttempts.score,
            passed: activityAttempts.passed,
            completedAt: activityAttempts.completedAt,
          })
          .from(activityAttempts)
          .innerJoin(activities, eq(activityAttempts.activityId, activities.id))
          .where(eq(activityAttempts.learnerId, learnerId))
          .orderBy(desc(activityAttempts.completedAt))
          .limit(10);

        // Get achievement count
        const achievementCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(learnerAchievements)
          .where(eq(learnerAchievements.learnerId, learnerId));

        // Get weekly activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyAttempts = await db
          .select({
            day: sql<string>`to_char(${activityAttempts.completedAt}, 'Dy')`,
            date: sql<string>`date(${activityAttempts.completedAt})`,
            timeSpent: sql<number>`sum(coalesce(${activityAttempts.timeSpent}, 0))::int`,
            lessonCount: sql<number>`count(distinct ${activities.lessonId})::int`,
          })
          .from(activityAttempts)
          .innerJoin(activities, eq(activityAttempts.activityId, activities.id))
          .where(
            and(
              eq(activityAttempts.learnerId, learnerId),
              sql`${activityAttempts.completedAt} >= ${weekAgo}`
            )
          )
          .groupBy(sql`date(${activityAttempts.completedAt})`, sql`to_char(${activityAttempts.completedAt}, 'Dy')`)
          .orderBy(sql`date(${activityAttempts.completedAt})`);

        // Build weekly activity array with all 7 days
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const weeklyActivity = dayNames.map((day, index) => {
          const targetDate = new Date();
          targetDate.setDate(today.getDate() - (today.getDay() - index));
          const dateStr = targetDate.toISOString().split("T")[0];
          const data = weeklyAttempts.find(a => a.date === dateStr);
          return {
            day,
            minutes: data ? Math.round(data.timeSpent / 60) : 0,
            lessons: data?.lessonCount || 0,
          };
        });

        // Get mastery breakdown from concept mastery
        const masteryData = await db
          .select({
            masteryLevel: conceptMastery.masteryLevel,
            count: sql<number>`count(*)::int`,
          })
          .from(conceptMastery)
          .where(eq(conceptMastery.learnerId, learnerId))
          .groupBy(conceptMastery.masteryLevel);

        // Categorize mastery levels
        let mastered = 0, learning = 0, needsReview = 0;
        for (const m of masteryData) {
          const level = m.masteryLevel || 0;
          if (level >= 80) mastered += m.count;
          else if (level >= 50) learning += m.count;
          else if (level > 0) needsReview += m.count;
        }

        // Calculate "not started" from total concepts vs tracked concepts
        const totalTracked = mastered + learning + needsReview;
        const masteryBreakdown = [
          { name: "Mastered", value: mastered, color: "var(--success)" },
          { name: "Learning", value: learning, color: "var(--primary)" },
          { name: "Needs Review", value: needsReview, color: "var(--warning)" },
        ];

        // Calculate overall streak and longest streak
        const currentStreak = Math.max(...subjectProgress.map(s => s.currentStreak || 0), 0);
        const longestStreak = Math.max(...subjectProgress.map(s => s.longestStreak || 0), 0);

        return NextResponse.json({
          summary: {
            subjects: subjectProgress,
            recentActivity: recentAttempts,
            achievementCount: achievementCount[0]?.count || 0,
            weeklyActivity,
            masteryBreakdown,
            currentStreak,
            longestStreak,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError("Validation failed", error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }))).toResponse();
    }
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST schema for activity attempt
const activityAttemptSchema = z.object({
  learnerId: z.string().uuid(),
  activityId: z.string().uuid(),
  score: z.number().min(0).optional(),
  maxScore: z.number().min(0).optional(),
  passed: z.boolean().optional(),
  timeSpent: z.number().int().min(0).optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())]),
    correct: z.boolean(),
    timeSpent: z.number().int().min(0).optional(),
  })).optional(),
});

// POST /api/progress - Record activity attempt
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate request body
    const rawBody = await request.json();
    const body = activityAttemptSchema.parse(rawBody);

    // Verify access to this learner's data
    try {
      await requireLearnerAccess(body.learnerId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return error.toResponse();
      }
      throw error;
    }

    const { learnerId, activityId, score, maxScore, passed, timeSpent, answers } = body;

    const organizationId = (session.user as { organizationId?: string }).organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    // Get current attempt number
    const previousAttempts = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityAttempts)
      .where(
        and(
          eq(activityAttempts.learnerId, learnerId),
          eq(activityAttempts.activityId, activityId)
        )
      );

    const attemptNumber = (previousAttempts[0]?.count || 0) + 1;

    const [attempt] = await db
      .insert(activityAttempts)
      .values({
        learnerId,
        activityId,
        organizationId,
        attemptNumber,
        score,
        maxScore,
        passed,
        timeSpent,
        answers,
        startedAt: new Date(),
        completedAt: new Date(),
      })
      .returning();

    // Update concept mastery if this activity is linked to a concept
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
    });

    if (activity?.conceptId) {
      const existingMastery = await db.query.conceptMastery.findFirst({
        where: and(
          eq(conceptMastery.learnerId, learnerId),
          eq(conceptMastery.conceptId, activity.conceptId)
        ),
      });

      if (existingMastery) {
        // Update existing mastery
        const newAttempts = (existingMastery.attempts || 0) + 1;
        const newCorrect = passed
          ? (existingMastery.correctAttempts || 0) + 1
          : (existingMastery.correctAttempts || 0);
        const newMastery = Math.round((newCorrect / newAttempts) * 100);

        await db
          .update(conceptMastery)
          .set({
            masteryLevel: newMastery,
            attempts: newAttempts,
            correctAttempts: newCorrect,
            timeSpent: (existingMastery.timeSpent ?? 0) + (timeSpent ?? 0),
            masteredAt: newMastery >= 80 ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(conceptMastery.id, existingMastery.id));
      } else {
        // Create new mastery record
        await db.insert(conceptMastery).values({
          learnerId,
          conceptId: activity.conceptId,
          organizationId,
          masteryLevel: passed ? 100 : 0,
          attempts: 1,
          correctAttempts: passed ? 1 : 0,
          timeSpent: timeSpent || 0,
          firstViewedAt: new Date(),
          masteredAt: passed ? new Date() : null,
        });
      }
    }

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError("Validation failed", error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }))).toResponse();
    }
    console.error("Error recording attempt:", error);
    return NextResponse.json(
      { error: "Failed to record attempt" },
      { status: 500 }
    );
  }
}

// PATCH schema for lesson progress update
const lessonProgressSchema = z.object({
  learnerId: z.string().uuid(),
  lessonId: z.string().uuid(),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  conceptsCompleted: z.number().int().min(0).optional(),
  activitiesCompleted: z.number().int().min(0).optional(),
  timeSpent: z.number().int().min(0).optional(),
  isBookmarked: z.boolean().optional(),
  lastPosition: z.object({
    conceptId: z.string().optional(),
    scrollPosition: z.number().optional(),
  }).optional(),
});

// PATCH /api/progress - Update lesson progress
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate request body
    const rawBody = await request.json();
    const body = lessonProgressSchema.parse(rawBody);

    // Verify access to this learner's data
    try {
      await requireLearnerAccess(body.learnerId);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return error.toResponse();
      }
      throw error;
    }

    const {
      learnerId,
      lessonId,
      status,
      progressPercent,
      conceptsCompleted,
      activitiesCompleted,
      timeSpent,
      isBookmarked,
      lastPosition,
    } = body;

    const organizationId = (session.user as { organizationId?: string }).organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    // Upsert lesson progress
    const existingProgress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.learnerId, learnerId),
        eq(lessonProgress.lessonId, lessonId)
      ),
    });

    if (existingProgress) {
      const [updated] = await db
        .update(lessonProgress)
        .set({
          status: status ?? existingProgress.status,
          progressPercent: progressPercent ?? existingProgress.progressPercent,
          conceptsCompleted: conceptsCompleted ?? existingProgress.conceptsCompleted,
          activitiesCompleted: activitiesCompleted ?? existingProgress.activitiesCompleted,
          timeSpent: (existingProgress.timeSpent || 0) + (timeSpent || 0),
          isBookmarked: isBookmarked ?? existingProgress.isBookmarked,
          lastPosition: lastPosition ?? existingProgress.lastPosition,
          completedAt: status === "completed" ? new Date() : existingProgress.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(lessonProgress.id, existingProgress.id))
        .returning();

      return NextResponse.json({ progress: updated });
    } else {
      const [created] = await db
        .insert(lessonProgress)
        .values({
          learnerId,
          lessonId,
          organizationId,
          status: status ?? "in_progress",
          progressPercent: progressPercent ?? 0,
          conceptsCompleted: conceptsCompleted ?? 0,
          activitiesCompleted: activitiesCompleted ?? 0,
          timeSpent: timeSpent ?? 0,
          isBookmarked: isBookmarked ?? false,
          lastPosition,
          startedAt: new Date(),
        })
        .returning();

      return NextResponse.json({ progress: created }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError("Validation failed", error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }))).toResponse();
    }
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
