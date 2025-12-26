import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type Role = "learner" | "parent" | "teacher" | "admin";

export type Permission =
  | "read:own_progress"
  | "read:child_progress"
  | "read:class_progress"
  | "read:all_progress"
  | "write:own_profile"
  | "write:child_settings"
  | "write:class_content"
  | "write:all_content"
  | "manage:users"
  | "manage:organizations"
  | "manage:curriculum"
  | "manage:agents"
  | "view:analytics"
  | "view:admin_dashboard";

// Role-permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  learner: [
    "read:own_progress",
    "write:own_profile",
  ],
  parent: [
    "read:own_progress",
    "read:child_progress",
    "write:own_profile",
    "write:child_settings",
  ],
  teacher: [
    "read:own_progress",
    "read:class_progress",
    "write:own_profile",
    "write:class_content",
    "view:analytics",
  ],
  admin: [
    "read:own_progress",
    "read:child_progress",
    "read:class_progress",
    "read:all_progress",
    "write:own_profile",
    "write:child_settings",
    "write:class_content",
    "write:all_content",
    "manage:users",
    "manage:organizations",
    "manage:curriculum",
    "manage:agents",
    "view:analytics",
    "view:admin_dashboard",
  ],
};

// Role hierarchy for inheritance
const roleHierarchy: Record<Role, number> = {
  learner: 1,
  parent: 2,
  teacher: 3,
  admin: 4,
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if roleA is at least as privileged as roleB
 */
export function isRoleAtLeast(roleA: Role, roleB: Role): boolean {
  return roleHierarchy[roleA] >= roleHierarchy[roleB];
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Server-side auth check with role requirement
 * Use in server components and API routes
 */
export async function requireRole(
  allowedRoles: Role | Role[],
  redirectUrl = "/login"
): Promise<{ id: string; email: string; role: Role; organizationId?: string }> {
  const session = await auth();

  if (!session?.user) {
    redirect(`${redirectUrl}?callbackUrl=${encodeURIComponent("/")}`);
  }

  const userRole = session.user.role;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    redirect("/unauthorized");
  }

  return {
    id: session.user.id!,
    email: session.user.email!,
    role: userRole,
    organizationId: session.user.organizationId ?? undefined,
  };
}

/**
 * Server-side auth check with permission requirement
 */
export async function requirePermission(
  permission: Permission | Permission[],
  redirectUrl = "/login"
): Promise<{ id: string; email: string; role: Role; organizationId?: string }> {
  const session = await auth();

  if (!session?.user) {
    redirect(`${redirectUrl}?callbackUrl=${encodeURIComponent("/")}`);
  }

  const userRole = session.user.role;
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasAccess = permissions.some((p) => hasPermission(userRole, p));

  if (!hasAccess) {
    redirect("/unauthorized");
  }

  return {
    id: session.user.id!,
    email: session.user.email!,
    role: userRole,
    organizationId: session.user.organizationId ?? undefined,
  };
}

/**
 * Check if user can access a specific learner's data
 * - Learners can access their own data
 * - Parents can access their children's data
 * - Teachers can access their students' data (same organization)
 * - Admins can access all data
 */
export async function canAccessLearner(
  learnerId: string,
  userId: string,
  userRole: Role,
  organizationId?: string
): Promise<boolean> {
  if (userRole === "admin") return true;

  if (userRole === "learner") {
    // Learners can only access their own learner profile
    // Check if learnerId matches a learner owned by this user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, learnerId),
        eq(learners.userId, userId)
      ),
    });
    return !!learner;
  }

  if (userRole === "parent") {
    // Parents can access learners they own (their children)
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, learnerId),
        eq(learners.userId, userId)
      ),
    });
    return !!learner;
  }

  if (userRole === "teacher") {
    // Teachers can access learners in their organization
    // This is a simplified check - in a full implementation,
    // you'd check class membership via a classes/enrollments table
    if (!organizationId) return false;

    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, learnerId),
        eq(learners.organizationId, organizationId)
      ),
    });
    return !!learner;
  }

  return false;
}

/**
 * Require access to a specific learner (for API routes)
 * Throws an error if access is denied
 */
export async function requireLearnerAccess(
  learnerId: string
): Promise<{ userId: string; role: Role; organizationId?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthorizationError("Authentication required");
  }

  const userRole = session.user.role ?? "learner";
  const organizationId = session.user.organizationId ?? undefined;

  const hasAccess = await canAccessLearner(learnerId, session.user.id, userRole, organizationId);

  if (!hasAccess) {
    throw new AuthorizationError("You do not have access to this learner's data");
  }

  return {
    userId: session.user.id,
    role: userRole,
    organizationId,
  };
}

/**
 * Authorization error class
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }

  toResponse(): Response {
    return Response.json(
      { error: this.message },
      { status: 403 }
    );
  }
}

/**
 * React hook-friendly permission check (for client components)
 */
export function createPermissionChecker(role: Role) {
  return {
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    isAtLeast: (targetRole: Role) => isRoleAtLeast(role, targetRole),
    permissions: getPermissions(role),
  };
}
