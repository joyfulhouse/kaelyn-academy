import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { eq, sql, isNull, or, ilike, desc, and, gt, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { validatePagination, PAGINATION_PRESETS } from "@/lib/api/pagination";
import { z } from "zod";
import { auditHelpers } from "@/lib/audit";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/organizations - Get all organizations with stats
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is platform admin
  const [currentUser] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden - only platform admins can manage organizations" },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const tierFilter = searchParams.get("tier") || "";
  const { limit, offset } = validatePagination(
    searchParams,
    PAGINATION_PRESETS.admin
  );

  try {
    // Build where conditions
    const conditions = [isNull(organizations.deletedAt)];

    if (search) {
      conditions.push(
        or(
          ilike(organizations.name, `%${search}%`),
          ilike(organizations.slug, `%${search}%`),
          ilike(organizations.customDomain, `%${search}%`)
        ) as ReturnType<typeof isNull>
      );
    }

    if (typeFilter) {
      conditions.push(eq(organizations.type, typeFilter));
    }

    if (tierFilter) {
      conditions.push(eq(organizations.subscriptionTier, tierFilter));
    }

    // Get organizations
    const allOrgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        type: organizations.type,
        logoUrl: organizations.logoUrl,
        primaryColor: organizations.primaryColor,
        customDomain: organizations.customDomain,
        settings: organizations.settings,
        subscriptionTier: organizations.subscriptionTier,
        subscriptionExpiresAt: organizations.subscriptionExpiresAt,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .where(and(...conditions))
      .orderBy(desc(organizations.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(and(...conditions));

    // Get user counts per organization
    const userCounts = await db
      .select({
        organizationId: users.organizationId,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .groupBy(users.organizationId);

    const userCountMap = new Map(
      userCounts
        .filter((u) => u.organizationId)
        .map((u) => [u.organizationId as string, u.count])
    );

    // Enrich organizations with user counts
    const orgsWithStats = allOrgs.map((org) => ({
      ...org,
      userCount: userCountMap.get(org.id) || 0,
      isExpired:
        org.subscriptionExpiresAt && new Date(org.subscriptionExpiresAt) < new Date(),
    }));

    // Get type breakdown
    const typeStats = await db
      .select({
        type: organizations.type,
        count: sql<number>`count(*)::int`,
      })
      .from(organizations)
      .where(isNull(organizations.deletedAt))
      .groupBy(organizations.type);

    const typeCounts = Object.fromEntries(
      typeStats.map((t) => [t.type, t.count])
    );

    // Get tier breakdown
    const tierStats = await db
      .select({
        tier: organizations.subscriptionTier,
        count: sql<number>`count(*)::int`,
      })
      .from(organizations)
      .where(isNull(organizations.deletedAt))
      .groupBy(organizations.subscriptionTier);

    const tierCounts = Object.fromEntries(
      tierStats.map((t) => [t.tier || "free", t.count])
    );

    // Get expiring soon count (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [expiringCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(
        and(
          isNull(organizations.deletedAt),
          gt(organizations.subscriptionExpiresAt, new Date()),
          lt(organizations.subscriptionExpiresAt, thirtyDaysFromNow)
        )
      );

    return NextResponse.json({
      organizations: orgsWithStats,
      total: countResult?.count || 0,
      stats: {
        total: countResult?.count || 0,
        families: typeCounts["family"] || 0,
        schools: typeCounts["school"] || 0,
        districts: typeCounts["district"] || 0,
        freeTier: tierCounts["free"] || 0,
        paidTier: tierCounts["paid"] || 0,
        expiringSoon: expiringCount?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// Schema for creating an organization
const createOrgSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  type: z.enum(["family", "school", "district"]),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
  customDomain: z.string().max(255).optional().nullable(),
  subscriptionTier: z.enum(["free", "paid"]).optional(),
  settings: z
    .object({
      allowTeacherInvites: z.boolean().optional(),
      maxLearners: z.number().int().positive().optional(),
      enabledSubjects: z.array(z.string()).optional(),
      enabledGrades: z.array(z.number().int().min(0).max(12)).optional(),
    })
    .optional(),
});

// POST /api/admin/organizations - Create a new organization
export async function POST(request: NextRequest) {
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
      { error: "Forbidden - only platform admins can create organizations" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = createOrgSchema.parse(body);

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug));

    if (existing) {
      return NextResponse.json(
        { error: "Organization with this slug already exists" },
        { status: 400 }
      );
    }

    // Create the organization
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: data.name,
        slug,
        type: data.type,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        customDomain: data.customDomain,
        subscriptionTier: data.subscriptionTier || "free",
        settings: data.settings || {
          allowTeacherInvites: true,
          maxLearners: data.type === "family" ? 10 : 1000,
          enabledSubjects: ["math", "reading", "science", "history", "technology"],
          enabledGrades: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
      })
      .returning();

    // Log the create action
    await auditHelpers.logCreate({
      actorId: session.user.id,
      actorRole: currentUser.role,
      actorEmail: session.user.email ?? undefined,
      resourceType: "organization",
      resourceId: newOrg.id,
      resourceName: newOrg.name,
      resourceData: newOrg as Record<string, unknown>,
    });

    return NextResponse.json({ organization: newOrg }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
