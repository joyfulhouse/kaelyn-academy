import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { createPortalSession } from "@/lib/stripe/billing-service";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * POST /api/billing/portal
 * Create a Stripe customer portal session
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payment processing is not configured" },
      { status: 503 }
    );
  }

  // Get user's organization
  const [user] = await db
    .select({ organizationId: users.organizationId, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user?.organizationId) {
    return NextResponse.json(
      { error: "User not associated with an organization" },
      { status: 400 }
    );
  }

  // Only admins can access billing portal
  if (!["platform_admin", "school_admin", "parent"].includes(user.role ?? "")) {
    return NextResponse.json(
      { error: "Only organization admins can manage billing" },
      { status: 403 }
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/admin/billing`;

    const result = await createPortalSession(user.organizationId, returnUrl);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ portalUrl: result.portalUrl });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
