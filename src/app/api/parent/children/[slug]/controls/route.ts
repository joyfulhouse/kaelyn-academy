import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

// Schema for updating parental controls
const updateControlsSchema = z.object({
  screenTimeLimit: z.number().min(15).max(240).optional(),
  weekendTimeLimit: z.number().min(15).max(360).optional(),
  contentFiltering: z.enum(["strict", "moderate", "minimal"]).optional(),
  breakReminders: z.boolean().optional(),
  breakInterval: z.number().min(15).max(60).optional(),
  allowedSubjects: z.array(z.string()).optional(),
  notifications: z.object({
    onAchievement: z.boolean().optional(),
    onStruggling: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    shareWithTeacher: z.boolean().optional(),
    allowAnonymousComparison: z.boolean().optional(),
  }).optional(),
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

// GET - Get parental controls for a specific child
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const { slug } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, slug);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Return controls with defaults
    const controls = {
      dailyLimit: child.parentalControls?.screenTimeLimit ?? 60,
      weekendLimit: child.parentalControls?.screenTimeLimit ? Math.round(child.parentalControls.screenTimeLimit * 1.5) : 90,
      contentFiltering: "moderate",
      breakReminders: true,
      breakInterval: 30,
      allowedSubjects: child.parentalControls?.allowedSubjects ?? ["math", "reading", "science", "history"],
      notifyOnAchievement: true,
      notifyOnStruggling: true,
      notifyWeeklyReport: true,
      shareProgressWithTeacher: true,
      allowAnonymousComparison: false,
      ...(child.parentalControls || {}),
    };

    return NextResponse.json({
      childName: child.name,
      controls,
    });
  } catch (error) {
    console.error("Error fetching controls:", error);
    return NextResponse.json(
      { error: "Failed to fetch controls" },
      { status: 500 }
    );
  }
}

// PUT - Update parental controls for a specific child
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const { slug } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, slug);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateControlsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Merge with existing controls
    const updatedControls = {
      ...child.parentalControls,
      screenTimeLimit: parsed.data.screenTimeLimit ?? child.parentalControls?.screenTimeLimit,
      allowedSubjects: parsed.data.allowedSubjects ?? child.parentalControls?.allowedSubjects,
      blockedContent: child.parentalControls?.blockedContent,
      requireParentApproval: child.parentalControls?.requireParentApproval,
      // Extended controls stored as JSON
      weekendTimeLimit: parsed.data.weekendTimeLimit,
      contentFiltering: parsed.data.contentFiltering,
      breakReminders: parsed.data.breakReminders,
      breakInterval: parsed.data.breakInterval,
      notifications: parsed.data.notifications,
      privacy: parsed.data.privacy,
    };

    await db
      .update(learners)
      .set({
        parentalControls: updatedControls,
        updatedAt: new Date(),
      })
      .where(eq(learners.id, child.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating controls:", error);
    return NextResponse.json(
      { error: "Failed to update controls" },
      { status: 500 }
    );
  }
}
