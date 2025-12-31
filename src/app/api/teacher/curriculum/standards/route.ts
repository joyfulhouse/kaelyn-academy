import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { standards, subjects, lessons } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, sql, ilike, or, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { validatePagination, PAGINATION_PRESETS } from "@/lib/api/pagination";

// GET /api/teacher/curriculum/standards - Get standards with filtering
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is teacher or admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (
    !currentUser ||
    (currentUser.role !== "teacher" &&
      currentUser.role !== "platform_admin" &&
      currentUser.role !== "school_admin")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const subjectFilter = searchParams.get("subjectId") || "";
  const gradeLevelFilter = searchParams.get("gradeLevel");
  const standardBodyFilter = searchParams.get("standardBody") || "";
  const { limit, offset } = validatePagination(
    searchParams,
    PAGINATION_PRESETS.standard
  );

  try {
    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(standards.code, `%${search}%`),
          ilike(standards.name, `%${search}%`),
          ilike(standards.description, `%${search}%`)
        ) as ReturnType<typeof eq>
      );
    }

    if (subjectFilter) {
      conditions.push(eq(standards.subjectId, subjectFilter));
    }

    if (gradeLevelFilter !== null && gradeLevelFilter !== "") {
      conditions.push(eq(standards.gradeLevel, parseInt(gradeLevelFilter)));
    }

    if (standardBodyFilter) {
      conditions.push(eq(standards.standardBody, standardBodyFilter));
    }

    // Get standards with subject info
    const standardsData = await db
      .select({
        id: standards.id,
        code: standards.code,
        name: standards.name,
        description: standards.description,
        standardBody: standards.standardBody,
        gradeLevel: standards.gradeLevel,
        subjectId: standards.subjectId,
        subjectName: subjects.name,
        createdAt: standards.createdAt,
      })
      .from(standards)
      .leftJoin(subjects, eq(standards.subjectId, subjects.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(standards.gradeLevel), asc(standards.code))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(standards)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get lessons that cover each standard (for coverage metrics)
    const standardIds = standardsData.map((s) => s.id);

    const lessonCoverage: Map<string, number> = new Map();

    if (standardIds.length > 0) {
      // Get lessons with standardIds that include any of our standards
      const lessonsWithStandards = await db
        .select({
          id: lessons.id,
          standardIds: lessons.standardIds,
        })
        .from(lessons)
        .where(isNull(lessons.deletedAt));

      // Count how many lessons cover each standard
      for (const lesson of lessonsWithStandards) {
        const stdIds = lesson.standardIds || [];
        for (const stdId of stdIds) {
          if (standardIds.includes(stdId)) {
            lessonCoverage.set(stdId, (lessonCoverage.get(stdId) || 0) + 1);
          }
        }
      }
    }

    // Enrich standards with coverage info
    const standardsWithCoverage = standardsData.map((std) => ({
      ...std,
      lessonCount: lessonCoverage.get(std.id) || 0,
    }));

    // Get standard body breakdown
    const bodyStats = await db
      .select({
        standardBody: standards.standardBody,
        count: sql<number>`count(*)::int`,
      })
      .from(standards)
      .groupBy(standards.standardBody);

    const bodyCounts = Object.fromEntries(
      bodyStats.map((b) => [b.standardBody, b.count])
    );

    // Get grade level breakdown
    const gradeStats = await db
      .select({
        gradeLevel: standards.gradeLevel,
        count: sql<number>`count(*)::int`,
      })
      .from(standards)
      .groupBy(standards.gradeLevel)
      .orderBy(asc(standards.gradeLevel));

    // Get all subjects for filter dropdown
    const allSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
      })
      .from(subjects)
      .orderBy(asc(subjects.name));

    return NextResponse.json({
      standards: standardsWithCoverage,
      total: countResult?.count || 0,
      subjects: allSubjects,
      stats: {
        total: countResult?.count || 0,
        byBody: bodyCounts,
        byGrade: gradeStats,
        commonCore: bodyCounts["Common Core"] || 0,
        ngss: bodyCounts["NGSS"] || 0,
        custom: bodyCounts["Custom"] || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching standards:", error);
    return NextResponse.json(
      { error: "Failed to fetch standards" },
      { status: 500 }
    );
  }
}
