import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { classes, classAnnouncements } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ classId: string }>;
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

// Validation schemas
const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["normal", "important", "urgent"]).default("normal"),
  publishNow: z.boolean().optional().default(false),
});

// Note: updateAnnouncementSchema is defined in the [announcementId]/route.ts file

// GET /api/teacher/classes/[classId]/announcements - List all announcements for a class
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

  const { classId } = await context.params;

  // Verify teacher owns this class
  if (!(await verifyClassOwnership(classId, session.user.id))) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  try {
    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "all", "published", "draft"
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build base query
    const announcements = await db
      .select({
        id: classAnnouncements.id,
        title: classAnnouncements.title,
        content: classAnnouncements.content,
        priority: classAnnouncements.priority,
        publishedAt: classAnnouncements.publishedAt,
        createdAt: classAnnouncements.createdAt,
        updatedAt: classAnnouncements.updatedAt,
      })
      .from(classAnnouncements)
      .where(
        and(
          eq(classAnnouncements.classId, classId),
          isNull(classAnnouncements.deletedAt)
        )
      )
      .orderBy(desc(classAnnouncements.createdAt))
      .limit(limit)
      .offset(offset);

    // Filter based on status if specified
    let filteredAnnouncements = announcements;
    if (status === "published") {
      filteredAnnouncements = announcements.filter((a) => a.publishedAt !== null);
    } else if (status === "draft") {
      filteredAnnouncements = announcements.filter((a) => a.publishedAt === null);
    }

    return NextResponse.json({
      announcements: filteredAnnouncements,
      pagination: {
        limit,
        offset,
        total: filteredAnnouncements.length,
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/teacher/classes/[classId]/announcements - Create a new announcement
export async function POST(request: NextRequest, context: RouteContext) {
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

  const { classId } = await context.params;

  // Verify teacher owns this class
  if (!(await verifyClassOwnership(classId, session.user.id))) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = createAnnouncementSchema.parse(body);

    const [announcement] = await db
      .insert(classAnnouncements)
      .values({
        classId,
        teacherId: session.user.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        publishedAt: data.publishNow ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
