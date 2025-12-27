import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjects } from "@/lib/db/schema/curriculum";
import { users } from "@/lib/db/schema/users";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSubjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  iconName: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().min(0).optional(),
});

const updateSubjectSchema = createSubjectSchema.partial().extend({
  id: z.string().uuid(),
});

// POST /api/admin/curriculum/subjects - Create a new subject
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json({ error: "Only platform admins can create subjects" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createSubjectSchema.parse(body);

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existing = await db.query.subjects.findFirst({
      where: eq(subjects.slug, slug),
    });

    if (existing) {
      return NextResponse.json(
        { error: "A subject with this name already exists" },
        { status: 400 }
      );
    }

    // Get max order if not specified
    let order = data.order;
    if (order === undefined) {
      const [maxOrder] = await db
        .select({ max: sql<number>`coalesce(max(${subjects.order}), -1) + 1` })
        .from(subjects);
      order = maxOrder?.max ?? 0;
    }

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name: data.name,
        slug,
        description: data.description,
        iconName: data.iconName,
        color: data.color,
        order,
        isDefault: true,
      })
      .returning();

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/curriculum/subjects - Update a subject
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json({ error: "Only platform admins can update subjects" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateSubjectSchema.parse(body);

    const { id, ...updateData } = data;

    // If name is being updated, update slug too
    let slug: string | undefined;
    if (updateData.name) {
      slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug conflicts with existing (excluding current)
      const existing = await db.query.subjects.findFirst({
        where: (subjects, { and, eq, ne }) =>
          and(eq(subjects.slug, slug!), ne(subjects.id, id)),
      });

      if (existing) {
        return NextResponse.json(
          { error: "A subject with this name already exists" },
          { status: 400 }
        );
      }
    }

    const [updated] = await db
      .update(subjects)
      .set({
        ...updateData,
        ...(slug && { slug }),
        updatedAt: new Date(),
      })
      .where(eq(subjects.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/curriculum/subjects - Delete a subject
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json({ error: "Only platform admins can delete subjects" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject. It may have associated units." },
      { status: 500 }
    );
  }
}
