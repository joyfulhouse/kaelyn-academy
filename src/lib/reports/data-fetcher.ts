/**
 * Report Data Fetcher
 * Database queries for generating reports with real data
 */

import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import {
  learnerSubjectProgress,
  lessonProgress as lessonProgressTable,
  activityAttempts,
} from "@/lib/db/schema/progress";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import type {
  ProgressReportData,
  ActivityReportData,
  GradesReportData,
} from "./types";

/**
 * Calculate letter grade from percentage
 */
function getLetterGrade(percentage: number): { letter: string; points: number } {
  if (percentage >= 97) return { letter: "A+", points: 4.0 };
  if (percentage >= 93) return { letter: "A", points: 4.0 };
  if (percentage >= 90) return { letter: "A-", points: 3.7 };
  if (percentage >= 87) return { letter: "B+", points: 3.3 };
  if (percentage >= 83) return { letter: "B", points: 3.0 };
  if (percentage >= 80) return { letter: "B-", points: 2.7 };
  if (percentage >= 77) return { letter: "C+", points: 2.3 };
  if (percentage >= 73) return { letter: "C", points: 2.0 };
  if (percentage >= 70) return { letter: "C-", points: 1.7 };
  if (percentage >= 67) return { letter: "D+", points: 1.3 };
  if (percentage >= 63) return { letter: "D", points: 1.0 };
  if (percentage >= 60) return { letter: "D-", points: 0.7 };
  return { letter: "F", points: 0.0 };
}

/**
 * Get subject name mapping
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
 * Fetch progress report data from database
 */
export async function fetchProgressReportData(
  learnerId: string
): Promise<ProgressReportData | null> {
  // Get learner info
  const learner = await db.query.learners.findFirst({
    where: eq(learners.id, learnerId),
    columns: {
      id: true,
      name: true,
      gradeLevel: true,
    },
  });

  if (!learner) return null;

  // Get subject progress
  const subjectProgress = await db
    .select({
      subjectId: learnerSubjectProgress.subjectId,
      completedLessons: learnerSubjectProgress.completedLessons,
      totalLessons: learnerSubjectProgress.totalLessons,
      completedUnits: learnerSubjectProgress.completedUnits,
      totalUnits: learnerSubjectProgress.totalUnits,
      masteryLevel: learnerSubjectProgress.masteryLevel,
      totalTimeSpent: learnerSubjectProgress.totalTimeSpent,
      lastActivityAt: learnerSubjectProgress.lastActivityAt,
      currentStreak: learnerSubjectProgress.currentStreak,
    })
    .from(learnerSubjectProgress)
    .where(eq(learnerSubjectProgress.learnerId, learnerId));

  // Get average scores per subject from activity attempts
  const avgScores = await db
    .select({
      subjectId: sql<string>`LEFT(${activityAttempts.activityId}::text, 36)`,
      avgScore: sql<number>`AVG(${activityAttempts.score})`,
    })
    .from(activityAttempts)
    .where(eq(activityAttempts.learnerId, learnerId))
    .groupBy(sql`LEFT(${activityAttempts.activityId}::text, 36)`);

  const scoreMap = new Map(avgScores.map((s) => [s.subjectId, s.avgScore]));

  // Build subjects array
  const subjects = subjectProgress.map((sp) => {
    const completed = sp.completedLessons ?? 0;
    const total = sp.totalLessons ?? 1;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgScore = scoreMap.get(sp.subjectId?.toString() ?? "") ?? sp.masteryLevel ?? 0;
    const { letter, points } = getLetterGrade(avgScore);

    return {
      subjectId: sp.subjectId?.toString() ?? "",
      subjectName: subjectNames[sp.subjectId?.toString() ?? ""] ?? "Unknown Subject",
      progress,
      grade: letter,
      gradePoints: points,
      unitsCompleted: sp.completedUnits ?? 0,
      unitsTotal: sp.totalUnits ?? 0,
      lessonsCompleted: completed,
      lessonsTotal: total,
      timeSpent: sp.totalTimeSpent ?? 0,
      averageScore: Math.round(avgScore),
      lastActivity: sp.lastActivityAt ?? undefined,
    };
  });

  // Calculate totals
  const totalLessonsCompleted = subjects.reduce((sum, s) => sum + s.lessonsCompleted, 0);
  const totalLessons = subjects.reduce((sum, s) => sum + s.lessonsTotal, 0);
  const totalTimeSpent = subjects.reduce((sum, s) => sum + s.timeSpent, 0);
  const overallProgress = totalLessons > 0
    ? Math.round((totalLessonsCompleted / totalLessons) * 100)
    : 0;
  const maxStreak = Math.max(...subjectProgress.map((sp) => sp.currentStreak ?? 0), 0);

  return {
    student: {
      id: learner.id,
      name: learner.name ?? "Student",
      gradeLevel: learner.gradeLevel ?? 5,
    },
    subjects,
    overallProgress,
    totalTimeSpent,
    lessonsCompleted: totalLessonsCompleted,
    lessonsTotal: totalLessons,
    streak: maxStreak,
    lastActivity: subjects.reduce((latest, s) => {
      if (!s.lastActivity) return latest;
      if (!latest) return s.lastActivity;
      return s.lastActivity > latest ? s.lastActivity : latest;
    }, undefined as Date | undefined),
  };
}

