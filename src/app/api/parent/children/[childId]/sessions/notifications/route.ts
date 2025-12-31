import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users, parentSessionNotifications } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";

// Schema for query params validation
const querySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).optional().default("false"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Schema for marking notifications as read
const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
});

// Helper to find child by slug
async function findChildBySlug(userId: string, slug: string) {
  const children = await db.query.learners.findMany({
    where: and(
      eq(learners.userId, userId),
      isNull(learners.deletedAt)
    ),
  });

  const allNames = children.map(c => c.name);

  for (const child of children) {
    const parts = child.name.toLowerCase().split(" ");
    const firstName = parts[0];
    const middleInitial = parts.length > 2 ? parts[1][0] : null;

    const sameFirstName = allNames.filter(n =>
      n.toLowerCase().startsWith(firstName + " ") && n !== child.name
    );

    const childSlug = sameFirstName.length > 0 && middleInitial
      ? `${firstName}-${middleInitial}`
      : firstName;

    if (childSlug === slug) {
      return child;
    }
  }

  return null;
}

// GET - Get session notifications for a specific child
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    const { childId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      unreadOnly: url.searchParams.get("unreadOnly") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    };

    const parsed = querySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { unreadOnly, limit, offset } = parsed.data;

    // Build conditions
    const conditions = [
      eq(parentSessionNotifications.parentUserId, session.user.id),
      eq(parentSessionNotifications.learnerId, child.id),
      eq(parentSessionNotifications.dismissed, false),
    ];

    if (unreadOnly === "true") {
      conditions.push(eq(parentSessionNotifications.read, false));
    }

    // Fetch notifications
    const notifications = await db
      .select()
      .from(parentSessionNotifications)
      .where(and(...conditions))
      .orderBy(desc(parentSessionNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unread count
    const [unreadCount] = await db
      .select({ count: parentSessionNotifications.id })
      .from(parentSessionNotifications)
      .where(and(
        eq(parentSessionNotifications.parentUserId, session.user.id),
        eq(parentSessionNotifications.learnerId, child.id),
        eq(parentSessionNotifications.read, false),
        eq(parentSessionNotifications.dismissed, false)
      ));

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.notificationType,
        title: n.title,
        message: n.message,
        read: n.read,
        readAt: n.readAt,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
      unreadCount: unreadCount?.count ? 1 : 0, // Simple count based on if any exist
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    const { childId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = markReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { notificationIds } = parsed.data;

    // Update notifications to mark as read
    // Only update if the notification belongs to this parent and child
    const now = new Date();

    for (const notificationId of notificationIds) {
      await db
        .update(parentSessionNotifications)
        .set({
          read: true,
          readAt: now,
        })
        .where(and(
          eq(parentSessionNotifications.id, notificationId),
          eq(parentSessionNotifications.parentUserId, session.user.id),
          eq(parentSessionNotifications.learnerId, child.id)
        ));
    }

    return NextResponse.json({ success: true, markedRead: notificationIds.length });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Dismiss notifications
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    const { childId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = markReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { notificationIds } = parsed.data;

    // Dismiss notifications (soft delete)
    for (const notificationId of notificationIds) {
      await db
        .update(parentSessionNotifications)
        .set({
          dismissed: true,
        })
        .where(and(
          eq(parentSessionNotifications.id, notificationId),
          eq(parentSessionNotifications.parentUserId, session.user.id),
          eq(parentSessionNotifications.learnerId, child.id)
        ));
    }

    return NextResponse.json({ success: true, dismissed: notificationIds.length });
  } catch (error) {
    console.error("Error dismissing notifications:", error);
    return NextResponse.json(
      { error: "Failed to dismiss notifications" },
      { status: 500 }
    );
  }
}
