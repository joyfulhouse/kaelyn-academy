import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe/billing-service";
import { isStripeConfigured } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  planSlug: z.string().min(1),
  billingCycle: z.enum(["monthly", "yearly"]),
});

/**
 * POST /api/billing/checkout
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
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

  // Only admins can manage billing
  if (!["platform_admin", "school_admin", "parent"].includes(user.role ?? "")) {
    return NextResponse.json(
      { error: "Only organization admins can manage billing" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/admin/billing?success=true`;
    const cancelUrl = `${baseUrl}/admin/billing?canceled=true`;

    const result = await createCheckoutSession(
      user.organizationId,
      data.planSlug,
      data.billingCycle,
      successUrl,
      cancelUrl
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ sessionUrl: result.sessionUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
