/**
 * Domain Verification API
 *
 * Trigger domain ownership verification via DNS TXT record.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { auditHelpers } from "@/lib/audit";
import { getDomain, verifyDomain } from "@/lib/services/domain-service";

export async function POST(
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
    const domain = await getDomain(domainId);

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    if (domain.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Already verified
    if (domain.verificationStatus === "verified") {
      return NextResponse.json({
        success: true,
        status: "verified",
        message: "Domain is already verified",
      });
    }

    // Perform verification
    const result = await verifyDomain(domainId);

    // Log the verification attempt
    await auditHelpers.logAction({
      actorId: session.user.id,
      actorRole: currentUser.role,
      actorEmail: session.user.email ?? undefined,
      action: result.success ? "domain_verified" : "domain_verification_failed",
      resourceType: "organization_domain",
      resourceId: domainId,
      resourceName: domain.domain,
      metadata: {
        organizationId,
        verificationResult: result,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error verifying domain:", error);
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}
