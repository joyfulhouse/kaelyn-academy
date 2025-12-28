import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema/marketing";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkFormRateLimit } from "@/lib/rate-limit";
import { validateBodySize, BODY_SIZE_PRESETS } from "@/lib/api/body-size";
import { validateUnsubscribeToken } from "@/lib/api/newsletter-tokens";
import { handleApiError } from "@/lib/api/error-handler";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  source: z.string().optional().default("website"),
  interests: z.array(z.string()).optional(),
});

/**
 * POST /api/newsletter - Subscribe to the newsletter
 */
export async function POST(request: NextRequest) {
  // SECURITY: Rate limit form submissions to prevent spam
  const rateLimitResult = await checkFormRateLimit(request);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  // SECURITY: Validate request body size to prevent DoS
  const bodySizeResult = await validateBodySize(request, BODY_SIZE_PRESETS.form);
  if (!bodySizeResult.success) {
    return bodySizeResult.response;
  }

  try {
    const body = await request.json();
    const data = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await db
      .select({ id: newsletterSubscriptions.id, status: newsletterSubscriptions.status })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, data.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      const subscription = existing[0];

      if (subscription.status === "active") {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed to our newsletter!",
          alreadySubscribed: true,
        });
      }

      // Reactivate if previously unsubscribed
      if (subscription.status === "unsubscribed") {
        await db
          .update(newsletterSubscriptions)
          .set({
            status: "active",
            unsubscribedAt: null,
            subscribedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscriptions.id, subscription.id));

        return NextResponse.json({
          success: true,
          message: "Welcome back! You've been resubscribed to our newsletter.",
          resubscribed: true,
        });
      }
    }

    // Create new subscription
    await db.insert(newsletterSubscriptions).values({
      email: data.email.toLowerCase(),
      name: data.name,
      source: data.source,
      interests: data.interests,
      status: "active",
      subscribedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! Check your inbox for updates.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/newsletter - Unsubscribe from the newsletter
 *
 * SECURITY: Uses signed tokens to prevent CSRF attacks.
 * Tokens are generated when sending newsletters and contain:
 * - Email (base64 encoded)
 * - Timestamp (for expiry)
 * - HMAC signature (for validation)
 *
 * Expects: ?token=xxx (signed unsubscribe token)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          error: "Invalid unsubscribe link",
          detail: "A valid unsubscribe token is required. Please use the link from your email.",
        },
        { status: 400 }
      );
    }

    // SECURITY: Validate the signed token
    const tokenResult = validateUnsubscribeToken(token);

    if (!tokenResult.valid) {
      return NextResponse.json(
        {
          error: "Invalid or expired unsubscribe link",
          detail: tokenResult.error,
        },
        { status: 400 }
      );
    }

    const email = tokenResult.email;

    const existing = await db
      .select({ id: newsletterSubscriptions.id })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email.toLowerCase()))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Email not found in our newsletter list.",
      });
    }

    await db
      .update(newsletterSubscriptions)
      .set({
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.id, existing[0].id));

    return NextResponse.json({
      success: true,
      message: "You've been unsubscribed. We're sorry to see you go!",
    });
  } catch (error) {
    return handleApiError(error, "newsletter unsubscribe");
  }
}
