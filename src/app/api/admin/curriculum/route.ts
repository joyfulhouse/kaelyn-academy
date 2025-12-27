import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjects, units, lessons } from "@/lib/db/schema/curriculum";
import { users } from "@/lib/db/schema/users";
import { eq, sql, isNull, ilike, and, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/admin/curriculum - Get curriculum overview with subjects, units, and lessons
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const subjectFilter = searchParams.get("subjectId") || "";
  const gradeFilter = searchParams.get("gradeLevel") || "";

  try {
    // Get all subjects with counts
    const subjectsData = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        iconName: subjects.iconName,
        color: subjects.color,
        isDefault: subjects.isDefault,
      })
      .from(subjects)
      .orderBy(subjects.order);

    // Get unit counts per subject
    const unitCounts = await db
      .select({
        subjectId: units.subjectId,
        count: sql<number>`count(*)::int`,
      })
      .from(units)
      .where(isNull(units.deletedAt))
      .groupBy(units.subjectId);

    const unitCountMap = new Map(
      unitCounts.map((u) => [u.subjectId, u.count])
    );

    // Get lesson counts per subject through units
    const lessonCounts = await db
      .select({
        subjectId: units.subjectId,
        count: sql<number>`count(${lessons.id})::int`,
      })
      .from(lessons)
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(and(isNull(units.deletedAt), isNull(lessons.deletedAt)))
      .groupBy(units.subjectId);

    const lessonCountMap = new Map(
      lessonCounts.map((l) => [l.subjectId, l.count])
    );

    // Get published unit counts per subject
    const publishedUnitCounts = await db
      .select({
        subjectId: units.subjectId,
        count: sql<number>`count(*)::int`,
      })
      .from(units)
      .where(and(isNull(units.deletedAt), eq(units.isPublished, true)))
      .groupBy(units.subjectId);

    const publishedUnitMap = new Map(
      publishedUnitCounts.map((u) => [u.subjectId, u.count])
    );

    // Build subjects with counts
    const subjectsWithCounts = subjectsData.map((subject) => ({
      ...subject,
      unitsCount: unitCountMap.get(subject.id) || 0,
      lessonsCount: lessonCountMap.get(subject.id) || 0,
      isPublished: (publishedUnitMap.get(subject.id) || 0) > 0,
    }));

    // Filter subjects by search
    const filteredSubjects = search
      ? subjectsWithCounts.filter((s) =>
          s.name.toLowerCase().includes(search.toLowerCase())
        )
      : subjectsWithCounts;

    // Build units query conditions
    const unitsConditions = [isNull(units.deletedAt)];

    if (search) {
      unitsConditions.push(
        ilike(units.title, `%${search}%`)
      );
    }

    if (subjectFilter) {
      unitsConditions.push(eq(units.subjectId, subjectFilter));
    }

    if (gradeFilter) {
      unitsConditions.push(eq(units.gradeLevel, parseInt(gradeFilter)));
    }

    // Get units with lesson counts
    const unitsData = await db
      .select({
        id: units.id,
        title: units.title,
        slug: units.slug,
        description: units.description,
        subjectId: units.subjectId,
        gradeLevel: units.gradeLevel,
        estimatedMinutes: units.estimatedMinutes,
        isPublished: units.isPublished,
        order: units.order,
        createdAt: units.createdAt,
      })
      .from(units)
      .where(and(...unitsConditions))
      .orderBy(units.subjectId, units.gradeLevel, units.order);

    const unitIds = unitsData.map((u) => u.id);

    // Get lesson counts per unit
    const unitLessonCounts = unitIds.length > 0
      ? await db
          .select({
            unitId: lessons.unitId,
            count: sql<number>`count(*)::int`,
          })
          .from(lessons)
          .where(
            and(
              isNull(lessons.deletedAt),
              sql`${lessons.unitId} = ANY(${unitIds})`
            )
          )
          .groupBy(lessons.unitId)
      : [];

    const unitLessonCountMap = new Map(
      unitLessonCounts.map((l) => [l.unitId, l.count])
    );

    const unitsWithCounts = unitsData.map((unit) => ({
      ...unit,
      lessonsCount: unitLessonCountMap.get(unit.id) || 0,
    }));

    // Get total stats
    const [totalUnits] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(units)
      .where(isNull(units.deletedAt));

    const [totalLessons] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(lessons)
      .where(isNull(lessons.deletedAt));

    const [publishedUnits] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(units)
      .where(and(isNull(units.deletedAt), eq(units.isPublished, true)));

    return NextResponse.json({
      subjects: filteredSubjects,
      units: unitsWithCounts,
      stats: {
        totalSubjects: subjectsWithCounts.length,
        totalUnits: totalUnits?.count || 0,
        totalLessons: totalLessons?.count || 0,
        publishedUnits: publishedUnits?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum data" },
      { status: 500 }
    );
  }
}
