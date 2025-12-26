/**
 * Pure permission functions - testable without Next.js dependencies
 */

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
