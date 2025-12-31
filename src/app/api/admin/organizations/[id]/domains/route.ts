/**
 * Organization Domains API
 *
 * Manage custom domains for an organization.
 * Platform admins and school admins can manage domains.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { auditHelpers } from "@/lib/audit";
import {
  addDomain,
  getOrganizationDomains,
  getVerificationInstructions,
  isValidDomain,
  normalizeDomain,
  isReservedDomain,
} from "@/lib/services/domain-service";

// ============================================================================
// GET - List domains for an organization
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const { id: organizationId } = await params;

  // Check permissions
  const isPlatformAdmin = currentUser.role === "platform_admin";
  const isOrgAdmin =
    currentUser.role === "school_admin" &&
    currentUser.organizationId === organizationId;

  if (!isPlatformAdmin && !isOrgAdmin) {
    return NextResponse.json(
      { error: "Forbidden - insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    // Verify organization exists
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        and(eq(organizations.id, organizationId), isNull(organizations.deletedAt))
      );

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const domains = await getOrganizationDomains(organizationId);

    // Add verification instructions for pending domains
    const domainsWithInstructions = domains.map((domain) => ({
      ...domain,
      verificationInstructions:
        domain.verificationStatus === "pending" && domain.verificationToken
          ? getVerificationInstructions(
              domain.domain,
              domain.verificationToken,
              domain.verificationMethod ?? "dns_txt"
            )
          : null,
    }));

    return NextResponse.json({ domains: domainsWithInstructions });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Add a new domain
// ============================================================================

const addDomainSchema = z.object({
  domain: z.string().min(1).max(255),
  isPrimary: z.boolean().optional().default(false),
  notes: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const { id: organizationId } = await params;

  // Check permissions
  const isPlatformAdmin = currentUser.role === "platform_admin";
  const isOrgAdmin =
    currentUser.role === "school_admin" &&
    currentUser.organizationId === organizationId;

  if (!isPlatformAdmin && !isOrgAdmin) {
    return NextResponse.json(
      { error: "Forbidden - insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = addDomainSchema.parse(body);

    // Normalize and validate domain
    const normalizedDomain = normalizeDomain(data.domain);

    if (!isValidDomain(normalizedDomain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    if (isReservedDomain(normalizedDomain)) {
      return NextResponse.json(
        { error: "This domain is reserved and cannot be used" },
        { status: 400 }
      );
    }

    // Verify organization exists
    const [org] = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(
        and(eq(organizations.id, organizationId), isNull(organizations.deletedAt))
      );

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Add the domain
    const { domain, verificationToken } = await addDomain({
      organizationId,
      domain: normalizedDomain,
      isPrimary: data.isPrimary,
      notes: data.notes,
    });

    // Get verification instructions
    const instructions = getVerificationInstructions(
      normalizedDomain,
      verificationToken,
      "dns_txt"
    );

    // Log the action
    await auditHelpers.logCreate({
      actorId: session.user.id,
      actorRole: currentUser.role,
      actorEmail: session.user.email ?? undefined,
      resourceType: "organization_domain",
      resourceId: domain.id,
      resourceName: normalizedDomain,
      resourceData: {
        organizationId,
        organizationName: org.name,
        domain: normalizedDomain,
      },
    });

    return NextResponse.json(
      {
        domain,
        verificationInstructions: instructions,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Domain is already registered") {
      return NextResponse.json(
        { error: "This domain is already registered" },
        { status: 409 }
      );
    }

    console.error("Error adding domain:", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
}
