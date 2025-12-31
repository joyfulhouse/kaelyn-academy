/**
 * Tests for GET /api/public/stats
 *
 * This endpoint returns public platform statistics for the landing page.
 * It's public (no auth required) but rate limited.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Define hoisted mocks before they're used in vi.mock
const { mockCheckPublicRateLimit, mockGetCurriculumStats } = vi.hoisted(() => ({
  mockCheckPublicRateLimit: vi.fn(),
  mockGetCurriculumStats: vi.fn(),
}));

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue([{ count: 0 }]),
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkPublicRateLimit: mockCheckPublicRateLimit,
}));

vi.mock("@/data/curriculum", () => ({
  getCurriculumStats: mockGetCurriculumStats,
}));

import { GET, type PublicStats } from "@/app/api/public/stats/route";

describe("GET /api/public/stats", () => {
  // Store original env vars for restoration
  let originalSatisfaction: string | undefined;
  let originalRating: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock implementations
    mockCheckPublicRateLimit.mockResolvedValue({ success: true, response: null });
    mockGetCurriculumStats.mockReturnValue({
      totalLessons: 150,
      totalSubjects: 5,
      gradeRanges: { K: 10, "1": 15 },
    });
    // Store and reset environment variables
    originalSatisfaction = process.env.PUBLIC_PARENT_SATISFACTION;
    originalRating = process.env.PUBLIC_APP_RATING;
    delete process.env.PUBLIC_PARENT_SATISFACTION;
    delete process.env.PUBLIC_APP_RATING;
  });

  afterEach(() => {
    // Restore original env vars
    if (originalSatisfaction !== undefined) {
      process.env.PUBLIC_PARENT_SATISFACTION = originalSatisfaction;
    }
    if (originalRating !== undefined) {
      process.env.PUBLIC_APP_RATING = originalRating;
    }
  });

  it("should return public stats with 200 status", async () => {
    const request = new NextRequest("http://localhost:3000/api/public/stats");

    const response = await GET(request);
    const data = await response.json() as PublicStats;

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("activeLearners");
    expect(data).toHaveProperty("lessonModules");
    expect(data).toHaveProperty("parentSatisfaction");
    expect(data).toHaveProperty("appRating");
    expect(data).toHaveProperty("totalOrganizations");
    expect(data).toHaveProperty("lessonsCompleted");
  });

  it("should include cache headers for CDN", async () => {
    const request = new NextRequest("http://localhost:3000/api/public/stats");

    const response = await GET(request);
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("s-maxage=3600");
    expect(cacheControl).toContain("stale-while-revalidate");
  });

  it("should use environment variables for satisfaction and rating when set", async () => {
    process.env.PUBLIC_PARENT_SATISFACTION = "98";
    process.env.PUBLIC_APP_RATING = "4.95";

    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);
    const data = await response.json() as PublicStats;

    expect(data.parentSatisfaction).toBe(98);
    expect(data.appRating).toBe(4.95);
  });

  it("should use default values when environment variables are not set", async () => {
    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);
    const data = await response.json() as PublicStats;

    expect(data.parentSatisfaction).toBe(95);
    expect(data.appRating).toBe(4.9);
  });

  it("should respect rate limiting", async () => {
    mockCheckPublicRateLimit.mockResolvedValueOnce({
      success: false,
      response: new Response("Too Many Requests", { status: 429 }),
    });

    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it("should return curriculum stats from getCurriculumStats", async () => {
    mockGetCurriculumStats.mockReturnValueOnce({
      totalLessons: 250,
      totalSubjects: 8,
      gradeRanges: {},
    });

    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);
    const data = await response.json() as PublicStats;

    expect(data.lessonModules).toBe(250);
  });
});
