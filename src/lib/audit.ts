import { db } from "@/lib/db";
import {
  auditLogs,
  AUDIT_ACTIONS,
  AUDIT_CATEGORIES,
  type AuditAction,
  type AuditCategory,
} from "@/lib/db/schema/audit";
import { headers } from "next/headers";

export interface AuditLogEntry {
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  organizationId?: string | null;
  action: AuditAction;
  category: AuditCategory;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  description?: string;
  metadata?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Record<string, { from: unknown; to: unknown }>;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
  status?: "success" | "failure" | "pending";
  errorMessage?: string;
}

/**
 * Create an audit log entry for administrative actions.
 * This function should be called after any admin action to maintain an audit trail.
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Try to get request headers for additional context
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    try {
      const headersList = await headers();
      ipAddress =
        headersList.get("x-forwarded-for")?.split(",")[0] ||
        headersList.get("x-real-ip") ||
        undefined;
      userAgent = headersList.get("user-agent") || undefined;
    } catch {
      // Headers not available (e.g., in non-request context)
    }

    await db.insert(auditLogs).values({
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      actorEmail: entry.actorEmail,
      organizationId: entry.organizationId ?? null,
      action: entry.action,
      category: entry.category,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      resourceName: entry.resourceName,
      description: entry.description,
      metadata: {
        ...entry.metadata,
        ipAddress: entry.metadata?.ipAddress || ipAddress,
        userAgent: entry.metadata?.userAgent || userAgent,
      },
      status: entry.status ?? "success",
      errorMessage: entry.errorMessage,
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main flow
    console.error("Failed to create audit log entry:", error);
  }
}

/**
 * Helper to compute changes between two objects
 */
export function computeChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const fromVal = before[key];
    const toVal = after[key];

    // Skip if values are the same (deep comparison for objects)
    if (JSON.stringify(fromVal) !== JSON.stringify(toVal)) {
      changes[key] = { from: fromVal, to: toVal };
    }
  }

  return changes;
}

/**
 * Helper function to log admin actions with common patterns
 */
export const auditHelpers = {
  /**
   * Log a resource creation
   */
  async logCreate(params: {
    actorId: string;
    actorRole: string;
    actorEmail?: string;
    organizationId?: string | null;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    resourceData?: Record<string, unknown>;
    description?: string;
  }) {
    const action = `${params.resourceType}.create` as AuditAction;
    const category = getCategoryForResourceType(params.resourceType);

    await createAuditLog({
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorEmail: params.actorEmail,
      organizationId: params.organizationId,
      action,
      category,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      description:
        params.description ||
        `Created ${params.resourceType}: ${params.resourceName || params.resourceId}`,
      metadata: params.resourceData ? { after: params.resourceData } : undefined,
    });
  },

  /**
   * Log a resource update
   */
  async logUpdate(params: {
    actorId: string;
    actorRole: string;
    actorEmail?: string;
    organizationId?: string | null;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    description?: string;
  }) {
    const action = `${params.resourceType}.update` as AuditAction;
    const category = getCategoryForResourceType(params.resourceType);
    const changes = computeChanges(params.before, params.after);

    // Only log if there are actual changes
    if (Object.keys(changes).length === 0) {
      return;
    }

    await createAuditLog({
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorEmail: params.actorEmail,
      organizationId: params.organizationId,
      action,
      category,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      description:
        params.description ||
        `Updated ${params.resourceType}: ${params.resourceName || params.resourceId}`,
      metadata: { before: params.before, after: params.after, changes },
    });
  },

  /**
   * Log a resource deletion
   */
  async logDelete(params: {
    actorId: string;
    actorRole: string;
    actorEmail?: string;
    organizationId?: string | null;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    resourceData?: Record<string, unknown>;
    description?: string;
    reason?: string;
  }) {
    const action = `${params.resourceType}.delete` as AuditAction;
    const category = getCategoryForResourceType(params.resourceType);

    await createAuditLog({
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorEmail: params.actorEmail,
      organizationId: params.organizationId,
      action,
      category,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      description:
        params.description ||
        `Deleted ${params.resourceType}: ${params.resourceName || params.resourceId}`,
      metadata: {
        before: params.resourceData,
        reason: params.reason,
      },
    });
  },

  /**
   * Log a custom action
   */
  async logAction(params: {
    actorId: string;
    actorRole: string;
    actorEmail?: string;
    organizationId?: string | null;
    action: string;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    status?: "success" | "failure" | "pending";
  }) {
    const category = getCategoryForResourceType(params.resourceType);

    await createAuditLog({
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorEmail: params.actorEmail,
      organizationId: params.organizationId,
      action: params.action as AuditAction,
      category,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      description: params.description,
      metadata: params.metadata,
      status: params.status,
    });
  },
};

function getCategoryForResourceType(resourceType: string): AuditCategory {
  const categoryMap: Record<string, AuditCategory> = {
    user: AUDIT_CATEGORIES.USER,
    learner: AUDIT_CATEGORIES.LEARNER,
    organization: AUDIT_CATEGORIES.ORGANIZATION,
    organization_domain: AUDIT_CATEGORIES.ORGANIZATION,
    subject: AUDIT_CATEGORIES.CONTENT,
    unit: AUDIT_CATEGORIES.CONTENT,
    lesson: AUDIT_CATEGORIES.CONTENT,
    concept: AUDIT_CATEGORIES.CONTENT,
    activity: AUDIT_CATEGORIES.CONTENT,
    consent: AUDIT_CATEGORIES.CONSENT,
    settings: AUDIT_CATEGORIES.SETTINGS,
  };

  return categoryMap[resourceType] || AUDIT_CATEGORIES.DATA;
}

// Re-export action constants for convenience
export { AUDIT_ACTIONS, AUDIT_CATEGORIES };
