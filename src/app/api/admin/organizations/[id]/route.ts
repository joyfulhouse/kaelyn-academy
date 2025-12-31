import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, learners } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { eq, sql, isNull, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is platform admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden - only platform admins can view organization details" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // Get organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)));

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get user counts by role
    const userStats = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(and(eq(users.organizationId, id), isNull(users.deletedAt)))
      .groupBy(users.role);

    const userCounts = Object.fromEntries(
      userStats.map((s) => [s.role, s.count])
    );

    // Get learner count
    const [learnerCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learners)
      .where(and(eq(learners.organizationId, id), isNull(learners.deletedAt)));

    return NextResponse.json({
      organization: org,
      stats: {
        totalUsers: Object.values(userCounts).reduce((a, b) => a + b, 0),
        parents: userCounts["parent"] || 0,
        teachers: userCounts["teacher"] || 0,
        admins:
          (userCounts["platform_admin"] || 0) +
          (userCounts["school_admin"] || 0),
        learners: learnerCount?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// Schema for updating an organization
const updateOrgSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  type: z.enum(["family", "school", "district"]).optional(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  customDomain: z.string().max(255).optional().nullable(),
  subscriptionTier: z.enum(["free", "paid"]).optional(),
  subscriptionExpiresAt: z.string().datetime().optional().nullable(),
  settings: z
    .object({
      allowTeacherInvites: z.boolean().optional(),
      maxLearners: z.number().int().positive().optional(),
      enabledSubjects: z.array(z.string()).optional(),
      enabledGrades: z.array(z.number().int().min(0).max(12)).optional(),
    })
    .optional(),
});

// PATCH /api/admin/organizations/[id] - Update organization
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is platform admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden - only platform admins can update organizations" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateOrgSchema.parse(body);

    // Check if organization exists
    const [existing] = await db
      .select({ id: organizations.id, settings: organizations.settings })
      .from(organizations)
      .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)));

    if (!existing) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changing
    if (data.slug) {
      const [slugConflict] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(
          and(
            eq(organizations.slug, data.slug),
            isNull(organizations.deletedAt)
          )
        );

      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: "Slug already in use by another organization" },
          { status: 400 }
        );
      }
    }

    // Merge settings if provided
    const mergedSettings = data.settings
      ? {
          ...((existing.settings as Record<string, unknown>) || {}),
          ...data.settings,
        }
      : undefined;

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.primaryColor !== undefined)
      updateData.primaryColor = data.primaryColor;
    if (data.customDomain !== undefined)
      updateData.customDomain = data.customDomain;
    if (data.subscriptionTier !== undefined)
      updateData.subscriptionTier = data.subscriptionTier;
    if (data.subscriptionExpiresAt !== undefined)
      updateData.subscriptionExpiresAt = data.subscriptionExpiresAt
        ? new Date(data.subscriptionExpiresAt)
        : null;
    if (mergedSettings !== undefined) updateData.settings = mergedSettings;

    // Update the organization
    const [updated] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, id))
      .returning();

    return NextResponse.json({ organization: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/organizations/[id] - Soft delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is platform admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden - only platform admins can delete organizations" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // Check if organization exists
    const [existing] = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)));

    if (!existing) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Prevent deleting the default organization
    if (id === "00000000-0000-0000-0000-000000000001") {
      return NextResponse.json(
        { error: "Cannot delete the default organization" },
        { status: 400 }
      );
    }

    // Check for active users
    const [userCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.organizationId, id), isNull(users.deletedAt)));

    if (userCount && userCount.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete organization with ${userCount.count} active users. Transfer or remove users first.`,
          userCount: userCount.count,
        },
        { status: 400 }
      );
    }

    // Soft delete the organization
    await db
      .update(organizations)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id));

    return NextResponse.json({
      success: true,
      message: `Organization "${existing.name}" has been deleted`,
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