/**
 * Fetch activity report data from database
 */
export async function fetchActivityReportData(
  learnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActivityReportData | null> {
  // Get learner info
  const learner = await db.query.learners.findFirst({
    where: eq(learners.id, learnerId),
    columns: {
      id: true,
      name: true,
      gradeLevel: true,
    },
  });

  if (!learner) return null;

  const dateRange = {
    start: startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: endDate ?? new Date(),
  };

  // Get activity attempts within date range
  const whereConditions = [
    eq(activityAttempts.learnerId, learnerId),
    gte(activityAttempts.startedAt, dateRange.start),
    lte(activityAttempts.startedAt, dateRange.end),
  ];

  const attempts = await db
    .select({
      id: activityAttempts.id,
      activityId: activityAttempts.activityId,
      startedAt: activityAttempts.startedAt,
      completedAt: activityAttempts.completedAt,
      timeSpent: activityAttempts.timeSpent,
      score: activityAttempts.score,
      passed: activityAttempts.passed,
    })
    .from(activityAttempts)
    .where(and(...whereConditions))
    .orderBy(desc(activityAttempts.startedAt))
    .limit(100);

  // Get lesson progress for the date range
  const lessonProgressData = await db
    .select({
      id: lessonProgressTable.id,
      lessonId: lessonProgressTable.lessonId,
      startedAt: lessonProgressTable.startedAt,
      completedAt: lessonProgressTable.completedAt,
      timeSpent: lessonProgressTable.timeSpent,
      status: lessonProgressTable.status,
    })
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.learnerId, learnerId),
        gte(lessonProgressTable.updatedAt, dateRange.start),
        lte(lessonProgressTable.updatedAt, dateRange.end)
      )
    )
    .orderBy(desc(lessonProgressTable.updatedAt))
    .limit(100);

  // Map to activity format
  const activities: ActivityReportData["activities"] = [
    ...attempts.map((a) => ({
      id: a.id,
      timestamp: a.startedAt,
      type: "quiz" as const,
      subjectId: "unknown",
      subjectName: "Quiz Activity",
      title: `Quiz Attempt`,
      duration: a.timeSpent ?? 0,
      score: a.score ?? undefined,
      completed: a.completedAt !== null,
    })),
    ...lessonProgressData.map((l) => ({
      id: l.id,
      timestamp: l.startedAt ?? new Date(),
      type: "lesson" as const,
      subjectId: "unknown",
      subjectName: "Lesson",
      title: `Lesson Progress`,
      duration: l.timeSpent ?? 0,
      completed: l.status === "completed",
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Calculate summary
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const uniqueDays = new Set(
    activities.map((a) => a.timestamp.toDateString())
  ).size;

  // Count by type
  const byType: Record<string, number> = {};
  activities.forEach((a) => {
    byType[a.type] = (byType[a.type] || 0) + 1;
  });

  // Peak hours
  const hourCounts: Record<number, number> = {};
  activities.forEach((a) => {
    const hour = a.timestamp.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  return {
    student: {
      id: learner.id,
      name: learner.name ?? "Student",
      gradeLevel: learner.gradeLevel ?? 5,
    },
    dateRange,
    activities: activities.slice(0, 50), // Limit to 50 most recent
    summary: {
      totalActivities: activities.length,
      totalDuration,
      averageDuration: activities.length > 0 ? Math.round(totalDuration / activities.length) : 0,
      activeDays: uniqueDays,
      bySubject: {}, // Would need subject data from activities table
      byType,
      peakHours,
    },
  };
}

/**
 * Fetch grades report data from database
 */
export async function fetchGradesReportData(
  learnerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<GradesReportData | null> {
  // Get learner info
  const learner = await db.query.learners.findFirst({
    where: eq(learners.id, learnerId),
    columns: {
      id: true,
      name: true,
      gradeLevel: true,
    },
  });

  if (!learner) return null;

  const reportingPeriod = {
    start: startDate ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: endDate ?? new Date(),
    name: "Current Term",
  };

  // Get activity attempts for the period
  const attempts = await db
    .select({
      id: activityAttempts.id,
      activityId: activityAttempts.activityId,
      score: activityAttempts.score,
      maxScore: activityAttempts.maxScore,
      completedAt: activityAttempts.completedAt,
    })
    .from(activityAttempts)
    .where(
      and(
        eq(activityAttempts.learnerId, learnerId),
        gte(activityAttempts.startedAt, reportingPeriod.start),
        lte(activityAttempts.startedAt, reportingPeriod.end)
      )
    )
    .orderBy(desc(activityAttempts.completedAt));

  // Get subject progress
  const subjectProgress = await db
    .select({
      subjectId: learnerSubjectProgress.subjectId,
      masteryLevel: learnerSubjectProgress.masteryLevel,
    })
    .from(learnerSubjectProgress)
    .where(eq(learnerSubjectProgress.learnerId, learnerId));

  // Build subject grades
  const subjects: GradesReportData["subjects"] = subjectProgress.map((sp) => {
    const masteryPct = sp.masteryLevel ?? 0;
    const { letter, points } = getLetterGrade(masteryPct);

    // Get assessments for this subject (simplified - would need subject mapping)
    const subjectAttempts = attempts.slice(0, 5).map((a, idx) => ({
      id: a.id,
      name: `Assessment ${idx + 1}`,
      type: "quiz" as const,
      score: a.score ?? 0,
      maxScore: a.maxScore ?? 100,
      percentage: a.maxScore && a.maxScore > 0
        ? Math.round(((a.score ?? 0) / a.maxScore) * 100)
        : a.score ?? 0,
      weight: 1 / 5, // Equal weight
      date: a.completedAt ?? new Date(),
    }));

    // Determine trend
    let trend: "improving" | "declining" | "stable" = "stable";
    if (subjectAttempts.length >= 2) {
      const recent = subjectAttempts.slice(0, Math.floor(subjectAttempts.length / 2));
      const older = subjectAttempts.slice(Math.floor(subjectAttempts.length / 2));
      const recentAvg = recent.reduce((sum, a) => sum + a.percentage, 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + a.percentage, 0) / older.length;
      if (recentAvg > olderAvg + 5) trend = "improving";
      else if (recentAvg < olderAvg - 5) trend = "declining";
    }

    return {
      subjectId: sp.subjectId?.toString() ?? "",
      subjectName: subjectNames[sp.subjectId?.toString() ?? ""] ?? "Unknown Subject",
      letterGrade: letter,
      percentageGrade: Math.round(masteryPct),
      gradePoints: points,
      assessments: subjectAttempts,
      trend,
    };
  });

  // Calculate GPA
  const gpa =
    subjects.length > 0
      ? subjects.reduce((sum, s) => sum + s.gradePoints, 0) / subjects.length
      : 0;

  return {
    student: {
      id: learner.id,
      name: learner.name ?? "Student",
      gradeLevel: learner.gradeLevel ?? 5,
    },
    reportingPeriod,
    subjects,
    gpa: Math.round(gpa * 100) / 100,
    comments: generateGradeComments(subjects),
  };
}

/**
 * Generate comments based on performance
 */
function generateGradeComments(
  subjects: GradesReportData["subjects"]
): string {
  const improvingSubjects = subjects.filter((s) => s.trend === "improving");
  const decliningSubjects = subjects.filter((s) => s.trend === "declining");
  const highPerformers = subjects.filter((s) => s.percentageGrade >= 85);

  const comments: string[] = [];

  if (highPerformers.length > 0) {
    comments.push(
      `Excellent performance in ${highPerformers.map((s) => s.subjectName).join(", ")}.`
    );
  }

  if (improvingSubjects.length > 0) {
    comments.push(
      `Showing improvement in ${improvingSubjects.map((s) => s.subjectName).join(", ")}.`
    );
  }

  if (decliningSubjects.length > 0) {
    comments.push(
      `Additional support recommended for ${decliningSubjects.map((s) => s.subjectName).join(", ")}.`
    );
  }

  if (comments.length === 0) {
    comments.push("Consistent performance across all subjects. Keep up the good work!");
  }

  return comments.join(" ");
}
