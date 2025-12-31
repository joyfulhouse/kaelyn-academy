import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { learners, users } from "@/lib/db/schema/users";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, and, isNull, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import type {
  EnrollStudentRequest,
  EnrollStudentResponse,
  EnrolledStudentsResponse,
  AvailableStudentsResponse,
  EnrollmentStatus,
} from "@/types/enrollment";

const enrollStudentsSchema = z.object({
  learnerIds: z.array(z.string().uuid()).min(1).max(50),
});

async function verifyClassOwnership(classId: string, teacherId: string) {
  const classData = await db
    .select()
    .from(classes)
    .where(
      and(
        eq(classes.id, classId),
        eq(classes.teacherId, teacherId),
        isNull(classes.deletedAt)
      )
    )
    .limit(1);

  return classData.length > 0 ? classData[0] : null;
}

// GET /api/teacher/classes/[classId]/enrollments - List enrolled students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { classId } = await params;

    // Verify class ownership
    const classData = await verifyClassOwnership(classId, session.user.id);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if requesting available students
    const { searchParams } = new URL(request.url);
    const showAvailable = searchParams.get("available") === "true";
    const searchQuery = searchParams.get("search") ?? "";
    const gradeFilter = searchParams.get("grade");

    if (showAvailable) {
      // Get students in the organization NOT already enrolled in this class
      const enrolledLearnerIds = await db
        .select({ learnerId: classEnrollments.learnerId })
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.classId, classId),
            eq(classEnrollments.status, "active")
          )
        );

      const enrolledIds = enrolledLearnerIds.map((e) => e.learnerId);

      const query = db
        .select({
          id: learners.id,
          name: learners.name,
          gradeLevel: learners.gradeLevel,
          avatarUrl: learners.avatarUrl,
          parentId: learners.userId,
          parentName: users.name,
        })
        .from(learners)
        .innerJoin(users, eq(learners.userId, users.id))
        .where(
          and(
            eq(learners.organizationId, classData.organizationId),
            isNull(learners.deletedAt),
            enrolledIds.length > 0
              ? notInArray(learners.id, enrolledIds)
              : sql`1=1`
          )
        );

      const studentsData = await query;

      // Apply search and grade filters in memory for simplicity
      let filtered = studentsData;

      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(lowerSearch) ||
            (s.parentName?.toLowerCase().includes(lowerSearch) ?? false)
        );
      }

      if (gradeFilter && gradeFilter !== "all") {
        const gradeNum = parseInt(gradeFilter);
        if (!isNaN(gradeNum)) {
          filtered = filtered.filter((s) => s.gradeLevel === gradeNum);
        }
      }

      const response: AvailableStudentsResponse = {
        students: filtered.map((s) => ({
          id: s.id,
          name: s.name,
          gradeLevel: s.gradeLevel,
          avatarUrl: s.avatarUrl,
          parentName: s.parentName ?? "Unknown",
        })),
        total: filtered.length,
      };

      return NextResponse.json(response);
    }

    // Get enrolled students with progress
    const enrolledData = await db
      .select({
        enrollmentId: classEnrollments.id,
        learnerId: classEnrollments.learnerId,
        enrolledAt: classEnrollments.enrolledAt,
        status: classEnrollments.status,
        learnerName: learners.name,
        learnerGrade: learners.gradeLevel,
        learnerAvatar: learners.avatarUrl,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.status, "active"),
          isNull(learners.deletedAt)
        )
      );

    // Get progress for each student
    const studentsWithProgress = await Promise.all(
      enrolledData.map(async (e) => {
        const progressData = await db
          .select({
            masteryLevel: learnerSubjectProgress.masteryLevel,
            completedLessons: learnerSubjectProgress.completedLessons,
            totalLessons: learnerSubjectProgress.totalLessons,
          })
          .from(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, e.learnerId));

        const overallProgress =
          progressData.length > 0
            ? Math.round(
                progressData.reduce((acc, p) => {
                  const total = p.totalLessons ?? 0;
                  const completed = p.completedLessons ?? 0;
                  return acc + (total > 0 ? (completed / total) * 100 : 0);
                }, 0) / progressData.length
              )
            : 0;

        const masteryLevel =
          progressData.length > 0
            ? Math.round(
                progressData.reduce((acc, p) => acc + (p.masteryLevel ?? 0), 0) /
                  progressData.length
              )
            : 0;

        return {
          id: e.learnerId,
          enrollmentId: e.enrollmentId,
          name: e.learnerName,
          gradeLevel: e.learnerGrade,
          avatarUrl: e.learnerAvatar,
          enrolledAt: e.enrolledAt,
          status: e.status as EnrollmentStatus,
          progress: {
            overallProgress,
            masteryLevel,
          },
        };
      })
    );

    const response: EnrolledStudentsResponse = {
      students: studentsWithProgress,
      total: studentsWithProgress.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// POST /api/teacher/classes/[classId]/enrollments - Enroll students
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { classId } = await params;

    // Verify class ownership
    const classData = await verifyClassOwnership(classId, session.user.id);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const body: EnrollStudentRequest = await request.json();
    const data = enrollStudentsSchema.parse(body);

    // Verify all learners exist and belong to the same organization
    const learnersData = await db
      .select({ id: learners.id })
      .from(learners)
      .where(
        and(
          eq(learners.organizationId, classData.organizationId),
          isNull(learners.deletedAt)
        )
      );

    const validLearnerIds = new Set(learnersData.map((l) => l.id));
    const requestedIds = data.learnerIds.filter((id) => validLearnerIds.has(id));

    if (requestedIds.length === 0) {
      return NextResponse.json(
        { error: "No valid students to enroll" },
        { status: 400 }
      );
    }

    // Check for existing enrollments
    const existingEnrollments = await db
      .select({ learnerId: classEnrollments.learnerId })
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, classId),
          eq(classEnrollments.status, "active")
        )
      );

    const alreadyEnrolledIds = new Set(existingEnrollments.map((e) => e.learnerId));
    const toEnroll = requestedIds.filter((id) => !alreadyEnrolledIds.has(id));

    if (toEnroll.length === 0) {
      const response: EnrollStudentResponse = {
        enrollments: [],
        enrolled: 0,
        alreadyEnrolled: requestedIds.length,
      };
      return NextResponse.json(response);
    }

    // Create enrollments
    const newEnrollments = await db
      .insert(classEnrollments)
      .values(
        toEnroll.map((learnerId) => ({
          classId,
          learnerId,
          status: "active" as const,
        }))
      )
      .returning();

    const response: EnrollStudentResponse = {
      enrollments: newEnrollments.map((e) => ({
        id: e.id,
        classId: e.classId,
        learnerId: e.learnerId,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        status: e.status as EnrollmentStatus,
      })),
      enrolled: newEnrollments.length,
      alreadyEnrolled: requestedIds.length - toEnroll.length,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error enrolling students:", error);
    return NextResponse.json(
      { error: "Failed to enroll students" },
      { status: 500 }
    );
  }
}
