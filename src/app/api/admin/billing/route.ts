import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { getBillingStats, getAllSubscriptions } from "@/lib/stripe/billing-service";
import { validatePagination, PAGINATION_PRESETS } from "@/lib/api/pagination";

/**
 * GET /api/admin/billing
 * Get billing stats and all subscriptions (platform admin only)
 */
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: "Forbidden - Platform admin access required" }, { status: 403 });
  }

  try {
    const { limit, offset } = validatePagination(
      request.nextUrl.searchParams,
      PAGINATION_PRESETS.admin
    );

    const [stats, subscriptionsData] = await Promise.all([
      getBillingStats(),
      getAllSubscriptions(limit, offset),
    ]);

    return NextResponse.json({
      stats,
      subscriptions: subscriptionsData.subscriptions,
      total: subscriptionsData.total,
    });
  } catch (error) {
    console.error("Error fetching billing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    );
  }
}
