import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { getOrganizationInvoices } from "@/lib/stripe/billing-service";
import { validatePagination, PAGINATION_PRESETS } from "@/lib/api/pagination";

/**
 * GET /api/billing/invoices
 * Get organization invoices
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  // Only admins can view invoices
  if (!["platform_admin", "school_admin", "parent"].includes(user.role ?? "")) {
    return NextResponse.json(
      { error: "Only organization admins can view invoices" },
      { status: 403 }
    );
  }

  try {
    const { limit } = validatePagination(
      request.nextUrl.searchParams,
      PAGINATION_PRESETS.standard
    );

    const invoices = await getOrganizationInvoices(user.organizationId, limit);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
