import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, learners } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, sql, isNull, or, ilike, desc, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { validatePagination, PAGINATION_PRESETS } from "@/lib/api/pagination";
import { z } from "zod";

// GET /api/admin/users - Get all users with stats
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin and get their organization
  const [currentUser] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";
  // SECURITY: Validate pagination bounds to prevent abuse
  const { limit, offset } = validatePagination(searchParams, PAGINATION_PRESETS.admin);

  // SECURITY: school_admin can only see users in their organization
  const isPlatformAdmin = currentUser.role === "platform_admin";
  const adminOrgId = currentUser.organizationId;

  if (!isPlatformAdmin && !adminOrgId) {
    return NextResponse.json({ error: "School admin must have an organization" }, { status: 400 });
  }

  try {
    // Build where conditions
    const conditions = [isNull(users.deletedAt)];

    // SECURITY: Add organization filter for school_admin
    if (!isPlatformAdmin && adminOrgId) {
      conditions.push(eq(users.organizationId, adminOrgId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        ) as ReturnType<typeof isNull>
      );
    }

    if (roleFilter) {
      conditions.push(eq(users.role, roleFilter));
    }

    // Get users with organization info
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        organizationId: users.organizationId,
        organizationName: organizations.name,
        isAdult: users.isAdult,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .leftJoin(organizations, eq(users.organizationId, organizations.id))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(...conditions));

    // Get learner counts - SECURITY: Scoped by organization for school_admin
    const learnerConditions = [isNull(learners.deletedAt)];
    if (!isPlatformAdmin && adminOrgId) {
      learnerConditions.push(eq(learners.organizationId, adminOrgId));
    }
    const [learnerCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learners)
      .where(and(...learnerConditions));

    // Get role breakdown - SECURITY: Scoped by organization for school_admin
    const roleConditions = [isNull(users.deletedAt)];
    if (!isPlatformAdmin && adminOrgId) {
      roleConditions.push(eq(users.organizationId, adminOrgId));
    }
    const roleStats = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(and(...roleConditions))
      .groupBy(users.role);

    const roleCounts = Object.fromEntries(
      roleStats.map((r) => [r.role, r.count])
    );

    // Get parent user IDs for batch activity query
    const parentUserIds = allUsers
      .filter((u) => u.role === "parent")
      .map((u) => u.id);

    // Batch query: Get last activity for all parents at once
    const parentActivityMap = new Map<string, string | null>();
    if (parentUserIds.length > 0) {
      const parentActivity = await db
        .select({
          userId: learners.userId,
          lastActivityAt: sql<string>`max(${learnerSubjectProgress.lastActivityAt})`,
        })
        .from(learners)
        .innerJoin(learnerSubjectProgress, eq(learners.id, learnerSubjectProgress.learnerId))
        .where(inArray(learners.userId, parentUserIds))
        .groupBy(learners.userId);

      for (const activity of parentActivity) {
        parentActivityMap.set(activity.userId, activity.lastActivityAt);
      }
    }

    // Map users with activity using in-memory lookup
    const usersWithActivity = allUsers.map((user) => {
      if (user.role === "parent") {
        return {
          ...user,
          lastActiveAt: parentActivityMap.get(user.id) || null,
          isActive: !user.deletedAt,
        };
      }

      return {
        ...user,
        lastActiveAt: user.updatedAt?.toISOString() || null,
        isActive: !user.deletedAt,
      };
    });

    return NextResponse.json({
      users: usersWithActivity,
      total: countResult?.count || 0,
      stats: {
        total: countResult?.count || 0,
        learners: learnerCount?.count || 0,
        parents: roleCounts["parent"] || 0,
        teachers: roleCounts["teacher"] || 0,
        admins: (roleCounts["platform_admin"] || 0) + (roleCounts["school_admin"] || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Schema for creating a user
const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.enum(["parent", "teacher", "school_admin", "platform_admin"]),
  organizationId: z.string().uuid().optional(),
});

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json({ error: "Forbidden - only platform admins can create users" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email));

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        role: data.role,
        organizationId: data.organizationId,
        isAdult: true,
      })
      .returning();

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
