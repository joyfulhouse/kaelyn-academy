import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import {
  getOrganizationSubscription,
  upsertSubscription,
} from "@/lib/stripe/billing-service";
import { z } from "zod";

/**
 * GET /api/billing/subscription
 * Get current organization subscription
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
    const subscription = await getOrganizationSubscription(user.organizationId);
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

const updateSubscriptionSchema = z.object({
  planSlug: z.string().min(1),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

/**
 * POST /api/billing/subscription
 * Update organization subscription (admin only, for manual updates without Stripe)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || !["platform_admin", "school_admin"].includes(currentUser.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!currentUser.organizationId) {
    return NextResponse.json(
      { error: "User not associated with an organization" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = updateSubscriptionSchema.parse(body);

    const result = await upsertSubscription(
      currentUser.organizationId,
      data.planSlug,
      data.billingCycle
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      subscriptionId: result.subscriptionId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
