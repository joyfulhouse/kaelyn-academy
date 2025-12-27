import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema/marketing";
import { eq, and, desc, sql, isNull, or, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ValidationError } from "@/lib/validation";

// Query schema for GET
const notificationsQuerySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).optional(),
  type: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// GET /api/notifications - Get notifications for the current user
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = notificationsQuerySchema.parse(params);

    // Build conditions
    const conditions = [eq(notifications.userId, session.user.id)];

    if (query.unreadOnly === "true") {
      conditions.push(eq(notifications.isRead, false));
    }

    if (query.type) {
      conditions.push(eq(notifications.type, query.type));
    }

    // Fetch notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(query.limit)
      .offset(query.offset);

    // Get unread count
    const unreadCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false)
        )
      );

    return NextResponse.json({
      notifications: userNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        metadata: n.metadata,
        read: n.isRead,
        readAt: n.readAt?.toISOString() || null,
        time: n.createdAt.toISOString(),
      })),
      unreadCount: unreadCount[0]?.count || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError(
        "Validation failed",
        error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      ).toResponse();
    }
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Schema for marking notifications as read
const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional(),
});

// PATCH /api/notifications - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationIds, markAll } = markReadSchema.parse(body);

    if (markAll) {
      // Mark all as read
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.userId, session.user.id),
            eq(notifications.isRead, false)
          )
        );
    } else if (notificationIds?.length) {
      // Mark specific notifications as read using batch update
      await db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            inArray(notifications.id, notificationIds),
            eq(notifications.userId, session.user.id)
          )
        );
    } else {
      return NextResponse.json(
        { error: "Either notificationIds or markAll is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError(
        "Validation failed",
        error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      ).toResponse();
    }
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// Schema for deleting notifications
const deleteSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  deleteAll: z.boolean().optional(),
});

// DELETE /api/notifications - Delete notification(s)
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationIds, deleteAll } = deleteSchema.parse(body);

    if (deleteAll) {
      // Delete all notifications for user
      await db
        .delete(notifications)
        .where(eq(notifications.userId, session.user.id));
    } else if (notificationIds?.length) {
      // Delete specific notifications using batch delete
      await db
        .delete(notifications)
        .where(
          and(
            inArray(notifications.id, notificationIds),
            eq(notifications.userId, session.user.id)
          )
        );
    } else {
      return NextResponse.json(
        { error: "Either notificationIds or deleteAll is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError(
        "Validation failed",
        error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      ).toResponse();
    }
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification (internal use)
const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string().min(1).max(255),
  message: z.string(),
  link: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createNotificationSchema.parse(body);

    // Only admins or the system can create notifications for other users
    // For now, allow creating for self
    if (data.userId !== session.user.id) {
      // Check if user is admin
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== "platform_admin" && userRole !== "school_admin") {
        return NextResponse.json(
          { error: "Cannot create notifications for other users" },
          { status: 403 }
        );
      }
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
      })
      .returning();

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError(
        "Validation failed",
        error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      ).toResponse();
    }
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
