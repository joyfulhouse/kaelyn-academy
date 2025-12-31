/**
 * Tests for GET /api/public/stats
 *
 * This endpoint returns public platform statistics for the landing page.
 * It's public (no auth required) but rate limited.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, type PublicStats } from "@/app/api/public/stats/route";

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
  checkPublicRateLimit: vi.fn().mockResolvedValue({
    success: true,
    response: null,
  }),
}));

vi.mock("@/data/curriculum", () => ({
  getCurriculumStats: vi.fn().mockReturnValue({
    totalLessons: 150,
    totalSubjects: 5,
    gradeRanges: { K: 10, "1": 15 },
  }),
}));

describe("GET /api/public/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.PUBLIC_PARENT_SATISFACTION;
    delete process.env.PUBLIC_APP_RATING;
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
    const { checkPublicRateLimit } = await import("@/lib/rate-limit");
    vi.mocked(checkPublicRateLimit).mockResolvedValueOnce({
      success: false,
      response: new Response("Too Many Requests", { status: 429 }),
    });

    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it("should return fallback stats on database error", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.select).mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);
    const data = await response.json() as PublicStats;

    // Should still return 200 with fallback data
    expect(response.status).toBe(200);
    expect(data.activeLearners).toBe(0);
    expect(data.lessonModules).toBe(150); // From curriculum stats
    expect(data.totalOrganizations).toBe(0);
    expect(data.lessonsCompleted).toBe(0);
  });

  it("should have shorter cache on error", async () => {
    const { db } = await import("@/lib/db");
    vi.mocked(db.select).mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const request = new NextRequest("http://localhost:3000/api/public/stats");
    const response = await GET(request);
    const cacheControl = response.headers.get("Cache-Control");

    // Shorter cache on error (60s instead of 3600s)
    expect(cacheControl).toContain("s-maxage=60");
  });

  it("should return curriculum stats from getCurriculumStats", async () => {
    const { getCurriculumStats } = await import("@/data/curriculum");
    vi.mocked(getCurriculumStats).mockReturnValueOnce({
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
