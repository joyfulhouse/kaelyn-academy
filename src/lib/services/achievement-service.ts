/**
 * Achievement Unlock Service
 *
 * Automatically checks and awards achievements based on learner progress.
 * Called after progress updates to evaluate all relevant achievement criteria.
 */

import { db } from "@/lib/db";
import {
  achievements,
  learnerAchievements,
  learnerSubjectProgress,
  lessonProgress,
} from "@/lib/db/schema/progress";
import { eq, and, sql, count, notExists } from "drizzle-orm";

interface AchievementCriteria {
  type: "streak_days" | "lessons_completed" | "mastery_level" | "subject_completion" | "custom";
  threshold: number;
  subjectId?: string;
  gradeLevel?: number;
}

interface EarnedAchievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  type: string;
  points: number | null;
  earnedAt: Date;
}

interface CheckAchievementsResult {
  newAchievements: EarnedAchievement[];
  totalPoints: number;
}

/**
 * Check all achievements for a learner and award any newly earned ones
 */
export async function checkAndAwardAchievements(
  learnerId: string,
  organizationId: string
): Promise<CheckAchievementsResult> {
  const newAchievements: EarnedAchievement[] = [];

  // Get all achievements the learner hasn't earned yet
  const unearnedAchievements = await db
    .select()
    .from(achievements)
    .where(
      notExists(
        db
          .select()
          .from(learnerAchievements)
          .where(
            and(
              eq(learnerAchievements.achievementId, achievements.id),
              eq(learnerAchievements.learnerId, learnerId)
            )
          )
      )
    );

  // Get learner's current progress stats
  const progressStats = await getLearnerProgressStats(learnerId);

  for (const achievement of unearnedAchievements) {
    const criteria = achievement.criteria as AchievementCriteria | null;
    if (!criteria) continue;

    const earned = await evaluateCriteria(learnerId, criteria, progressStats);

    if (earned) {
      // Award the achievement
      const now = new Date();
      await db.insert(learnerAchievements).values({
        learnerId,
        achievementId: achievement.id,
        organizationId,
        earnedAt: now,
      });

      newAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        type: achievement.type,
        points: achievement.points,
        earnedAt: now,
      });
    }
  }

  const totalPoints = newAchievements.reduce(
    (sum, a) => sum + (a.points ?? 0),
    0
  );

  return { newAchievements, totalPoints };
}

interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalLessonsCompleted: number;
  averageMastery: number;
  subjectProgress: Map<string, SubjectStats>;
}

interface SubjectStats {
  completedLessons: number;
  totalLessons: number;
  masteryLevel: number;
  currentStreak: number;
}

async function getLearnerProgressStats(learnerId: string): Promise<ProgressStats> {
  // Get subject-level progress
  const subjectData = await db
    .select()
    .from(learnerSubjectProgress)
    .where(eq(learnerSubjectProgress.learnerId, learnerId));

  const subjectProgress = new Map<string, SubjectStats>();
  let maxStreak = 0;
  let maxLongestStreak = 0;

  for (const sp of subjectData) {
    subjectProgress.set(sp.subjectId, {
      completedLessons: sp.completedLessons ?? 0,
      totalLessons: sp.totalLessons ?? 0,
      masteryLevel: sp.masteryLevel ?? 0,
      currentStreak: sp.currentStreak ?? 0,
    });
    maxStreak = Math.max(maxStreak, sp.currentStreak ?? 0);
    maxLongestStreak = Math.max(maxLongestStreak, sp.longestStreak ?? 0);
  }

  // Get total completed lessons
  const completedResult = await db
    .select({ count: count() })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.learnerId, learnerId),
        eq(lessonProgress.status, "completed")
      )
    );

  // Calculate average mastery across all subjects
  const totalMastery = Array.from(subjectProgress.values()).reduce(
    (sum, sp) => sum + sp.masteryLevel,
    0
  );
  const avgMastery =
    subjectProgress.size > 0 ? totalMastery / subjectProgress.size : 0;

  return {
    currentStreak: maxStreak,
    longestStreak: maxLongestStreak,
    totalLessonsCompleted: completedResult[0]?.count ?? 0,
    averageMastery: avgMastery,
    subjectProgress,
  };
}

