import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

// SECURITY: Strict schema for parental controls to prevent JSONB injection
// Using .strict() to reject unknown properties that could be used for injection
const notificationsSchema = z.object({
  onAchievement: z.boolean().optional(),
  onStruggling: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
}).strict();

const privacySchema = z.object({
  shareWithTeacher: z.boolean().optional(),
  allowAnonymousComparison: z.boolean().optional(),
}).strict();

// Allowed subjects whitelist to prevent arbitrary values
const ALLOWED_SUBJECTS = ["math", "reading", "science", "history", "technology", "art", "music", "physical-education"] as const;

// Schema for updating parental controls
const updateControlsSchema = z.object({
  screenTimeLimit: z.number().int().min(15).max(240).optional(),
  weekendTimeLimit: z.number().int().min(15).max(360).optional(),
  contentFiltering: z.enum(["strict", "moderate", "minimal"]).optional(),
  breakReminders: z.boolean().optional(),
  breakInterval: z.number().int().min(15).max(60).optional(),
  allowedSubjects: z.array(z.enum(ALLOWED_SUBJECTS)).optional(),
  notifications: notificationsSchema.optional(),
  privacy: privacySchema.optional(),
}).strict();

// Schema for validating stored parental controls from database
// SECURITY: Validate JSONB data from database before trusting it
const storedControlsSchema = z.object({
  screenTimeLimit: z.number().int().min(15).max(240).optional(),
  weekendTimeLimit: z.number().int().min(15).max(360).optional(),
  contentFiltering: z.enum(["strict", "moderate", "minimal"]).optional(),
  breakReminders: z.boolean().optional(),
  breakInterval: z.number().int().min(15).max(60).optional(),
  allowedSubjects: z.array(z.string()).optional(),
  blockedContent: z.array(z.string()).optional(),
  requireParentApproval: z.boolean().optional(),
  notifications: notificationsSchema.optional(),
  privacy: privacySchema.optional(),
}).strict().nullable();

/**
 * SECURITY: Safely parse stored parental controls from database
 * Returns only validated fields, discarding any injected properties
 */
function safeParseStoredControls(controls: unknown): z.infer<typeof storedControlsSchema> {
  const result = storedControlsSchema.safeParse(controls);
  if (result.success) {
    return result.data;
  }
  // If validation fails, return empty object (log for monitoring)
  console.warn("Invalid parental controls in database, using defaults:", result.error.issues);
  return null;
}

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

    // SECURITY: Validate stored JSONB before using it
    const validatedControls = safeParseStoredControls(child.parentalControls);

    // Return controls with defaults, only using validated data
    const controls = {
      dailyLimit: validatedControls?.screenTimeLimit ?? 60,
      weekendLimit: validatedControls?.weekendTimeLimit ?? (validatedControls?.screenTimeLimit ? Math.round(validatedControls.screenTimeLimit * 1.5) : 90),
      contentFiltering: validatedControls?.contentFiltering ?? "moderate",
      breakReminders: validatedControls?.breakReminders ?? true,
      breakInterval: validatedControls?.breakInterval ?? 30,
      allowedSubjects: validatedControls?.allowedSubjects ?? ["math", "reading", "science", "history"],
      notifyOnAchievement: validatedControls?.notifications?.onAchievement ?? true,
      notifyOnStruggling: validatedControls?.notifications?.onStruggling ?? true,
      notifyWeeklyReport: validatedControls?.notifications?.weeklyReport ?? true,
      shareProgressWithTeacher: validatedControls?.privacy?.shareWithTeacher ?? true,
      allowAnonymousComparison: validatedControls?.privacy?.allowAnonymousComparison ?? false,
      // Include raw validated controls for reference
      blockedContent: validatedControls?.blockedContent ?? [],
      requireParentApproval: validatedControls?.requireParentApproval ?? false,
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

    // SECURITY: Validate existing controls before merging
    // This prevents injected data from being preserved across updates
    const existingControls = safeParseStoredControls(child.parentalControls);

    // SECURITY: Explicitly construct new controls from validated data only
    // Do NOT use spread from unvalidated sources
    const updatedControls = {
      screenTimeLimit: parsed.data.screenTimeLimit ?? existingControls?.screenTimeLimit,
      weekendTimeLimit: parsed.data.weekendTimeLimit ?? existingControls?.weekendTimeLimit,
      contentFiltering: parsed.data.contentFiltering ?? existingControls?.contentFiltering,
      breakReminders: parsed.data.breakReminders ?? existingControls?.breakReminders,
      breakInterval: parsed.data.breakInterval ?? existingControls?.breakInterval,
      allowedSubjects: parsed.data.allowedSubjects ?? existingControls?.allowedSubjects,
      blockedContent: existingControls?.blockedContent,
      requireParentApproval: existingControls?.requireParentApproval,
      notifications: parsed.data.notifications ?? existingControls?.notifications,
      privacy: parsed.data.privacy ?? existingControls?.privacy,
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
