import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentApprovalRequests, learners, users } from "@/lib/db/schema";
import { eq, and, desc, isNull, inArray } from "drizzle-orm";
import { z } from "zod";

/**
 * GET /api/parent/approvals - Get all content approval requests for the parent
 *
 * Query params:
 * - status: Filter by status (pending, approved, denied, expired)
 * - learnerId: Filter by specific learner
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a parent
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const learnerIdFilter = searchParams.get("learnerId");

    // Build query conditions
    const conditions = [eq(contentApprovalRequests.parentUserId, session.user.id)];

    if (statusFilter) {
      conditions.push(eq(contentApprovalRequests.status, statusFilter));
    }

    if (learnerIdFilter) {
      conditions.push(eq(contentApprovalRequests.learnerId, learnerIdFilter));
    }

    // Fetch approval requests
    const approvals = await db
      .select({
        id: contentApprovalRequests.id,
        learnerId: contentApprovalRequests.learnerId,
        contentType: contentApprovalRequests.contentType,
        contentId: contentApprovalRequests.contentId,
        contentTitle: contentApprovalRequests.contentTitle,
        contentDescription: contentApprovalRequests.contentDescription,
        contentMetadata: contentApprovalRequests.contentMetadata,
        status: contentApprovalRequests.status,
        requestReason: contentApprovalRequests.requestReason,
        responseReason: contentApprovalRequests.responseReason,
        respondedAt: contentApprovalRequests.respondedAt,
        expiresAt: contentApprovalRequests.expiresAt,
        createdAt: contentApprovalRequests.createdAt,
        updatedAt: contentApprovalRequests.updatedAt,
      })
      .from(contentApprovalRequests)
      .where(and(...conditions))
      .orderBy(desc(contentApprovalRequests.createdAt));

    // Get learner information for the approval requests
    const learnerIds = [...new Set(approvals.map((a) => a.learnerId))];
    const learnerInfo =
      learnerIds.length > 0
        ? await db
            .select({
              id: learners.id,
              name: learners.name,
              gradeLevel: learners.gradeLevel,
              avatarUrl: learners.avatarUrl,
            })
            .from(learners)
            .where(
              and(
                inArray(learners.id, learnerIds),
                eq(learners.userId, session.user.id),
                isNull(learners.deletedAt)
              )
            )
        : [];

    const learnerMap = new Map(learnerInfo.map((l) => [l.id, l]));

    // Combine data
    const approvalsWithLearners = approvals.map((approval) => ({
      ...approval,
      learner: learnerMap.get(approval.learnerId) || null,
    }));

    // Get summary counts
    const allApprovals = await db
      .select({
        status: contentApprovalRequests.status,
      })
      .from(contentApprovalRequests)
      .where(eq(contentApprovalRequests.parentUserId, session.user.id));

    const counts = {
      pending: allApprovals.filter((a) => a.status === "pending").length,
      approved: allApprovals.filter((a) => a.status === "approved").length,
      denied: allApprovals.filter((a) => a.status === "denied").length,
      expired: allApprovals.filter((a) => a.status === "expired").length,
      total: allApprovals.length,
    };

    return NextResponse.json({
      approvals: approvalsWithLearners,
      counts,
    });
  } catch (error) {
    console.error("Error fetching content approvals:", error);
    return NextResponse.json(
      { error: "Failed to fetch content approvals" },
      { status: 500 }
    );
  }
}

// Schema for updating approval status
const updateApprovalSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "denied"]),
  responseReason: z.string().optional(),
});

/**
 * PATCH /api/parent/approvals - Update approval status (approve/deny)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a parent
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateApprovalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { id, status, responseReason } = parsed.data;

    // Verify the approval request belongs to this parent
    const existingApproval = await db.query.contentApprovalRequests.findFirst({
      where: and(
        eq(contentApprovalRequests.id, id),
        eq(contentApprovalRequests.parentUserId, session.user.id)
      ),
    });

    if (!existingApproval) {
      return NextResponse.json(
        { error: "Approval request not found" },
        { status: 404 }
      );
    }

    if (existingApproval.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // Update the approval status
    const [updatedApproval] = await db
      .update(contentApprovalRequests)
      .set({
        status,
        responseReason: responseReason || null,
        respondedAt: new Date(),
        respondedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(contentApprovalRequests.id, id))
      .returning();

    return NextResponse.json({
      approval: updatedApproval,
      message: `Content ${status === "approved" ? "approved" : "denied"} successfully`,
    });
  } catch (error) {
    console.error("Error updating content approval:", error);
    return NextResponse.json(
      { error: "Failed to update content approval" },
      { status: 500 }
    );
  }
}

// Schema for bulk update
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(["approved", "denied"]),
  responseReason: z.string().optional(),
});

/**
 * POST /api/parent/approvals - Bulk approve/deny multiple requests
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a parent
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = bulkUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { ids, status, responseReason } = parsed.data;

    // Verify all approval requests belong to this parent and are pending
    const existingApprovals = await db
      .select({ id: contentApprovalRequests.id, status: contentApprovalRequests.status })
      .from(contentApprovalRequests)
      .where(
        and(
          inArray(contentApprovalRequests.id, ids),
          eq(contentApprovalRequests.parentUserId, session.user.id)
        )
      );

    const validIds = existingApprovals
      .filter((a) => a.status === "pending")
      .map((a) => a.id);

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid pending requests found" },
        { status: 400 }
      );
    }

    // Update all valid approvals
    await db
      .update(contentApprovalRequests)
      .set({
        status,
        responseReason: responseReason || null,
        respondedAt: new Date(),
        respondedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(inArray(contentApprovalRequests.id, validIds));

    return NextResponse.json({
      message: `${validIds.length} request(s) ${status === "approved" ? "approved" : "denied"} successfully`,
      processedCount: validIds.length,
      skippedCount: ids.length - validIds.length,
    });
  } catch (error) {
    console.error("Error bulk updating content approvals:", error);
    return NextResponse.json(
      { error: "Failed to update content approvals" },
      { status: 500 }
    );
  }
}