async function evaluateCriteria(
  learnerId: string,
  criteria: AchievementCriteria,
  stats: ProgressStats
): Promise<boolean> {
  switch (criteria.type) {
    case "streak_days": {
      // Check if current streak meets threshold
      if (criteria.subjectId) {
        const subjectStats = stats.subjectProgress.get(criteria.subjectId);
        return (subjectStats?.currentStreak ?? 0) >= criteria.threshold;
      }
      return stats.currentStreak >= criteria.threshold;
    }

    case "lessons_completed": {
      // Check total lessons completed
      if (criteria.subjectId) {
        const subjectStats = stats.subjectProgress.get(criteria.subjectId);
        return (subjectStats?.completedLessons ?? 0) >= criteria.threshold;
      }
      return stats.totalLessonsCompleted >= criteria.threshold;
    }

    case "mastery_level": {
      // Check if mastery meets threshold
      if (criteria.subjectId) {
        const subjectStats = stats.subjectProgress.get(criteria.subjectId);
        return (subjectStats?.masteryLevel ?? 0) >= criteria.threshold;
      }
      return stats.averageMastery >= criteria.threshold;
    }

    case "subject_completion": {
      // Check if subject is fully completed
      if (criteria.subjectId) {
        const subjectStats = stats.subjectProgress.get(criteria.subjectId);
        if (!subjectStats) return false;
        return (
          subjectStats.totalLessons > 0 &&
          subjectStats.completedLessons >= subjectStats.totalLessons
        );
      }
      // Without subjectId, check if any subject is complete
      for (const sp of stats.subjectProgress.values()) {
        if (sp.totalLessons > 0 && sp.completedLessons >= sp.totalLessons) {
          return true;
        }
      }
      return false;
    }

    case "custom": {
      // Custom achievements require specific logic
      // These can be handled by specific achievement IDs or extended criteria
      return false;
    }

    default:
      return false;
  }
}

/**
 * Get all achievements earned by a learner
 */
export async function getLearnerAchievements(
  learnerId: string
): Promise<EarnedAchievement[]> {
  const earned = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      iconUrl: achievements.iconUrl,
      type: achievements.type,
      points: achievements.points,
      earnedAt: learnerAchievements.earnedAt,
    })
    .from(learnerAchievements)
    .innerJoin(achievements, eq(learnerAchievements.achievementId, achievements.id))
    .where(eq(learnerAchievements.learnerId, learnerId))
    .orderBy(sql`${learnerAchievements.earnedAt} DESC`);

  return earned;
}

/**
 * Get total points earned by a learner
 */
export async function getLearnerTotalPoints(learnerId: string): Promise<number> {
  const result = await db
    .select({
      totalPoints: sql<number>`COALESCE(SUM(${achievements.points}), 0)::int`,
    })
    .from(learnerAchievements)
    .innerJoin(achievements, eq(learnerAchievements.achievementId, achievements.id))
    .where(eq(learnerAchievements.learnerId, learnerId));

  return result[0]?.totalPoints ?? 0;
}

/**
 * Get achievement progress for a specific achievement
 * Returns current value and threshold for progress bar display
 */
export async function getAchievementProgress(
  learnerId: string,
  achievementId: string
): Promise<{ current: number; threshold: number; percentComplete: number } | null> {
  const achievement = await db.query.achievements.findFirst({
    where: eq(achievements.id, achievementId),
  });

  if (!achievement?.criteria) return null;

  const criteria = achievement.criteria as AchievementCriteria;
  const stats = await getLearnerProgressStats(learnerId);

  let current = 0;

  switch (criteria.type) {
    case "streak_days":
      current = criteria.subjectId
        ? stats.subjectProgress.get(criteria.subjectId)?.currentStreak ?? 0
        : stats.currentStreak;
      break;

    case "lessons_completed":
      current = criteria.subjectId
        ? stats.subjectProgress.get(criteria.subjectId)?.completedLessons ?? 0
        : stats.totalLessonsCompleted;
      break;

    case "mastery_level":
      current = criteria.subjectId
        ? stats.subjectProgress.get(criteria.subjectId)?.masteryLevel ?? 0
        : stats.averageMastery;
      break;

    case "subject_completion":
      if (criteria.subjectId) {
        const sp = stats.subjectProgress.get(criteria.subjectId);
        current = sp?.totalLessons ? (sp.completedLessons / sp.totalLessons) * 100 : 0;
      }
      break;
  }

  const percentComplete = Math.min(
    100,
    Math.round((current / criteria.threshold) * 100)
  );

  return {
    current,
    threshold: criteria.threshold,
    percentComplete,
  };
}
