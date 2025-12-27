import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for updating settings
const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  fontSize: z.enum(["small", "medium", "large", "extra-large"]).optional(),
  soundEnabled: z.boolean().optional(),
  soundVolume: z.number().min(0).max(100).optional(),
  notifications: z.object({
    achievements: z.boolean().optional(),
    reminders: z.boolean().optional(),
    messages: z.boolean().optional(),
  }).optional(),
  accessibility: z.object({
    readAloud: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
  }).optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatarId: z.string().optional().nullable(),
});

// GET - Retrieve current user's settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse avatarId from image field
    const avatarId = user.image?.startsWith("emoji:")
      ? user.image.slice(6)
      : null;

    // Return settings with defaults
    const settings = {
      theme: user.preferences?.theme ?? "system",
      fontSize: user.preferences?.fontSize ?? "medium",
      soundEnabled: user.preferences?.soundEnabled ?? true,
      soundVolume: user.preferences?.soundVolume ?? 70,
      notifications: {
        achievements: user.preferences?.notifications?.achievements ?? true,
        reminders: user.preferences?.notifications?.reminders ?? true,
        messages: user.preferences?.notifications?.messages ?? true,
      },
      accessibility: {
        readAloud: user.preferences?.accessibility?.readAloud ?? false,
        highContrast: user.preferences?.accessibility?.highContrast ?? false,
        reducedMotion: user.preferences?.accessibility?.reducedMotion ?? false,
      },
      displayName: user.name ?? "",
      avatarUrl: user.image && !user.image.startsWith("emoji:") ? user.image : null,
      avatarId,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update user's settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Get current user to merge preferences
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { displayName, avatarId, ...settingsData } = parsed.data;

    // Merge new preferences with existing
    const updatedPreferences = {
      ...user.preferences,
      ...settingsData,
      avatarId: avatarId ?? user.preferences?.avatarId,
      notifications: settingsData.notifications
        ? { ...user.preferences?.notifications, ...settingsData.notifications }
        : user.preferences?.notifications,
      accessibility: settingsData.accessibility
        ? { ...user.preferences?.accessibility, ...settingsData.accessibility }
        : user.preferences?.accessibility,
    };

    // Update user record
    const updateData: {
      preferences: typeof updatedPreferences;
      updatedAt: Date;
      name?: string;
      image?: string | null;
    } = {
      preferences: updatedPreferences,
      updatedAt: new Date(),
    };

    // Update display name if provided
    if (displayName !== undefined) {
      updateData.name = displayName;
    }

    // Store avatarId as image field (we use emoji-based avatars)
    if (avatarId !== undefined) {
      updateData.image = avatarId ? `emoji:${avatarId}` : null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
