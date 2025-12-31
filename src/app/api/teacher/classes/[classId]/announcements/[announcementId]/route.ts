import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classAnnouncements } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ classId: string; announcementId: string }>;
}

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher";
}

// Helper to verify teacher owns the class
async function verifyClassOwnership(classId: string, teacherId: string) {
  const [cls] = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(
        eq(classes.id, classId),
        eq(classes.teacherId, teacherId),
        isNull(classes.deletedAt)
      )
    );
  return !!cls;
}

// Validation schema for updates
const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(["normal", "important", "urgent"]).optional(),
  publish: z.boolean().optional(), // Set to true to publish, false to unpublish
});

// GET /api/teacher/classes/[classId]/announcements/[announcementId] - Get a single announcement
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  const { classId, announcementId } = await context.params;

  // Verify teacher owns this class
  if (!(await verifyClassOwnership(classId, session.user.id))) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  try {
    const [announcement] = await db
      .select()
      .from(classAnnouncements)
      .where(
        and(
          eq(classAnnouncements.id, announcementId),
          eq(classAnnouncements.classId, classId),
          isNull(classAnnouncements.deletedAt)
        )
      );

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

// PATCH /api/teacher/classes/[classId]/announcements/[announcementId] - Update an announcement
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  const { classId, announcementId } = await context.params;

  // Verify teacher owns this class
  if (!(await verifyClassOwnership(classId, session.user.id))) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  try {
    // Verify announcement exists and belongs to this class
    const [existingAnnouncement] = await db
      .select()
      .from(classAnnouncements)
      .where(
        and(
          eq(classAnnouncements.id, announcementId),
          eq(classAnnouncements.classId, classId),
          isNull(classAnnouncements.deletedAt)
        )
      );

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateAnnouncementSchema.parse(body);

    // Build update object
    const updateData: Partial<typeof classAnnouncements.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.publish === true) {
      // Publish the announcement
      updateData.publishedAt = new Date();
    } else if (data.publish === false) {
      // Unpublish (convert back to draft)
      updateData.publishedAt = null;
    }

    const [updatedAnnouncement] = await db
      .update(classAnnouncements)
      .set(updateData)
      .where(eq(classAnnouncements.id, announcementId))
      .returning();

    return NextResponse.json({ announcement: updatedAnnouncement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/classes/[classId]/announcements/[announcementId] - Soft delete an announcement
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  const { classId, announcementId } = await context.params;

  // Verify teacher owns this class
  if (!(await verifyClassOwnership(classId, session.user.id))) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  try {
    // Verify announcement exists and belongs to this class
    const [existingAnnouncement] = await db
      .select()
      .from(classAnnouncements)
      .where(
        and(
          eq(classAnnouncements.id, announcementId),
          eq(classAnnouncements.classId, classId),
          isNull(classAnnouncements.deletedAt)
        )
      );

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await db
      .update(classAnnouncements)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(classAnnouncements.id, announcementId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
