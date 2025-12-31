import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema/users";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import {
  learnerSubjectProgress,
  activityAttempts,
  learnerAchievements,
  achievements,
} from "@/lib/db/schema/progress";
import { subjects, activities } from "@/lib/db/schema/curriculum";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

// GET /api/teacher/students/[studentId] - Get detailed student profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await params;
    const teacherId = session.user.id;

    // Verify this student is in one of the teacher's classes
    const teacherClasses = await db
      .select({ id: classes.id })
      .from(classes)
      .where(
        and(
          eq(classes.teacherId, teacherId),
          isNull(classes.deletedAt)
        )
      );

    const classIds = teacherClasses.map((c) => c.id);

    if (classIds.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if student is enrolled in any of teacher's classes
    const enrollment = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.learnerId, studentId),
          eq(classEnrollments.status, "active"),
          sql`${classEnrollments.classId} IN (${sql.join(classIds, sql`, `)})`
        )
      )
      .limit(1);

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get student profile
    const studentData = await db
      .select({
        id: learners.id,
        name: learners.name,
        avatarUrl: learners.avatarUrl,
        gradeLevel: learners.gradeLevel,
        createdAt: learners.createdAt,
        parentId: learners.userId,
        parentName: users.name,
        parentEmail: users.email,
      })
      .from(learners)
      .innerJoin(users, eq(learners.userId, users.id))
      .where(
        and(
          eq(learners.id, studentId),
          isNull(learners.deletedAt)
        )
      )
      .limit(1);

    if (studentData.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentData[0];

    // Get subject progress
    const subjectProgressData = await db
      .select({
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
      .where(eq(learnerSubjectProgress.learnerId, studentId));

    // Get recent activity (last 20 attempts)
    const recentActivityData = await db
      .select({
        id: activityAttempts.id,
        activityTitle: activities.title,
        subjectName: sql<string>`COALESCE(
          (SELECT s.name FROM subjects s
           JOIN units u ON s.id = u.subject_id
           JOIN lessons l ON u.id = l.unit_id
           WHERE l.id = ${activities.lessonId}),
          'Unknown'
        )`,
        score: activityAttempts.score,
        passed: activityAttempts.passed,
        completedAt: activityAttempts.completedAt,
      })
      .from(activityAttempts)
      .innerJoin(activities, eq(activityAttempts.activityId, activities.id))
      .where(eq(activityAttempts.learnerId, studentId))
      .orderBy(desc(activityAttempts.completedAt))
      .limit(20);

    // Get achievements
    const achievementsData = await db
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
      .where(eq(learnerAchievements.learnerId, studentId))
      .orderBy(desc(learnerAchievements.earnedAt));

    // Get class enrollments
    const enrollmentsData = await db
      .select({
        id: classEnrollments.id,
        classId: classEnrollments.classId,
        className: classes.name,
        enrolledAt: classEnrollments.enrolledAt,
        status: classEnrollments.status,
      })
      .from(classEnrollments)
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(
        and(
          eq(classEnrollments.learnerId, studentId),
          sql`${classEnrollments.classId} IN (${sql.join(classIds, sql`, `)})`
        )
      );

    // Calculate overall stats
    const overallProgress =
      subjectProgressData.length > 0
        ? Math.round(
            subjectProgressData.reduce((sum, sp) => {
              const total = sp.totalLessons ?? 0;
              const completed = sp.completedLessons ?? 0;
              return sum + (total > 0 ? (completed / total) * 100 : 0);
            }, 0) / subjectProgressData.length
          )
        : 0;

    const overallMastery =
      subjectProgressData.length > 0
        ? Math.round(
            subjectProgressData.reduce(
              (sum, sp) => sum + (sp.masteryLevel ?? 0),
              0
            ) / subjectProgressData.length
          )
        : 0;

    const currentStreak = Math.max(
      ...subjectProgressData.map((sp) => sp.currentStreak ?? 0),
      0
    );

    const longestStreak = currentStreak; // Would need to track separately

    const totalTimeSpent = subjectProgressData.reduce(
      (sum, sp) => sum + (sp.totalTimeSpent ?? 0),
      0
    );

    const totalPoints = achievementsData.reduce(
      (sum, a) => sum + (a.points ?? 0),
      0
    );

    // Format response
    const response = {
      student: {
        id: student.id,
        name: student.name,
        avatarUrl: student.avatarUrl,
        gradeLevel: student.gradeLevel,
        enrolledAt: student.createdAt,
        parentName: student.parentName ?? "Unknown",
        parentEmail: student.parentEmail ?? "",
      },
      subjectProgress: subjectProgressData.map((sp) => ({
        subjectId: sp.subjectId,
        subjectName: sp.subjectName,
        masteryLevel: sp.masteryLevel ?? 0,
        completedLessons: sp.completedLessons ?? 0,
        totalLessons: sp.totalLessons ?? 0,
        currentStreak: sp.currentStreak ?? 0,
        totalTimeSpent: sp.totalTimeSpent ?? 0,
        lastActivityAt: sp.lastActivityAt,
      })),
      recentActivity: recentActivityData.map((a) => ({
        id: a.id,
        type: "activity" as const,
        title: a.activityTitle,
        subject: a.subjectName,
        score: a.score !== null ? Math.round(a.score) : undefined,
        passed: a.passed ?? undefined,
        completedAt: a.completedAt,
      })),
      achievements: achievementsData.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        iconUrl: a.iconUrl,
        type: a.type,
        earnedAt: a.earnedAt,
      })),
      enrollments: enrollmentsData.map((e) => ({
        id: e.id,
        classId: e.classId,
        className: e.className,
        enrolledAt: e.enrolledAt,
        status: e.status,
      })),
      stats: {
        overallProgress,
        overallMastery,
        currentStreak,
        longestStreak,
        totalTimeSpent,
        totalAchievements: achievementsData.length,
        totalPoints,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}
