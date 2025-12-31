import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { systemSettings, defaultSystemSettings, type SystemSettingsData } from "@/lib/db/schema/settings";
import { users } from "@/lib/db/schema/users";
import { auditLogs } from "@/lib/db/schema/audit";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Admin roles that can access settings
const ADMIN_ROLES = ["admin", "platform_admin", "school_admin"];

// Validation schema for settings updates
const generalSettingsSchema = z.object({
  siteName: z.string().min(1).max(255).optional(),
  supportEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
  registrationOpen: z.boolean().optional(),
}).strict();

const learningSettingsSchema = z.object({
  defaultDifficulty: z.number().int().min(1).max(5).optional(),
  adaptiveDifficultyEnabled: z.boolean().optional(),
  lessonTimeLimit: z.number().int().min(10).max(120).optional(),
  maxDailyLessons: z.number().int().min(1).max(50).optional(),
}).strict();

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  parentDigestFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  achievementAlerts: z.boolean().optional(),
}).strict();

const securitySettingsSchema = z.object({
  sessionTimeout: z.number().int().min(5).max(1440).optional(),
  maxLoginAttempts: z.number().int().min(3).max(10).optional(),
  requireStrongPasswords: z.boolean().optional(),
  twoFactorRequired: z.boolean().optional(),
}).strict();

const aiSettingsSchema = z.object({
  aiTutoringEnabled: z.boolean().optional(),
  maxQuestionsPerDay: z.number().int().min(10).max(500).optional(),
  contentModerationLevel: z.enum(["low", "medium", "high"]).optional(),
  responseTimeout: z.number().int().min(10).max(120).optional(),
}).strict();

const updateSettingsSchema = z.object({
  general: generalSettingsSchema.optional(),
  learning: learningSettingsSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
  security: securitySettingsSchema.optional(),
  ai: aiSettingsSchema.optional(),
}).strict();

// Helper to verify admin role
async function verifyAdmin(userId: string): Promise<boolean> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user ? ADMIN_ROLES.includes(user.role) : false;
}

// GET /api/admin/settings - Get system settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await verifyAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
    }

    // Get settings or return defaults
    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "default"));

    if (existing) {
      return NextResponse.json({ settings: existing.settings });
    }

    // Return defaults if no settings exist
    return NextResponse.json({ settings: defaultSystemSettings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await verifyAdmin(session.user.id))) {
      return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Get existing settings or defaults
    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "default"));

    const currentSettings: SystemSettingsData = existing?.settings ?? defaultSystemSettings;

    // Deep merge the updates
    const updatedSettings: SystemSettingsData = {
      general: { ...currentSettings.general, ...parsed.data.general },
      learning: { ...currentSettings.learning, ...parsed.data.learning },
      notifications: { ...currentSettings.notifications, ...parsed.data.notifications },
      security: { ...currentSettings.security, ...parsed.data.security },
      ai: { ...currentSettings.ai, ...parsed.data.ai },
    };

    if (existing) {
      // Update existing settings
      await db
        .update(systemSettings)
        .set({
          settings: updatedSettings,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, "default"));
    } else {
      // Insert new settings
      await db.insert(systemSettings).values({
        key: "default",
        settings: updatedSettings,
        updatedBy: session.user.id,
      });
    }

    // Audit log the change
    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorRole: session.user.role ?? "admin",
      actorEmail: session.user.email ?? undefined,
      action: "settings.update",
      category: "settings",
      resourceType: "system_settings",
      resourceId: undefined,
      resourceName: "System Settings",
      description: `Updated system settings: ${Object.keys(parsed.data).join(", ")}`,
      metadata: {
        changes: parsed.data as Record<string, { from: unknown; to: unknown }>,
        ipAddress: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
