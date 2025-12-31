/**
 * Progress Aggregation Service
 *
 * Handles updating learner progress at various levels (lesson, unit, subject)
 * when activities are completed. Includes streak calculation logic.
 */

import { db } from "@/lib/db";
import {
  learnerSubjectProgress,
  lessonProgress,
  unitProgress,
  conceptMastery,
  activityAttempts,
} from "@/lib/db/schema/progress";
import { lessons, units, activities } from "@/lib/db/schema/curriculum";
import { eq, and, sql, gte, count, avg, isNull } from "drizzle-orm";
import { checkAndAwardAchievements } from "./achievement-service";

interface UpdateProgressParams {
  learnerId: string;
  lessonId: string;
  organizationId: string;
  timeSpent?: number;
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  streakUpdated: boolean;
}

/**
 * Calculate streak based on activity history
 * A streak is maintained by having activity on consecutive days
 */
export async function calculateStreak(
  learnerId: string,
  subjectId: string
): Promise<StreakResult> {
  // Get all unique dates with activity in the last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Get activity dates for this learner and subject
  const activityDates = await db
    .selectDistinct({
      date: sql<string>`date(${activityAttempts.completedAt})`,
    })
    .from(activityAttempts)
    .innerJoin(activities, eq(activityAttempts.activityId, activities.id))
    .innerJoin(lessons, eq(activities.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(
      and(
        eq(activityAttempts.learnerId, learnerId),
        eq(units.subjectId, subjectId),
        gte(activityAttempts.completedAt, ninetyDaysAgo)
      )
    )
    .orderBy(sql`date(${activityAttempts.completedAt}) DESC`);

  if (activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakUpdated: false };
  }

  // Parse dates and sort descending
  const dates = activityDates
    .map((d) => new Date(d.date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Calculate current streak (must include today or yesterday)
  let currentStreak = 0;
  const latestActivity = dates[0];
  latestActivity.setHours(0, 0, 0, 0);

  // Check if streak is still active (activity today or yesterday)
  const isStreakActive =
    latestActivity.getTime() === today.getTime() ||
    latestActivity.getTime() === yesterday.getTime();

  if (isStreakActive) {
    currentStreak = 1;
    let prevDate = latestActivity;

    for (let i = 1; i < dates.length; i++) {
      const currentDate = dates[i];
      currentDate.setHours(0, 0, 0, 0);

      const expectedPrev = new Date(prevDate);
      expectedPrev.setDate(expectedPrev.getDate() - 1);

      if (currentDate.getTime() === expectedPrev.getTime()) {
        currentStreak++;
        prevDate = currentDate;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all dates
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = dates[i - 1];
    const currentDate = dates[i];

    const expectedDate = new Date(prevDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (currentDate.getTime() === expectedDate.getTime()) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // If current streak is active, update longest if needed
  if (isStreakActive) {
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return {
    currentStreak,
    longestStreak,
    streakUpdated: isStreakActive,
  };
}

/**
 * Update subject-level progress when a lesson is completed
 */
export async function updateSubjectProgress(
  learnerId: string,
  subjectId: string,
  organizationId: string,
  timeSpent: number = 0
): Promise<void> {
  // Calculate completed lessons for this subject
  const completedLessonsResult = await db
    .select({ count: count() })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(
      and(
        eq(lessonProgress.learnerId, learnerId),
        eq(units.subjectId, subjectId),
        eq(lessonProgress.status, "completed")
      )
    );

  // Calculate total lessons in subject
  const totalLessonsResult = await db
    .select({ count: count() })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(
      and(
        eq(units.subjectId, subjectId),
        isNull(lessons.deletedAt)
      )
    );

  // Calculate average mastery from concept mastery
  const masteryResult = await db
    .select({ avgMastery: avg(conceptMastery.masteryLevel) })
    .from(conceptMastery)
    .innerJoin(
      db
        .select({ conceptId: sql<string>`concepts.id` })
        .from(sql`concepts`)
        .innerJoin(lessons, eq(sql`concepts.lesson_id`, lessons.id))
        .innerJoin(units, eq(lessons.unitId, units.id))
        .where(eq(units.subjectId, subjectId))
        .as("subject_concepts"),
      eq(conceptMastery.conceptId, sql`subject_concepts.concept_id`)
    )
    .where(eq(conceptMastery.learnerId, learnerId));

  // Calculate streak
  const streak = await calculateStreak(learnerId, subjectId);

  const completedLessons = completedLessonsResult[0]?.count ?? 0;
  const totalLessons = totalLessonsResult[0]?.count ?? 0;
  const masteryLevel = masteryResult[0]?.avgMastery ?? 0;

  // Upsert subject progress
  const existing = await db.query.learnerSubjectProgress.findFirst({
    where: and(
      eq(learnerSubjectProgress.learnerId, learnerId),
      eq(learnerSubjectProgress.subjectId, subjectId)
    ),
  });

  if (existing) {
    await db
      .update(learnerSubjectProgress)
      .set({
        completedLessons,
        totalLessons,
        masteryLevel: Number(masteryLevel),
        currentStreak: streak.currentStreak,
        longestStreak: Math.max(existing.longestStreak ?? 0, streak.longestStreak),
        totalTimeSpent: (existing.totalTimeSpent ?? 0) + timeSpent,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(learnerSubjectProgress.id, existing.id));
  } else {
    await db.insert(learnerSubjectProgress).values({
      learnerId,
      subjectId,
      organizationId,
      completedLessons,
      totalLessons,
      masteryLevel: Number(masteryLevel),
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalTimeSpent: timeSpent,
      lastActivityAt: new Date(),
    });
  }
}

/**
 * Update unit-level progress based on lesson completions
 */
export async function updateUnitProgress(
  learnerId: string,
  unitId: string,
  organizationId: string,
  timeSpent: number = 0
): Promise<void> {
  // Calculate completed lessons in this unit
  const completedResult = await db
    .select({ count: count() })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .where(
      and(
        eq(lessonProgress.learnerId, learnerId),
        eq(lessons.unitId, unitId),
        eq(lessonProgress.status, "completed")
      )
    );

  // Total lessons in unit
  const totalResult = await db
    .select({ count: count() })
    .from(lessons)
    .where(
      and(
        eq(lessons.unitId, unitId),
        isNull(lessons.deletedAt)
      )
    );

  const completed = completedResult[0]?.count ?? 0;
  const total = totalResult[0]?.count ?? 0;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = total > 0 && completed >= total;

  // Upsert unit progress
  const existing = await db.query.unitProgress.findFirst({
    where: and(
      eq(unitProgress.learnerId, learnerId),
      eq(unitProgress.unitId, unitId)
    ),
  });

  if (existing) {
    await db
      .update(unitProgress)
      .set({
        status: isComplete ? "completed" : "in_progress",
        progressPercent,
        timeSpent: (existing.timeSpent ?? 0) + timeSpent,
        completedAt: isComplete && !existing.completedAt ? new Date() : existing.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(unitProgress.id, existing.id));
  } else {
    await db.insert(unitProgress).values({
      learnerId,
      unitId,
      organizationId,
      status: isComplete ? "completed" : "in_progress",
      progressPercent,
      timeSpent,
      startedAt: new Date(),
      completedAt: isComplete ? new Date() : null,
    });
  }
}

interface NewAchievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: string;
  points: number | null;
  earnedAt: Date;
}

interface AggregationResult {
  lessonComplete: boolean;
  unitComplete: boolean;
  streak: StreakResult;
  newAchievements: NewAchievement[];
  achievementPoints: number;
}

/**
 * Main entry point: Update all progress levels when an activity is completed
 */
export async function aggregateProgressOnCompletion(
  params: UpdateProgressParams
): Promise<AggregationResult> {
  const { learnerId, lessonId, organizationId, timeSpent = 0 } = params;

  // Get the lesson's unit and subject
  const lessonData = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: {
        with: {
          subject: true,
        },
      },
    },
  });

  if (!lessonData?.unit?.subject) {
    return {
      lessonComplete: false,
      unitComplete: false,
      streak: { currentStreak: 0, longestStreak: 0, streakUpdated: false },
      newAchievements: [],
      achievementPoints: 0,
    };
  }

  const unitId = lessonData.unit.id;
  const subjectId = lessonData.unit.subject.id;

  // Check if lesson is now complete
  const lessonProgressData = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.learnerId, learnerId),
      eq(lessonProgress.lessonId, lessonId)
    ),
  });

  const lessonComplete = lessonProgressData?.status === "completed";

  // Update unit progress
  await updateUnitProgress(learnerId, unitId, organizationId, timeSpent);

  // Check if unit is now complete
  const unitProgressData = await db.query.unitProgress.findFirst({
    where: and(
      eq(unitProgress.learnerId, learnerId),
      eq(unitProgress.unitId, unitId)
    ),
  });

  const unitComplete = unitProgressData?.status === "completed";

  // Update subject progress (includes streak calculation)
  await updateSubjectProgress(learnerId, subjectId, organizationId, timeSpent);

  // Get final streak
  const streak = await calculateStreak(learnerId, subjectId);

  // Check and award achievements
  const achievementResult = await checkAndAwardAchievements(learnerId, organizationId);

  return {
    lessonComplete,
    unitComplete,
    streak,
    newAchievements: achievementResult.newAchievements,
    achievementPoints: achievementResult.totalPoints,
  };
}
