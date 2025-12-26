import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  getPermissions,
} from "./permissions";

describe("RBAC System", () => {
  describe("hasPermission", () => {
    it("admin should have manage:users permission", () => {
      expect(hasPermission("admin", "manage:users")).toBe(true);
    });

    it("learner should not have manage:users permission", () => {
      expect(hasPermission("learner", "manage:users")).toBe(false);
    });

    it("teacher should have view:analytics permission", () => {
      expect(hasPermission("teacher", "view:analytics")).toBe(true);
    });

    it("parent should have read:child_progress permission", () => {
      expect(hasPermission("parent", "read:child_progress")).toBe(true);
    });
  });

  describe("hasAnyPermission", () => {
    it("learner should have at least one of their permissions", () => {
      expect(hasAnyPermission("learner", ["read:own_progress", "manage:users"])).toBe(true);
    });

    it("learner should not have any admin permissions", () => {
      expect(hasAnyPermission("learner", ["manage:users", "manage:organizations"])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("admin should have all basic permissions", () => {
      expect(hasAllPermissions("admin", ["read:own_progress", "manage:users"])).toBe(true);
    });

    it("teacher should not have all admin permissions", () => {
      expect(hasAllPermissions("teacher", ["view:analytics", "manage:users"])).toBe(false);
    });
  });

  describe("isRoleAtLeast", () => {
    it("admin should be at least teacher level", () => {
      expect(isRoleAtLeast("admin", "teacher")).toBe(true);
    });

    it("learner should not be at least parent level", () => {
      expect(isRoleAtLeast("learner", "parent")).toBe(false);
    });

    it("same role should be at least itself", () => {
      expect(isRoleAtLeast("teacher", "teacher")).toBe(true);
    });
  });

  describe("getPermissions", () => {
    it("should return correct permissions for admin", () => {
      const permissions = getPermissions("admin");
      expect(permissions).toContain("manage:users");
      expect(permissions).toContain("view:admin_dashboard");
    });

    it("should return limited permissions for learner", () => {
      const permissions = getPermissions("learner");
      expect(permissions.length).toBe(2);
      expect(permissions).toContain("read:own_progress");
    });
  });
});
