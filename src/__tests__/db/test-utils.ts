/**
 * Database Test Utilities
 *
 * Provides mock factories and test helpers for database testing.
 * These utilities ensure consistent test data and query pattern testing.
 */

import { vi } from "vitest";

/**
 * Mock UUID generator for deterministic tests
 */
let mockUuidCounter = 0;
export function createMockUuid(prefix = "test"): string {
  mockUuidCounter += 1;
  return `${prefix}-uuid-${mockUuidCounter.toString().padStart(4, "0")}`;
}

export function resetMockUuidCounter(): void {
  mockUuidCounter = 0;
}

/**
 * Create a mock organization
 */
export function createMockOrganization(overrides: Partial<MockOrganization> = {}): MockOrganization {
  const id = createMockUuid("org");
  return {
    id,
    name: `Test Organization ${id}`,
    slug: `test-org-${id}`,
    type: "family",
    settings: {},
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
    ...overrides,
  };
}

export interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  type: "family" | "school" | "district";
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Create a mock user
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = createMockUuid("user");
  return {
    id,
    name: `Test User ${id}`,
    email: `user-${id}@example.com`,
    emailVerified: null,
    image: null,
    organizationId: null,
    role: "parent",
    isAdult: true,
    dateOfBirth: null,
    parentalConsentGiven: false,
    parentalConsentDate: null,
    preferences: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
    ...overrides,
  };
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  organizationId: string | null;
  role: "parent" | "teacher" | "school_admin" | "platform_admin";
  isAdult: boolean;
  dateOfBirth: Date | null;
  parentalConsentGiven: boolean;
  parentalConsentDate: Date | null;
  preferences: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Create a mock learner
 */
export function createMockLearner(overrides: Partial<MockLearner> = {}): MockLearner {
  const id = createMockUuid("learner");
  return {
    id,
    userId: createMockUuid("user"),
    organizationId: createMockUuid("org"),
    name: `Test Learner ${id}`,
    avatarUrl: null,
    dateOfBirth: null,
    gradeLevel: 5,
    preferences: null,
    parentalControls: null,
    isActive: true,
    lastActiveAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
    ...overrides,
  };
}

export interface MockLearner {
  id: string;
  userId: string;
  organizationId: string;
  name: string;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gradeLevel: number;
  preferences: Record<string, unknown> | null;
  parentalControls: Record<string, unknown> | null;
  isActive: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Create a mock lesson progress
 */
export function createMockLessonProgress(overrides: Partial<MockLessonProgress> = {}): MockLessonProgress {
  const id = createMockUuid("progress");
  return {
    id,
    learnerId: createMockUuid("learner"),
    organizationId: createMockUuid("org"),
    lessonId: "3-fractions-intro",
    status: "not_started",
    progressPercent: 0,
    completedActivities: [],
    timeSpent: 0,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export interface MockLessonProgress {
  id: string;
  learnerId: string;
  organizationId: string;
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  progressPercent: number;
  completedActivities: number[];
  timeSpent: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock database query builder for testing
 */
export function createMockQueryBuilder<T>() {
  const data: T[] = [];

  const builder = {
    data,

    // Chain methods that return builder
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),

    // Terminal methods
    execute: vi.fn().mockResolvedValue(data),
    then: vi.fn((resolve: (value: T[]) => void) => resolve(data)),

    // Helper to set return data
    setData: (newData: T[]) => {
      data.length = 0;
      data.push(...newData);
      builder.execute.mockResolvedValue(newData);
      return builder;
    },

    // Reset mocks
    reset: () => {
      vi.clearAllMocks();
      data.length = 0;
      return builder;
    },
  };

  return builder;
}

/**
 * Test helper: Simulate multi-tenant query filter
 */
export function filterByOrganization<T extends { organizationId: string }>(
  items: T[],
  organizationId: string
): T[] {
  return items.filter((item) => item.organizationId === organizationId);
}

/**
 * Test helper: Simulate soft delete filter
 */
export function filterNotDeleted<T extends { deletedAt: Date | null }>(items: T[]): T[] {
  return items.filter((item) => item.deletedAt === null);
}

/**
 * Test helper: Simulate combined org + soft delete filter
 */
export function filterByOrgNotDeleted<T extends { organizationId: string; deletedAt: Date | null }>(
  items: T[],
  organizationId: string
): T[] {
  return items.filter((item) => item.organizationId === organizationId && item.deletedAt === null);
}
