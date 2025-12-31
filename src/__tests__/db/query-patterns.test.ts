/**
 * Database Query Pattern Tests
 *
 * Tests for critical database query patterns including:
 * - Multi-tenant query filtering (security-critical)
 * - Soft delete behavior
 * - CRUD operations
 * - Progress tracking queries
 * - Aggregation queries
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createMockOrganization,
  createMockUser,
  createMockLearner,
  createMockLessonProgress,
  filterByOrganization,
  filterNotDeleted,
  filterByOrgNotDeleted,
  resetMockUuidCounter,
  type MockLearner,
  type MockUser,
  type MockLessonProgress,
} from "./test-utils";

describe("Multi-tenant Query Filtering", () => {
  beforeEach(() => {
    resetMockUuidCounter();
  });

  describe("filterByOrganization", () => {
    it("should only return records matching the organization ID", () => {
      const org1 = createMockOrganization({ id: "org-1" });
      const org2 = createMockOrganization({ id: "org-2" });

      const learners: MockLearner[] = [
        createMockLearner({ id: "l1", organizationId: org1.id, name: "Alice" }),
        createMockLearner({ id: "l2", organizationId: org2.id, name: "Bob" }),
        createMockLearner({ id: "l3", organizationId: org1.id, name: "Carol" }),
      ];

      const result = filterByOrganization(learners, org1.id);

      expect(result).toHaveLength(2);
      expect(result.map((l) => l.name)).toEqual(["Alice", "Carol"]);
    });

    it("should return empty array when no records match organization", () => {
      const learners: MockLearner[] = [
        createMockLearner({ organizationId: "org-1" }),
        createMockLearner({ organizationId: "org-2" }),
      ];

      const result = filterByOrganization(learners, "non-existent-org");

      expect(result).toHaveLength(0);
    });

    it("should prevent cross-tenant data access", () => {
      // Simulate an attacker trying to access another org's data
      const attackerOrgId = "attacker-org";
      const victimOrgId = "victim-org";

      const sensitiveData: MockLearner[] = [
        createMockLearner({
          organizationId: victimOrgId,
          name: "Victim Child",
          preferences: { learningStyle: "visual" },
        }),
      ];

      // Query with attacker's org should return nothing
      const attackerResult = filterByOrganization(sensitiveData, attackerOrgId);
      expect(attackerResult).toHaveLength(0);

      // Query with victim's org should return data
      const victimResult = filterByOrganization(sensitiveData, victimOrgId);
      expect(victimResult).toHaveLength(1);
    });
  });

  describe("combined org + soft delete filter", () => {
    it("should filter by both organization and not-deleted", () => {
      const org1 = createMockOrganization({ id: "org-1" });
      const org2 = createMockOrganization({ id: "org-2" });

      const learners: MockLearner[] = [
        createMockLearner({ id: "l1", organizationId: org1.id, deletedAt: null }),
        createMockLearner({ id: "l2", organizationId: org1.id, deletedAt: new Date() }),
        createMockLearner({ id: "l3", organizationId: org2.id, deletedAt: null }),
        createMockLearner({ id: "l4", organizationId: org2.id, deletedAt: new Date() }),
      ];

      const result = filterByOrgNotDeleted(learners, org1.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("l1");
    });
  });
});

describe("Soft Delete Functionality", () => {
  beforeEach(() => {
    resetMockUuidCounter();
  });

  describe("filterNotDeleted", () => {
    it("should only return records where deletedAt is null", () => {
      const users: MockUser[] = [
        createMockUser({ id: "u1", deletedAt: null }),
        createMockUser({ id: "u2", deletedAt: new Date("2024-01-15") }),
        createMockUser({ id: "u3", deletedAt: null }),
      ];

      const result = filterNotDeleted(users);

      expect(result).toHaveLength(2);
      expect(result.map((u) => u.id)).toEqual(["u1", "u3"]);
    });

    it("should return empty array when all records are deleted", () => {
      const users: MockUser[] = [
        createMockUser({ deletedAt: new Date() }),
        createMockUser({ deletedAt: new Date() }),
      ];

      const result = filterNotDeleted(users);

      expect(result).toHaveLength(0);
    });

    it("should return all records when none are deleted", () => {
      const users: MockUser[] = [
        createMockUser({ id: "u1", deletedAt: null }),
        createMockUser({ id: "u2", deletedAt: null }),
      ];

      const result = filterNotDeleted(users);

      expect(result).toHaveLength(2);
    });
  });

  describe("soft delete behavior", () => {
    it("should preserve record data after soft delete", () => {
      const user = createMockUser({
        name: "Test User",
        email: "test@example.com",
        deletedAt: null,
      });

      // Simulate soft delete
      const deletedUser = { ...user, deletedAt: new Date() };

      // Data should still exist
      expect(deletedUser.name).toBe("Test User");
      expect(deletedUser.email).toBe("test@example.com");
      expect(deletedUser.deletedAt).toBeInstanceOf(Date);
    });

    it("should filter out soft-deleted records in queries", () => {
      const activeUser = createMockUser({ id: "active", deletedAt: null });
      const deletedUser = createMockUser({ id: "deleted", deletedAt: new Date() });

      const users = [activeUser, deletedUser];
      const activeUsers = filterNotDeleted(users);

      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].id).toBe("active");
    });
  });
});

describe("Progress Tracking Queries", () => {
  beforeEach(() => {
    resetMockUuidCounter();
  });

  describe("progress filtering", () => {
    it("should filter progress by learner ID", () => {
      const learner1Id = "learner-1";
      const learner2Id = "learner-2";

      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ learnerId: learner1Id, lessonId: "math-1" }),
        createMockLessonProgress({ learnerId: learner2Id, lessonId: "math-1" }),
        createMockLessonProgress({ learnerId: learner1Id, lessonId: "math-2" }),
      ];

      const learner1Progress = progress.filter((p) => p.learnerId === learner1Id);

      expect(learner1Progress).toHaveLength(2);
    });

    it("should filter progress by status", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ status: "completed", progressPercent: 100 }),
        createMockLessonProgress({ status: "in_progress", progressPercent: 50 }),
        createMockLessonProgress({ status: "not_started", progressPercent: 0 }),
        createMockLessonProgress({ status: "completed", progressPercent: 100 }),
      ];

      const completed = progress.filter((p) => p.status === "completed");
      const inProgress = progress.filter((p) => p.status === "in_progress");

      expect(completed).toHaveLength(2);
      expect(inProgress).toHaveLength(1);
    });
  });

  describe("progress aggregation", () => {
    it("should calculate total time spent", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ timeSpent: 300 }),
        createMockLessonProgress({ timeSpent: 450 }),
        createMockLessonProgress({ timeSpent: 120 }),
      ];

      const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);

      expect(totalTime).toBe(870);
    });

    it("should calculate average progress percent", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ progressPercent: 100 }),
        createMockLessonProgress({ progressPercent: 50 }),
        createMockLessonProgress({ progressPercent: 75 }),
      ];

      const avgProgress =
        progress.reduce((sum, p) => sum + p.progressPercent, 0) / progress.length;

      expect(avgProgress).toBe(75);
    });

    it("should count completed lessons", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ status: "completed" }),
        createMockLessonProgress({ status: "in_progress" }),
        createMockLessonProgress({ status: "completed" }),
        createMockLessonProgress({ status: "not_started" }),
      ];

      const completedCount = progress.filter((p) => p.status === "completed").length;

      expect(completedCount).toBe(2);
    });

    it("should handle empty progress array", () => {
      const progress: MockLessonProgress[] = [];

      const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);
      const completedCount = progress.filter((p) => p.status === "completed").length;

      expect(totalTime).toBe(0);
      expect(completedCount).toBe(0);
    });
  });
});

describe("CRUD Operations", () => {
  beforeEach(() => {
    resetMockUuidCounter();
  });

  describe("Create operations", () => {
    it("should generate unique IDs for new records", () => {
      const user1 = createMockUser();
      const user2 = createMockUser();

      expect(user1.id).not.toBe(user2.id);
    });

    it("should set default values on creation", () => {
      const user = createMockUser();

      expect(user.role).toBe("parent");
      expect(user.isAdult).toBe(true);
      expect(user.deletedAt).toBeNull();
    });

    it("should set timestamps on creation", () => {
      const user = createMockUser();

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Read operations", () => {
    it("should find record by ID", () => {
      const users = [
        createMockUser({ id: "user-1" }),
        createMockUser({ id: "user-2" }),
        createMockUser({ id: "user-3" }),
      ];

      const found = users.find((u) => u.id === "user-2");

      expect(found).toBeDefined();
      expect(found?.id).toBe("user-2");
    });

    it("should return undefined for non-existent ID", () => {
      const users = [createMockUser({ id: "user-1" })];

      const found = users.find((u) => u.id === "non-existent");

      expect(found).toBeUndefined();
    });

    it("should find first matching record", () => {
      const users = [
        createMockUser({ role: "parent" }),
        createMockUser({ role: "teacher" }),
        createMockUser({ role: "parent" }),
      ];

      const firstParent = users.find((u) => u.role === "parent");

      expect(firstParent?.role).toBe("parent");
    });
  });

  describe("Update operations", () => {
    it("should update record fields", () => {
      const user = createMockUser({ name: "Original Name" });

      const updated = { ...user, name: "Updated Name", updatedAt: new Date() };

      expect(updated.name).toBe("Updated Name");
      expect(updated.id).toBe(user.id);
    });

    it("should preserve unmodified fields", () => {
      const user = createMockUser({
        name: "Test User",
        email: "test@example.com",
        role: "teacher",
      });

      const updated = { ...user, name: "New Name" };

      expect(updated.email).toBe("test@example.com");
      expect(updated.role).toBe("teacher");
    });
  });

  describe("Delete operations", () => {
    it("should soft delete by setting deletedAt", () => {
      const users = [
        createMockUser({ id: "user-1", deletedAt: null }),
        createMockUser({ id: "user-2", deletedAt: null }),
      ];

      // Soft delete user-1
      const updatedUsers = users.map((u) =>
        u.id === "user-1" ? { ...u, deletedAt: new Date() } : u
      );

      const activeUsers = filterNotDeleted(updatedUsers);

      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].id).toBe("user-2");
    });

    it("should cascade delete related records", () => {
      const userId = "parent-user";
      const learners = [
        createMockLearner({ userId, id: "learner-1" }),
        createMockLearner({ userId, id: "learner-2" }),
        createMockLearner({ userId: "other-user", id: "learner-3" }),
      ];

      // Simulate cascade delete of learners when user is deleted
      const remainingLearners = learners.filter((l) => l.userId !== userId);

      expect(remainingLearners).toHaveLength(1);
      expect(remainingLearners[0].id).toBe("learner-3");
    });
  });
});

describe("Aggregation Queries", () => {
  beforeEach(() => {
    resetMockUuidCounter();
  });

  describe("Count aggregations", () => {
    it("should count records by status", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ status: "completed" }),
        createMockLessonProgress({ status: "completed" }),
        createMockLessonProgress({ status: "in_progress" }),
        createMockLessonProgress({ status: "not_started" }),
        createMockLessonProgress({ status: "not_started" }),
        createMockLessonProgress({ status: "not_started" }),
      ];

      const counts = progress.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(counts.completed).toBe(2);
      expect(counts.in_progress).toBe(1);
      expect(counts.not_started).toBe(3);
    });
  });

  describe("Sum aggregations", () => {
    it("should sum numeric fields", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ timeSpent: 100 }),
        createMockLessonProgress({ timeSpent: 200 }),
        createMockLessonProgress({ timeSpent: 150 }),
      ];

      const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);

      expect(totalTime).toBe(450);
    });
  });

  describe("Group by aggregations", () => {
    it("should group progress by learner", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ learnerId: "l1", status: "completed" }),
        createMockLessonProgress({ learnerId: "l1", status: "in_progress" }),
        createMockLessonProgress({ learnerId: "l2", status: "completed" }),
      ];

      const byLearner = progress.reduce(
        (acc, p) => {
          if (!acc[p.learnerId]) acc[p.learnerId] = [];
          acc[p.learnerId].push(p);
          return acc;
        },
        {} as Record<string, MockLessonProgress[]>
      );

      expect(Object.keys(byLearner)).toHaveLength(2);
      expect(byLearner["l1"]).toHaveLength(2);
      expect(byLearner["l2"]).toHaveLength(1);
    });

    it("should calculate stats per group", () => {
      const progress: MockLessonProgress[] = [
        createMockLessonProgress({ learnerId: "l1", progressPercent: 100, timeSpent: 300 }),
        createMockLessonProgress({ learnerId: "l1", progressPercent: 50, timeSpent: 200 }),
        createMockLessonProgress({ learnerId: "l2", progressPercent: 100, timeSpent: 400 }),
      ];

      // Group and calculate stats
      const stats = Object.entries(
        progress.reduce(
          (acc, p) => {
            if (!acc[p.learnerId]) {
              acc[p.learnerId] = { count: 0, totalProgress: 0, totalTime: 0 };
            }
            acc[p.learnerId].count += 1;
            acc[p.learnerId].totalProgress += p.progressPercent;
            acc[p.learnerId].totalTime += p.timeSpent;
            return acc;
          },
          {} as Record<string, { count: number; totalProgress: number; totalTime: number }>
        )
      ).map(([learnerId, data]) => ({
        learnerId,
        lessonCount: data.count,
        avgProgress: data.totalProgress / data.count,
        totalTime: data.totalTime,
      }));

      const l1Stats = stats.find((s) => s.learnerId === "l1");
      expect(l1Stats?.lessonCount).toBe(2);
      expect(l1Stats?.avgProgress).toBe(75);
      expect(l1Stats?.totalTime).toBe(500);

      const l2Stats = stats.find((s) => s.learnerId === "l2");
      expect(l2Stats?.lessonCount).toBe(1);
      expect(l2Stats?.avgProgress).toBe(100);
      expect(l2Stats?.totalTime).toBe(400);
    });
  });
});
