import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { learners, users } from "@/lib/db/schema/users";
import { learnerSubjectProgress, activityAttempts } from "@/lib/db/schema/progress";
import { eq, and, sql, isNull, gte, inArray, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logging";

/**
 * Verify that the user is a teacher
 */
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId));
  return { isTeacher: user?.role === "teacher", organizationId: user?.organizationId };
}

/**
 * Escape a value for CSV output
 */
function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Format grade level for display
 */
function formatGradeLevel(grade: number): string {
  if (grade === 0) return "K";
  return String(grade);
}

/**
 * GET /api/teacher/students/export - Export students to CSV
 *
 * Query parameters:
 * - classId: Filter by specific class (optional)
 * - includeProgress: Include progress data (default: true)
 * - format: Export format (csv only for now)
 *
 * Uses streaming for large datasets.
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify teacher role
  const { isTeacher, organizationId } = await verifyTeacher(session.user.id);
  if (!isTeacher) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  if (!organizationId) {
    return NextResponse.json(
      { error: "No organization associated with user" },
      { status: 400 }
    );
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get("classId");
  const includeProgress = searchParams.get("includeProgress") !== "false";

  try {
    // Get teacher's classes
    let teacherClassIds: string[];

    if (classId) {
      // Verify teacher owns the specified class
      const [cls] = await db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.id, classId),
            eq(classes.teacherId, session.user.id),
            isNull(classes.deletedAt)
          )
        );

      if (!cls) {
        return NextResponse.json(
          { error: "Class not found or unauthorized" },
          { status: 404 }
        );
      }

      teacherClassIds = [classId];
    } else {
      // Get all teacher's classes
      const teacherClasses = await db
        .select({ id: classes.id })
        .from(classes)
        .where(
          and(
            eq(classes.teacherId, session.user.id),
            isNull(classes.deletedAt)
          )
        );

      teacherClassIds = teacherClasses.map((c) => c.id);
    }

    if (teacherClassIds.length === 0) {
      // Return empty CSV with headers
      const headers = getCSVHeaders(includeProgress);
      return createCSVResponse(headers.join(",") + "\n", classId);
    }

    // Get enrolled students with class info
    const enrolledStudents = await db
      .select({
        learnerId: classEnrollments.learnerId,
        classId: classEnrollments.classId,
        className: classes.name,
        learnerName: learners.name,
        gradeLevel: learners.gradeLevel,
        dateOfBirth: learners.dateOfBirth,
        enrolledAt: classEnrollments.enrolledAt,
        isActive: learners.isActive,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .innerJoin(classes, eq(classEnrollments.classId, classes.id))
      .where(
        and(
          inArray(classEnrollments.classId, teacherClassIds),
          eq(classEnrollments.status, "active"),
          isNull(learners.deletedAt)
        )
      )
      .orderBy(desc(classEnrollments.enrolledAt));

    if (enrolledStudents.length === 0) {
      const headers = getCSVHeaders(includeProgress);
      return createCSVResponse(headers.join(",") + "\n", classId);
    }

    // Get unique learner IDs for progress data
    const learnerIds = [...new Set(enrolledStudents.map((s) => s.learnerId))];

    // Fetch progress data if requested
    let progressByLearner = new Map<string, {
      avgMastery: number;
      avgProgress: number;
      totalTimeSpent: number;
      currentStreak: number;
      lastActivityAt: string | null;
      recentActivityCount: number;
    }>();

    if (includeProgress && learnerIds.length > 0) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get subject progress data
      const progressData = await db
        .select({
          learnerId: learnerSubjectProgress.learnerId,
          avgMastery: sql<number>`coalesce(avg(${learnerSubjectProgress.masteryLevel}), 0)::int`,
          avgProgress: sql<number>`coalesce(avg(
            case
              when ${learnerSubjectProgress.totalLessons} > 0
              then (${learnerSubjectProgress.completedLessons}::float / ${learnerSubjectProgress.totalLessons}) * 100
              else 0
            end
          ), 0)::int`,
          totalTimeSpent: sql<number>`coalesce(sum(${learnerSubjectProgress.totalTimeSpent}), 0)::int`,
          currentStreak: sql<number>`coalesce(max(${learnerSubjectProgress.currentStreak}), 0)::int`,
          lastActivity: sql<string>`max(${learnerSubjectProgress.lastActivityAt})`,
        })
        .from(learnerSubjectProgress)
        .where(inArray(learnerSubjectProgress.learnerId, learnerIds))
        .groupBy(learnerSubjectProgress.learnerId);

      // Get recent activity counts
      const activityCounts = await db
        .select({
          learnerId: activityAttempts.learnerId,
          count: sql<number>`count(*)::int`,
        })
        .from(activityAttempts)
        .where(
          and(
            inArray(activityAttempts.learnerId, learnerIds),
            gte(activityAttempts.createdAt, sevenDaysAgo)
          )
        )
        .groupBy(activityAttempts.learnerId);

      const activityCountMap = new Map(
        activityCounts.map((a) => [a.learnerId, a.count])
      );

      progressByLearner = new Map(
        progressData.map((p) => [
          p.learnerId,
          {
            avgMastery: p.avgMastery,
            avgProgress: p.avgProgress,
            totalTimeSpent: p.totalTimeSpent,
            currentStreak: p.currentStreak,
            lastActivityAt: p.lastActivity,
            recentActivityCount: activityCountMap.get(p.learnerId) || 0,
          },
        ])
      );
    }

    // Build CSV content using streaming approach
    const stream = new ReadableStream({
      start(controller) {
        try {
          // Write headers
          const csvHeaders = getCSVHeaders(includeProgress);
          controller.enqueue(csvHeaders.join(",") + "\n");

          // Write student rows
          for (const student of enrolledStudents) {
            const row = buildStudentRow(student, progressByLearner, includeProgress);
            controller.enqueue(row.map(escapeCSVValue).join(",") + "\n");
          }

          controller.close();
        } catch (error) {
          logger.error("Error writing CSV stream", { error });
          controller.error(error);
        }
      },
    });

    // Generate filename
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = classId
      ? `students-class-${dateStr}.csv`
      : `students-all-${dateStr}.csv`;

    logger.info("Student export initiated", {
      teacherId: session.user.id,
      classId,
      studentCount: enrolledStudents.length,
      includeProgress,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    logger.error("Student export failed", { error });
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}

/**
 * Get CSV headers based on export options
 */
