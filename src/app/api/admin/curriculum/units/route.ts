import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { units } from "@/lib/db/schema/curriculum";
import { users } from "@/lib/db/schema/users";
import { eq, sql, isNull, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createUnitSchema = z.object({
  subjectId: z.string().uuid(),
  gradeLevel: z.number().int().min(0).max(12),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  order: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

const updateUnitSchema = createUnitSchema.partial().extend({
  id: z.string().uuid(),
});

// POST /api/admin/curriculum/units - Create a new unit
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
    const data = createUnitSchema.parse(body);

    // Generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Add grade level to make it unique
    const slug = `${baseSlug}-grade-${data.gradeLevel === 0 ? "k" : data.gradeLevel}`;

    // Check if slug already exists in this subject
    const existing = await db.query.units.findFirst({
      where: (units, { and, eq, isNull }) =>
        and(
          eq(units.slug, slug),
          eq(units.subjectId, data.subjectId),
          isNull(units.deletedAt)
        ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "A unit with this title already exists for this grade level" },
        { status: 400 }
      );
    }

    // Get max order if not specified
    let order = data.order;
    if (order === undefined) {
      const [maxOrder] = await db
        .select({ max: sql<number>`coalesce(max(${units.order}), -1) + 1` })
        .from(units)
        .where(
          and(
            eq(units.subjectId, data.subjectId),
            eq(units.gradeLevel, data.gradeLevel),
            isNull(units.deletedAt)
          )
        );
      order = maxOrder?.max ?? 0;
    }

    const [newUnit] = await db
      .insert(units)
      .values({
        subjectId: data.subjectId,
        gradeLevel: data.gradeLevel,
        title: data.title,
        slug,
        description: data.description,
        estimatedMinutes: data.estimatedMinutes,
        order,
        isPublished: data.isPublished ?? false,
      })
      .returning();

    return NextResponse.json(newUnit, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/curriculum/units - Update a unit
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
    const data = updateUnitSchema.parse(body);

    const { id, ...updateData } = data;

    // Build update object
    const updateValues: Record<string, unknown> = {
      ...updateData,
      updatedAt: new Date(),
    };

    // If title is being updated, update slug too
    if (updateData.title) {
      const gradeLevel = updateData.gradeLevel ?? (
        await db.query.units.findFirst({
          where: eq(units.id, id),
          columns: { gradeLevel: true },
        })
      )?.gradeLevel ?? 0;

      const baseSlug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateValues.slug = `${baseSlug}-grade-${gradeLevel === 0 ? "k" : gradeLevel}`;
    }

    // Handle publish status
    if (updateData.isPublished === true) {
      updateValues.publishedAt = new Date();
    }

    const [updated] = await db
      .update(units)
      .set(updateValues)
      .where(and(eq(units.id, id), isNull(units.deletedAt)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/curriculum/units - Soft delete a unit
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
    return NextResponse.json({ error: "Unit ID required" }, { status: 400 });
  }

  try {
    // Soft delete
    const [deleted] = await db
      .update(units)
      .set({ deletedAt: new Date() })
      .where(and(eq(units.id, id), isNull(units.deletedAt)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
