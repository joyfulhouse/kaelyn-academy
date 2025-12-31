import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  achievements,
  learnerAchievements,
  learnerSubjectProgress,
  conceptMastery,
} from "@/lib/db/schema/progress";
import { learners } from "@/lib/db/schema/users";
import { eq, and, sql, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ValidationError } from "@/lib/validation";

// Query schema for GET
const achievementsQuerySchema = z.object({
  learnerId: z.string().uuid().optional(),
});

// GET /api/achievements - Get all achievements and earned ones for a learner
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = achievementsQuerySchema.parse(params);

    let learnerId = query.learnerId;

    // If no learnerId provided, try to get the first learner for this user
    if (!learnerId) {
      const userLearners = await db.query.learners.findMany({
        where: and(
          eq(learners.userId, session.user.id),
          isNull(learners.deletedAt)
        ),
        limit: 1,
      });

      if (userLearners.length > 0) {
        learnerId = userLearners[0].id;
      }
    } else {
      // Verify the user has access to this learner
      const learnerAccess = await db.query.learners.findFirst({
        where: and(
          eq(learners.id, learnerId),
          eq(learners.userId, session.user.id),
          isNull(learners.deletedAt)
        ),
      });

      if (!learnerAccess) {
        return NextResponse.json(
          { error: "Learner not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Get all available achievements
    const allAchievements = await db.query.achievements.findMany({
      orderBy: [achievements.type, achievements.points],
    });

    // If we have a learner, get their earned achievements
    let earnedAchievements: Array<{
      achievementId: string;
      earnedAt: Date;
    }> = [];

    let currentStreak = 0;
    let longestStreak = 0;
    let totalLessonsCompleted = 0;
    let totalConceptsMastered = 0;

    if (learnerId) {
      // Get earned achievements
      const earned = await db.query.learnerAchievements.findMany({
        where: eq(learnerAchievements.learnerId, learnerId),
      });
      earnedAchievements = earned.map((e) => ({
        achievementId: e.achievementId,
        earnedAt: e.earnedAt,
      }));

      // Get current streak from subject progress
      const subjectProgress = await db.query.learnerSubjectProgress.findMany({
        where: eq(learnerSubjectProgress.learnerId, learnerId),
      });

      currentStreak = Math.max(...subjectProgress.map((s) => s.currentStreak || 0), 0);
      longestStreak = Math.max(...subjectProgress.map((s) => s.longestStreak || 0), 0);
      totalLessonsCompleted = subjectProgress.reduce((sum, s) => sum + (s.completedLessons || 0), 0);

      // Get total concepts mastered
      const masteredConcepts = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(conceptMastery)
        .where(
          and(
            eq(conceptMastery.learnerId, learnerId),
            sql`${conceptMastery.masteryLevel} >= 80`
          )
        );
      totalConceptsMastered = masteredConcepts[0]?.count || 0;
    }

    // Map achievements with earned status
    const achievementsWithStatus = allAchievements.map((achievement) => {
      const earned = earnedAchievements.find((e) => e.achievementId === achievement.id);

      // Calculate progress towards this achievement
      let progress = 0;
      const criteria = achievement.criteria as {
        type: string;
        threshold: number;
        subjectId?: string;
      } | null;

      if (criteria) {
        switch (criteria.type) {
          case "streak_days":
            progress = Math.min(100, (currentStreak / criteria.threshold) * 100);
            break;
          case "lessons_completed":
            progress = Math.min(100, (totalLessonsCompleted / criteria.threshold) * 100);
            break;
          case "mastery_level":
            progress = Math.min(100, (totalConceptsMastered / criteria.threshold) * 100);
            break;
        }
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        type: achievement.type,
        points: achievement.points,
        criteria: achievement.criteria,
        earned: !!earned,
        earnedAt: earned?.earnedAt?.toISOString() || null,
        progress: Math.round(progress),
      };
    });

    // Calculate total points earned
    const totalPoints = achievementsWithStatus
      .filter((a) => a.earned)
      .reduce((sum, a) => sum + (a.points || 0), 0);

    const totalPossiblePoints = achievementsWithStatus.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    );

    // Find next achievement to unlock (not earned, closest to completion)
    const nextAchievement = achievementsWithStatus
      .filter((a) => !a.earned)
      .sort((a, b) => b.progress - a.progress)[0] || null;

    return NextResponse.json({
      achievements: achievementsWithStatus,
      stats: {
        earned: earnedAchievements.length,
        total: allAchievements.length,
        totalPoints,
        totalPossiblePoints,
        currentStreak,
        longestStreak,
      },
      nextAchievement,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError(
        "Validation failed",
        error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      ).toResponse();
    }
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Award an achievement to a learner
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { learnerId, achievementId } = body;

    if (!learnerId || !achievementId) {
      return NextResponse.json(
        { error: "learnerId and achievementId are required" },
        { status: 400 }
      );
    }

    // Verify the learner belongs to this user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, learnerId),
        eq(learners.userId, session.user.id)
      ),
    });

    if (!learner) {
      return NextResponse.json(
        { error: "Learner not found or access denied" },
        { status: 404 }
      );
    }

    // Check if achievement already earned
    const existing = await db.query.learnerAchievements.findFirst({
      where: and(
        eq(learnerAchievements.learnerId, learnerId),
        eq(learnerAchievements.achievementId, achievementId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Achievement already earned" },
        { status: 400 }
      );
    }

    // Award the achievement
    const [awarded] = await db
      .insert(learnerAchievements)
      .values({
        learnerId,
        achievementId,
        organizationId: learner.organizationId,
        earnedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ achievement: awarded }, { status: 201 });
  } catch (error) {
    console.error("Error awarding achievement:", error);
    return NextResponse.json(
      { error: "Failed to award achievement" },
      { status: 500 }
    );
  }
}
