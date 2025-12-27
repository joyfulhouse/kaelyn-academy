import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, units } from "@/lib/db/schema/curriculum";
import { users } from "@/lib/db/schema/users";
import { eq, sql, isNull, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const lessonContentSchema = z.object({
  type: z.enum(["text", "video", "interactive", "quiz", "game"]),
  body: z.string().optional(),
  videoUrl: z.string().url().optional(),
  interactiveConfig: z.record(z.string(), z.unknown()).optional(),
});

const visualization3dSchema = z.object({
  enabled: z.boolean(),
  componentName: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const createLessonSchema = z.object({
  unitId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  content: lessonContentSchema.optional(),
  visualization3d: visualization3dSchema.optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  difficultyLevel: z.number().int().min(1).max(5).optional(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

const updateLessonSchema = createLessonSchema.partial().extend({
  id: z.string().uuid(),
});

// GET /api/admin/curriculum/lessons - Get lessons for a unit
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const unitId = searchParams.get("unitId");

  if (!unitId) {
    return NextResponse.json({ error: "Unit ID required" }, { status: 400 });
  }

  try {
    const lessonsData = await db
      .select({
        id: lessons.id,
        unitId: lessons.unitId,
        title: lessons.title,
        slug: lessons.slug,
        description: lessons.description,
        content: lessons.content,
        visualization3d: lessons.visualization3d,
        estimatedMinutes: lessons.estimatedMinutes,
        difficultyLevel: lessons.difficultyLevel,
        isPublished: lessons.isPublished,
        order: lessons.order,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .where(and(eq(lessons.unitId, unitId), isNull(lessons.deletedAt)))
      .orderBy(lessons.order);

    return NextResponse.json({ lessons: lessonsData });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/curriculum/lessons - Create a new lesson
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createLessonSchema.parse(body);

    // Verify unit exists
    const unit = await db.query.units.findFirst({
      where: and(eq(units.id, data.unitId), isNull(units.deletedAt)),
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Add a timestamp suffix to ensure uniqueness
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Get max order if not specified
    let order = data.order;
    if (order === undefined) {
      const [maxOrder] = await db
        .select({ max: sql<number>`coalesce(max(${lessons.order}), -1) + 1` })
        .from(lessons)
        .where(and(eq(lessons.unitId, data.unitId), isNull(lessons.deletedAt)));
      order = maxOrder?.max ?? 0;
    }

    const [newLesson] = await db
      .insert(lessons)
      .values({
        unitId: data.unitId,
        title: data.title,
        slug,
        description: data.description,
        content: data.content ?? { type: "text", body: "" },
        visualization3d: data.visualization3d ?? { enabled: false },
        estimatedMinutes: data.estimatedMinutes,
        difficultyLevel: data.difficultyLevel ?? 1,
        order,
        isPublished: data.isPublished ?? false,
      })
      .returning();

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/curriculum/lessons - Update a lesson
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateLessonSchema.parse(body);

    const { id, ...updateData } = data;

    // Build update object
    const updateValues: Record<string, unknown> = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Handle publish status
    if (updateData.isPublished === true) {
      updateValues.publishedAt = new Date();
    }

    const [updated] = await db
      .update(lessons)
      .set(updateValues)
      .where(and(eq(lessons.id, id), isNull(lessons.deletedAt)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/curriculum/lessons - Soft delete a lesson
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .update(lessons)
      .set({ deletedAt: new Date() })
      .where(and(eq(lessons.id, id), isNull(lessons.deletedAt)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
