/**
 * Individual Domain Management API
 *
 * Get, update, and delete individual custom domains.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { auditHelpers } from "@/lib/audit";
import {
  getDomain,
  updateDomain,
  removeDomain,
  getVerificationInstructions,
} from "@/lib/services/domain-service";

// ============================================================================
// GET - Get domain details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; domainId: string }> }
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

  const { id: organizationId, domainId } = await params;

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
    const domain = await getDomain(domainId);

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Verify domain belongs to the organization
    if (domain.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Add verification instructions if pending
    const response = {
      ...domain,
      verificationInstructions:
        domain.verificationStatus === "pending" && domain.verificationToken
          ? getVerificationInstructions(
              domain.domain,
              domain.verificationToken,
              domain.verificationMethod ?? "dns_txt"
            )
          : null,
    };

    return NextResponse.json({ domain: response });
  } catch (error) {
    console.error("Error fetching domain:", error);
    return NextResponse.json(
      { error: "Failed to fetch domain" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update domain settings
// ============================================================================

const updateDomainSchema = z.object({
  isPrimary: z.boolean().optional(),
  routingEnabled: z.boolean().optional(),
  redirectToWww: z.boolean().optional(),
  forceHttps: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; domainId: string }> }
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

  const { id: organizationId, domainId } = await params;

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
    const data = updateDomainSchema.parse(body);

    // Get current domain to verify ownership
    const currentDomain = await getDomain(domainId);

    if (!currentDomain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (currentDomain.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Cannot enable routing if not verified
    if (data.routingEnabled && currentDomain.verificationStatus !== "verified") {
      return NextResponse.json(
        { error: "Cannot enable routing for unverified domain" },
        { status: 400 }
      );
    }

    const updated = await updateDomain(domainId, data);

    // Log the action
    await auditHelpers.logUpdate({
      actorId: session.user.id,
      actorRole: currentUser.role,
      actorEmail: session.user.email ?? undefined,
      resourceType: "organization_domain",
      resourceId: domainId,
      resourceName: updated.domain,
      before: currentDomain as Record<string, unknown>,
      after: updated as Record<string, unknown>,
    });

    return NextResponse.json({ domain: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating domain:", error);
    return NextResponse.json(
      { error: "Failed to update domain" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove domain
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; domainId: string }> }
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

  const { id: organizationId, domainId } = await params;

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
    // Get current domain to verify ownership
    const currentDomain = await getDomain(domainId);

    if (!currentDomain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (currentDomain.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    await removeDomain(domainId);

    // Log the action
    await auditHelpers.logDelete({
      actorId: session.user.id,
      actorRole: currentUser.role,
      actorEmail: session.user.email ?? undefined,
      resourceType: "organization_domain",
      resourceId: domainId,
      resourceName: currentDomain.domain,
      resourceData: currentDomain as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      message: `Domain "${currentDomain.domain}" has been removed`,
    });
  } catch (error) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}
