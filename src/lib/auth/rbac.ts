import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { eq, and, inArray } from "drizzle-orm";

export type Role = "learner" | "parent" | "teacher" | "admin" | "platform_admin" | "school_admin";

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
  platform_admin: [
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
  school_admin: [
    "read:own_progress",
    "read:child_progress",
    "read:class_progress",
    "read:all_progress",
    "write:own_profile",
    "write:child_settings",
    "write:class_content",
    "write:all_content",
    "manage:users",
    "manage:curriculum",
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
  school_admin: 4,
  platform_admin: 5,
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
    // SECURITY: Teachers can ONLY access learners enrolled in their classes
    // This enforces proper teacher-student boundaries
    if (!organizationId) return false;

    // Get all class IDs where this teacher is the owner
    const teacherClasses = await db
      .select({ id: classes.id })
      .from(classes)
      .where(
        and(
          eq(classes.teacherId, userId),
          eq(classes.organizationId, organizationId),
          eq(classes.isActive, true)
        )
      );

    if (teacherClasses.length === 0) {
      return false; // No classes = no access to any learners
    }

    const classIds = teacherClasses.map((c) => c.id);

    // Check if learner is enrolled in any of the teacher's classes
    const enrollment = await db
      .select({ id: classEnrollments.id })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          eq(classEnrollments.learnerId, learnerId),
          inArray(classEnrollments.classId, classIds),
          eq(classEnrollments.status, "active"),
          eq(learners.organizationId, organizationId)
        )
      )
      .limit(1);

    return enrollment.length > 0;
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

/**
 * Get all learner IDs that a teacher has access to (enrolled in their classes)
 * This is used for list queries to scope results properly
 */
export async function getTeacherAccessibleLearnerIds(
  teacherId: string,
  organizationId: string
): Promise<string[]> {
  // Get all active classes where this teacher is the owner
  const teacherClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(
        eq(classes.teacherId, teacherId),
        eq(classes.organizationId, organizationId),
        eq(classes.isActive, true)
      )
    );

  if (teacherClasses.length === 0) {
    return [];
  }

  const classIds = teacherClasses.map((c) => c.id);

  // Get all learners enrolled in these classes
  const enrollments = await db
    .select({ learnerId: classEnrollments.learnerId })
    .from(classEnrollments)
    .where(
      and(
        inArray(classEnrollments.classId, classIds),
        eq(classEnrollments.status, "active")
      )
    );

  // Return unique learner IDs
  return [...new Set(enrollments.map((e) => e.learnerId))];
}

/**
 * Verify a teacher has access to a specific learner
 * This is a faster check than canAccessLearner when you know the role is teacher
 */
export async function verifyTeacherLearnerAccess(
  teacherId: string,
  learnerId: string,
  organizationId: string
): Promise<boolean> {
  // Get teacher's classes
  const teacherClasses = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      and(
        eq(classes.teacherId, teacherId),
        eq(classes.organizationId, organizationId),
        eq(classes.isActive, true)
      )
    );

  if (teacherClasses.length === 0) {
    return false;
  }

  const classIds = teacherClasses.map((c) => c.id);

  // Check enrollment
  const enrollment = await db
    .select({ id: classEnrollments.id })
    .from(classEnrollments)
    .where(
      and(
        eq(classEnrollments.learnerId, learnerId),
        inArray(classEnrollments.classId, classIds),
        eq(classEnrollments.status, "active")
      )
    )
    .limit(1);

  return enrollment.length > 0;
}
