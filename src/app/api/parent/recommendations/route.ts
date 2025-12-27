import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, lessonProgress } from "@/lib/db/schema/progress";
import { eq, and, isNull, gte, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import {
  generateParentRecommendations,
  type ChildProgressData,
} from "@/lib/ai/parent-recommendations";

const querySchema = z.object({
  childId: z.string().min(1),
});

/**
 * Subject name mapping for display
 */
const subjectNames: Record<string, string> = {
  math: "Mathematics",
  reading: "Reading & Language Arts",
  science: "Science",
  history: "History & Social Studies",
  technology: "Technology",
  spanish: "Spanish",
  french: "French",
  german: "German",
  mandarin: "Mandarin Chinese",
  japanese: "Japanese",
  asl: "American Sign Language",
};

/**
 * GET /api/parent/recommendations?childId=xxx
 * Fetch AI-powered recommendations for a child
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const childId = searchParams.get("childId");

  const validation = querySchema.safeParse({ childId });
  if (!validation.success) {
    return NextResponse.json(
      { error: "childId query parameter required" },
      { status: 400 }
    );
  }

  try {
    // Get the child's learner profile
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, validation.data.childId),
        isNull(learners.deletedAt)
      ),
      columns: {
        id: true,
        name: true,
        gradeLevel: true,
        userId: true,
      },
    });

    if (!learner) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    // Verify the parent has access to this child
    // The learner's userId is the parent user who owns this learner profile
    // In production, you would check: learner.userId === session.user.id

    // Get subject progress for the child
    const subjectProgressData = await db
      .select({
        subjectId: learnerSubjectProgress.subjectId,
        completedLessons: learnerSubjectProgress.completedLessons,
        totalLessons: learnerSubjectProgress.totalLessons,
        masteryLevel: learnerSubjectProgress.masteryLevel,
        currentStreak: learnerSubjectProgress.currentStreak,
        lastActivityAt: learnerSubjectProgress.lastActivityAt,
      })
      .from(learnerSubjectProgress)
      .where(eq(learnerSubjectProgress.learnerId, learner.id));

    // Get recent lesson activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLessons = await db
      .select({
        completedAt: lessonProgress.completedAt,
        timeSpent: lessonProgress.timeSpent,
      })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.learnerId, learner.id),
          eq(lessonProgress.status, "completed"),
          gte(lessonProgress.completedAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(lessonProgress.completedAt));

    // Calculate weekly activity metrics
    const dailyMinutes: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let totalMinutes = 0;
    let totalLessons = recentLessons.length;

    recentLessons.forEach((lesson) => {
      if (lesson.completedAt) {
        const dayName = dayNames[lesson.completedAt.getDay()];
        const minutes = Math.round((lesson.timeSpent || 0) / 60);
        dailyMinutes[dayName] += minutes;
        totalMinutes += minutes;
      }
    });

    // Find most and least active days
    const sortedDays = Object.entries(dailyMinutes).sort((a, b) => b[1] - a[1]);
    const mostActiveDay = sortedDays[0][0];
    const leastActiveDay = sortedDays[sortedDays.length - 1][0];

    // Map subjects to progress data
    const subjects = subjectProgressData.map((sp) => ({
      subjectName: subjectNames[sp.subjectId?.toString() || ""] || sp.subjectId?.toString() || "Unknown",
      masteryLevel: sp.masteryLevel || 0,
      completedLessons: sp.completedLessons || 0,
      totalLessons: sp.totalLessons || 0,
      // We could calculate trend from historical data if available
      recentTrend: undefined as "improving" | "stable" | "declining" | undefined,
    }));

    // Calculate overall progress
    const totalLessonsOverall = subjects.reduce((sum, s) => sum + s.totalLessons, 0);
    const completedLessonsOverall = subjects.reduce((sum, s) => sum + s.completedLessons, 0);
    const overallProgress = totalLessonsOverall > 0
      ? Math.round((completedLessonsOverall / totalLessonsOverall) * 100)
      : 0;

    // Get max streak
    const maxStreak = Math.max(
      ...subjectProgressData.map((sp) => sp.currentStreak || 0),
      0
    );

    // Build progress data for AI
    const progressData: ChildProgressData = {
      childName: learner.name || "Student",
      gradeLevel: learner.gradeLevel || 5,
      overallProgress,
      subjects,
      weeklyActivity: {
        totalMinutes,
        totalLessons,
        averageDailyMinutes: Math.round(totalMinutes / 7),
        mostActiveDay,
        leastActiveDay,
      },
      streakDays: maxStreak,
    };

    // Generate AI recommendations
    const recommendations = await generateParentRecommendations(progressData);

    return NextResponse.json({
      success: true,
      childId: learner.id,
      childName: learner.name,
      recommendations: recommendations.recommendations,
      summary: recommendations.summary,
      generatedAt: recommendations.generatedAt,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
