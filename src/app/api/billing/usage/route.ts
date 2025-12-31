import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { getCurrentAiUsage, checkAiUsageLimit } from "@/lib/stripe/billing-service";

/**
 * GET /api/billing/usage
 * Get current AI usage for the organization
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's organization
  const [user] = await db
    .select({ organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user?.organizationId) {
    return NextResponse.json(
      { error: "User not associated with an organization" },
      { status: 400 }
    );
  }

  try {
    const [usage, limits] = await Promise.all([
      getCurrentAiUsage(user.organizationId),
      checkAiUsageLimit(user.organizationId),
    ]);

    return NextResponse.json({
      usage,
      limits: {
        used: limits.used,
        limit: limits.limit,
        percentUsed: limits.percentUsed,
        withinLimit: limits.withinLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
