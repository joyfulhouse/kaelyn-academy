import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { learners } from "@/lib/db/schema/users";
import {
  learnerSubjectProgress,
  lessonProgress,
  conceptMastery,
} from "@/lib/db/schema/progress";
import {
  subjects,
  units,
  lessons,
  concepts,
} from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc, lt, asc } from "drizzle-orm";

export interface LearnerRecommendation {
  id: string;
  type: "next_lesson" | "review" | "practice" | "challenge" | "explore";
  title: string;
  description: string;
  subjectName: string;
  subjectColor: string | null;
  lessonId?: string;
  conceptId?: string;
  priority: number;
  reason: string;
  icon: "sparkles" | "rocket" | "target" | "star" | "book";
}

// GET /api/learner/recommendations - Get personalized recommendations
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get learner profile
  const [learner] = await db
    .select({
      id: learners.id,
      gradeLevel: learners.gradeLevel,
      organizationId: learners.organizationId,
    })
    .from(learners)
    .where(
      and(eq(learners.userId, session.user.id), isNull(learners.deletedAt))
    )
    .limit(1);

  if (!learner) {
    return NextResponse.json(
      { error: "Learner profile not found" },
      { status: 404 }
    );
  }

  try {
    const recommendations: LearnerRecommendation[] = [];
    const now = new Date();

    // 1. Get subject progress to find what to recommend
    const subjectProgressData = await db
      .select({
        subjectId: learnerSubjectProgress.subjectId,
        subjectName: subjects.name,
        subjectColor: subjects.color,
        masteryLevel: learnerSubjectProgress.masteryLevel,
        completedLessons: learnerSubjectProgress.completedLessons,
        totalLessons: learnerSubjectProgress.totalLessons,
        currentStreak: learnerSubjectProgress.currentStreak,
        lastActivityAt: learnerSubjectProgress.lastActivityAt,
      })
      .from(learnerSubjectProgress)
      .innerJoin(subjects, eq(learnerSubjectProgress.subjectId, subjects.id))
      .where(eq(learnerSubjectProgress.learnerId, learner.id))
      .orderBy(asc(learnerSubjectProgress.masteryLevel));

    // 2. Find lessons in progress (started but not completed)
    const inProgressLessons = await db
      .select({
        lessonId: lessonProgress.lessonId,
        lessonTitle: lessons.title,
        subjectName: subjects.name,
        subjectColor: subjects.color,
        completedAt: lessonProgress.completedAt,
        updatedAt: lessonProgress.updatedAt,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(units, eq(lessons.unitId, units.id))
      .innerJoin(subjects, eq(units.subjectId, subjects.id))
      .where(
        and(
          eq(lessonProgress.learnerId, learner.id),
          isNull(lessonProgress.completedAt) // Not completed yet
        )
      )
      .orderBy(desc(lessonProgress.updatedAt))
      .limit(3);

    // Add "continue learning" recommendations
    for (const lesson of inProgressLessons) {
      recommendations.push({
        id: `continue-${lesson.lessonId}`,
        type: "next_lesson",
        title: `Continue: ${lesson.lessonTitle}`,
        description: "Pick up where you left off",
        subjectName: lesson.subjectName,
        subjectColor: lesson.subjectColor,
        lessonId: lesson.lessonId,
        priority: 100,
        reason: "You started this lesson - let's finish it!",
        icon: "rocket",
      });
    }

    // 3. Find concepts that need review (low mastery)
    const weakConcepts = await db
      .select({
        conceptId: conceptMastery.conceptId,
        conceptName: concepts.title,
        masteryLevel: conceptMastery.masteryLevel,
        subjectName: subjects.name,
        subjectColor: subjects.color,
        lessonId: lessons.id,
        lessonTitle: lessons.title,
      })
      .from(conceptMastery)
      .innerJoin(concepts, eq(conceptMastery.conceptId, concepts.id))
      .innerJoin(lessons, eq(concepts.lessonId, lessons.id))
      .innerJoin(units, eq(lessons.unitId, units.id))
      .innerJoin(subjects, eq(units.subjectId, subjects.id))
      .where(
        and(
          eq(conceptMastery.learnerId, learner.id),
          lt(conceptMastery.masteryLevel, 50)
        )
      )
      .orderBy(asc(conceptMastery.masteryLevel))
      .limit(2);

    // Add review recommendations
    for (const concept of weakConcepts) {
      recommendations.push({
        id: `review-${concept.conceptId}`,
        type: "review",
        title: `Review: ${concept.conceptName}`,
        description: `Practice makes perfect! Your mastery is ${concept.masteryLevel}%`,
        subjectName: concept.subjectName,
        subjectColor: concept.subjectColor,
        conceptId: concept.conceptId,
        lessonId: concept.lessonId,
        priority: 80,
        reason: "A little review will help this stick!",
        icon: "target",
      });
    }

    // 4. Suggest next lessons for subjects with good progress
    for (const sp of subjectProgressData) {
      if (
        sp.completedLessons !== null &&
        sp.totalLessons !== null &&
        sp.completedLessons < sp.totalLessons
      ) {
        // Find next incomplete lesson in this subject
        const nextLesson = await db
          .select({
            lessonId: lessons.id,
            lessonTitle: lessons.title,
            unitTitle: units.title,
          })
          .from(lessons)
          .innerJoin(units, eq(lessons.unitId, units.id))
          .leftJoin(
            lessonProgress,
            and(
              eq(lessonProgress.lessonId, lessons.id),
              eq(lessonProgress.learnerId, learner.id)
            )
          )
          .where(
            and(
              eq(units.subjectId, sp.subjectId),
              isNull(lessons.deletedAt),
              isNull(lessonProgress.completedAt) // Not completed
            )
          )
          .orderBy(asc(units.order), asc(lessons.order))
          .limit(1);

        if (nextLesson.length > 0) {
          const lesson = nextLesson[0];
          // Only add if not already in continue recommendations
          if (!recommendations.some((r) => r.lessonId === lesson.lessonId)) {
            recommendations.push({
              id: `next-${lesson.lessonId}`,
              type: "next_lesson",
              title: lesson.lessonTitle,
              description: `Next up in ${sp.subjectName}`,
              subjectName: sp.subjectName,
              subjectColor: sp.subjectColor,
              lessonId: lesson.lessonId,
              priority: 70 + (sp.currentStreak ?? 0),
              reason:
                sp.currentStreak && sp.currentStreak > 0
                  ? `You're on a ${sp.currentStreak}-day streak in ${sp.subjectName}!`
                  : `Keep building your ${sp.subjectName} skills!`,
              icon: "sparkles",
            });
          }
        }
      }
    }

    // 5. Add challenge recommendation if doing well
    const strongSubjects = subjectProgressData.filter(
      (sp) => (sp.masteryLevel ?? 0) >= 80
    );
    if (strongSubjects.length > 0) {
      const strongSubject = strongSubjects[0];
      recommendations.push({
        id: `challenge-${strongSubject.subjectId}`,
        type: "challenge",
        title: `Challenge Yourself in ${strongSubject.subjectName}`,
        description: `You're doing great! Ready for something harder?`,
        subjectName: strongSubject.subjectName,
        subjectColor: strongSubject.subjectColor,
        priority: 60,
        reason: `Your ${strongSubject.subjectName} mastery is ${strongSubject.masteryLevel}% - amazing!`,
        icon: "star",
      });
    }

    // 6. Suggest exploring a new subject if one has no progress
    const allSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        color: subjects.color,
      })
      .from(subjects);

    const subjectsWithProgress = new Set(
      subjectProgressData.map((sp) => sp.subjectId)
    );
    const newSubjects = allSubjects.filter(
      (s) => !subjectsWithProgress.has(s.id)
    );

    if (newSubjects.length > 0 && recommendations.length < 6) {
      const newSubject = newSubjects[0];
      recommendations.push({
        id: `explore-${newSubject.id}`,
        type: "explore",
        title: `Explore ${newSubject.name}`,
        description: "Start a new learning adventure!",
        subjectName: newSubject.name,
        subjectColor: newSubject.color,
        priority: 40,
        reason: "Discover something new today!",
        icon: "book",
      });
    }

    // Sort by priority and limit to 5
    const sortedRecommendations = recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    return NextResponse.json({
      recommendations: sortedRecommendations,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
