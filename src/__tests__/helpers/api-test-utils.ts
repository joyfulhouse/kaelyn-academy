/**
 * API Test Utilities
 * Helpers for testing Next.js API routes
 */
import { vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "GET", headers = {}, body, searchParams = {} } = options;

  // Build URL with search params
  const urlObj = new URL(url, "http://localhost:3000");
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const init: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  if (body && method !== "GET") {
    init.body = JSON.stringify(body);
    (init.headers as Headers).set("Content-Type", "application/json");
  }

  return new NextRequest(urlObj.toString(), init);
}

/**
 * Mock the auth module
 */
export function mockAuth(session: {
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
} | null) {
  vi.mock("@/lib/auth", () => ({
    auth: vi.fn().mockResolvedValue(session),
  }));
}

/**
 * Mock the database module with custom query results
 */
export function mockDb(overrides: Record<string, unknown> = {}) {
  const defaultMocks = {
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
      learners: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
      subjects: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue([]),
    ...overrides,
  };

  vi.mock("@/lib/db", () => ({
    db: defaultMocks,
  }));

  return defaultMocks;
}

/**
 * Mock rate limiter to always allow requests
 */
export function mockRateLimiter(allow = true) {
  vi.mock("@/lib/rate-limit", () => ({
    checkPublicRateLimit: vi.fn().mockResolvedValue({
      success: allow,
      response: allow ? null : new Response("Rate limited", { status: 429 }),
    }),
    checkAuthenticatedRateLimit: vi.fn().mockResolvedValue({
      success: allow,
      response: allow ? null : new Response("Rate limited", { status: 429 }),
    }),
  }));
}

/**
 * Parse JSON response from API route
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse JSON response: ${text}`);
  }
}

/**
 * Assert response status and parse JSON
 */
export async function expectJsonResponse<T>(
  response: Response,
  expectedStatus: number
): Promise<T> {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${body}`
    );
  }
  return parseJsonResponse<T>(response);
}

/**
 * Create a mock user session
 */
export function createMockSession(overrides: Partial<{
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}> = {}) {
  return {
    user: {
      id: overrides.id ?? "test-user-id",
      email: overrides.email ?? "test@example.com",
      name: overrides.name ?? "Test User",
      role: overrides.role ?? "parent",
      organizationId: overrides.organizationId ?? "test-org-id",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
