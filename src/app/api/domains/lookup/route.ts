/**
 * Domain Lookup API
 *
 * Internal API endpoint used by middleware for fast domain lookups.
 * This endpoint is optimized for edge runtime and caching.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizations, organizationDomains } from "@/lib/db/schema/organizations";
import { eq, and, isNull } from "drizzle-orm";

// Cache headers for edge caching
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
};

/**
 * GET /api/domains/lookup?domain=example.com
 *
 * Look up organization by custom domain.
 * Used by middleware for routing decisions.
 */
export async function GET(request: NextRequest) {
  // Verify this is an internal request (from middleware)
  const isInternal = request.headers.get("x-internal-request") === "true";

  // Allow external requests in development for testing
  if (!isInternal && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const domain = request.nextUrl.searchParams.get("domain");

  if (!domain) {
    return NextResponse.json(
      { error: "Domain parameter required" },
      { status: 400 }
    );
  }

  // Normalize domain
  const normalizedDomain = domain.toLowerCase().trim();

  try {
    const result = await db
      .select({
        organizationId: organizationDomains.organizationId,
        organizationSlug: organizations.slug,
        organizationName: organizations.name,
        verified: organizationDomains.verificationStatus,
        routingEnabled: organizationDomains.routingEnabled,
        forceHttps: organizationDomains.forceHttps,
        redirectToWww: organizationDomains.redirectToWww,
        primaryColor: organizations.primaryColor,
        logoUrl: organizations.logoUrl,
      })
      .from(organizationDomains)
      .innerJoin(organizations, eq(organizationDomains.organizationId, organizations.id))
      .where(
        and(
          eq(organizationDomains.domain, normalizedDomain),
          isNull(organizationDomains.deletedAt),
          isNull(organizations.deletedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404, headers: CACHE_HEADERS }
      );
    }

    const config = result[0];

    return NextResponse.json(
      {
        organizationId: config.organizationId,
        organizationSlug: config.organizationSlug,
        organizationName: config.organizationName,
        verified: config.verified === "verified",
        routingEnabled: config.routingEnabled,
        forceHttps: config.forceHttps,
        redirectToWww: config.redirectToWww,
        branding: {
          primaryColor: config.primaryColor,
          logoUrl: config.logoUrl,
        },
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Domain lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
