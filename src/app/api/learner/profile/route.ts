import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, and, isNull } from "drizzle-orm";

// GET /api/learner/profile - Get current learner's profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the learner profile for this user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    if (!learner) {
      // Return default profile for new users
      return NextResponse.json({
        learner: null,
        needsProfile: true,
      });
    }

    // Get progress data for this learner
    const progressData = await db
      .select({
        subjectId: learnerSubjectProgress.subjectId,
        masteryLevel: learnerSubjectProgress.masteryLevel,
        completedLessons: learnerSubjectProgress.completedLessons,
        totalLessons: learnerSubjectProgress.totalLessons,
        currentStreak: learnerSubjectProgress.currentStreak,
        lastActivityAt: learnerSubjectProgress.lastActivityAt,
      })
      .from(learnerSubjectProgress)
      .where(eq(learnerSubjectProgress.learnerId, learner.id));

    // Calculate overall progress
    const overallProgress = progressData.length > 0
      ? Math.round(
          progressData.reduce((acc, p) => {
            const total = p.totalLessons ?? 0;
            const completed = p.completedLessons ?? 0;
            const completion = total > 0 ? (completed / total) * 100 : 0;
            return acc + completion;
          }, 0) / progressData.length
        )
      : 0;

    const overallMastery = progressData.length > 0
      ? Math.round(
          progressData.reduce((acc, p) => acc + (p.masteryLevel || 0), 0) / progressData.length
        )
      : 0;

    const currentStreak = Math.max(...progressData.map((p) => p.currentStreak || 0), 0);

    return NextResponse.json({
      learner: {
        id: learner.id,
        name: learner.name,
        gradeLevel: learner.gradeLevel,
        avatarUrl: learner.avatarUrl,
        preferences: learner.preferences,
        dateOfBirth: learner.dateOfBirth?.toISOString() || null,
      },
      progress: {
        overallProgress,
        overallMastery,
        currentStreak,
        subjects: progressData.map((p) => {
          const total = p.totalLessons ?? 0;
          const completed = p.completedLessons ?? 0;
          return {
            subjectId: p.subjectId,
            masteryLevel: p.masteryLevel ?? 0,
            completedLessons: completed,
            totalLessons: total,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        }),
      },
      needsProfile: false,
    });
  } catch (error) {
    console.error("Error fetching learner profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch learner profile" },
      { status: 500 }
    );
  }
}