function getCSVHeaders(includeProgress: boolean): string[] {
  const baseHeaders = [
    "Student Name",
    "First Name",
    "Last Name",
    "Grade Level",
    "Date of Birth",
    "Class",
    "Enrolled Date",
    "Status",
  ];

  if (includeProgress) {
    return [
      ...baseHeaders,
      "Progress (%)",
      "Mastery (%)",
      "Current Streak (days)",
      "Total Time (hours)",
      "Recent Activities (7d)",
      "Last Active",
    ];
  }

  return baseHeaders;
}

/**
 * Build a CSV row for a student
 */
function buildStudentRow(
  student: {
    learnerId: string;
    classId: string;
    className: string;
    learnerName: string;
    gradeLevel: number;
    dateOfBirth: Date | null;
    enrolledAt: Date;
    isActive: boolean | null;
  },
  progressByLearner: Map<string, {
    avgMastery: number;
    avgProgress: number;
    totalTimeSpent: number;
    currentStreak: number;
    lastActivityAt: string | null;
    recentActivityCount: number;
  }>,
  includeProgress: boolean
): (string | number)[] {
  // Split name into first and last
  const nameParts = student.learnerName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const baseRow = [
    student.learnerName,
    firstName,
    lastName,
    `Grade ${formatGradeLevel(student.gradeLevel)}`,
    student.dateOfBirth ? student.dateOfBirth.toISOString().split("T")[0] : "",
    student.className,
    student.enrolledAt.toISOString().split("T")[0],
    student.isActive ? "Active" : "Inactive",
  ];

  if (includeProgress) {
    const progress = progressByLearner.get(student.learnerId);

    if (progress) {
      const totalHours = Math.round(progress.totalTimeSpent / 3600 * 10) / 10;
      const lastActive = progress.lastActivityAt
        ? new Date(progress.lastActivityAt).toLocaleDateString()
        : "Never";

      return [
        ...baseRow,
        progress.avgProgress,
        progress.avgMastery,
        progress.currentStreak,
        totalHours,
        progress.recentActivityCount,
        lastActive,
      ];
    }

    // No progress data available
    return [...baseRow, 0, 0, 0, 0, 0, "Never"];
  }

  return baseRow;
}

/**
 * Create CSV response for empty or small datasets
 */
function createCSVResponse(content: string, classId: string | null): Response {
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = classId
    ? `students-class-${dateStr}.csv`
    : `students-all-${dateStr}.csv`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
