import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { users } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { auditLogs, AUDIT_CATEGORIES } from "@/lib/db/schema/audit";
import { eq, and, desc, sql, ilike, or, gte, lte } from "drizzle-orm";
import { validatePagination, PAGINATION_PRESETS } from "@/lib/api/pagination";

// GET /api/admin/audit-logs - Get audit logs with filtering
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (
    !currentUser ||
    (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";
  const actionFilter = searchParams.get("action") || "";
  const actorFilter = searchParams.get("actorId") || "";
  const resourceTypeFilter = searchParams.get("resourceType") || "";
  const statusFilter = searchParams.get("status") || "";
  const orgFilter = searchParams.get("organizationId") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const { limit, offset } = validatePagination(
    searchParams,
    PAGINATION_PRESETS.standard
  );

  try {
    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(auditLogs.description, `%${search}%`),
          ilike(auditLogs.resourceName, `%${search}%`),
          ilike(auditLogs.actorEmail, `%${search}%`),
          ilike(auditLogs.action, `%${search}%`)
        ) as ReturnType<typeof eq>
      );
    }

    if (categoryFilter) {
      conditions.push(eq(auditLogs.category, categoryFilter));
    }

    if (actionFilter) {
      conditions.push(eq(auditLogs.action, actionFilter));
    }

    if (actorFilter) {
      conditions.push(eq(auditLogs.actorId, actorFilter));
    }

    if (resourceTypeFilter) {
      conditions.push(eq(auditLogs.resourceType, resourceTypeFilter));
    }

    if (statusFilter) {
      conditions.push(eq(auditLogs.status, statusFilter));
    }

    if (orgFilter) {
      conditions.push(eq(auditLogs.organizationId, orgFilter));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
    }

    // Get audit logs with actor and org info
    const logsData = await db
      .select({
        id: auditLogs.id,
        actorId: auditLogs.actorId,
        actorRole: auditLogs.actorRole,
        actorEmail: auditLogs.actorEmail,
        actorName: users.name,
        organizationId: auditLogs.organizationId,
        organizationName: organizations.name,
        action: auditLogs.action,
        category: auditLogs.category,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        resourceName: auditLogs.resourceName,
        description: auditLogs.description,
        metadata: auditLogs.metadata,
        status: auditLogs.status,
        errorMessage: auditLogs.errorMessage,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .leftJoin(organizations, eq(auditLogs.organizationId, organizations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get category breakdown for filters
    const categoryStats = await db
      .select({
        category: auditLogs.category,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLogs)
      .groupBy(auditLogs.category);

    // Get action breakdown for filters
    const actionStats = await db
      .select({
        action: auditLogs.action,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLogs)
      .groupBy(auditLogs.action)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(20);

    // Get resource type breakdown
    const resourceTypeStats = await db
      .select({
        resourceType: auditLogs.resourceType,
        count: sql<number>`count(*)::int`,
      })
      .from(auditLogs)
      .groupBy(auditLogs.resourceType)
      .orderBy(desc(sql<number>`count(*)`));

    // Get recent unique actors for filter
    const recentActors = await db
      .select({
        actorId: auditLogs.actorId,
        actorEmail: auditLogs.actorEmail,
        actorName: users.name,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .groupBy(auditLogs.actorId, auditLogs.actorEmail, users.name)
      .orderBy(desc(sql`max(${auditLogs.createdAt})`))
      .limit(20);

    return NextResponse.json({
      logs: logsData,
      total: countResult?.count || 0,
      filters: {
        categories: Object.values(AUDIT_CATEGORIES),
        categoryStats,
        actionStats,
        resourceTypeStats,
        recentActors,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
