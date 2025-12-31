/**
 * Tests for /api/achievements
 *
 * GET - Get all achievements and earned ones for a learner
 * POST - Award an achievement to a learner
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock session
const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Define hoisted mocks - vi.hoisted ensures mocks are available when vi.mock runs
const mockAuth = vi.hoisted(() => vi.fn());
const mockLearnersFindFirst = vi.hoisted(() => vi.fn());
const mockLearnersFindMany = vi.hoisted(() => vi.fn());
const mockAchievementsFindMany = vi.hoisted(() => vi.fn());
const mockLearnerAchievementsFindFirst = vi.hoisted(() => vi.fn());
const mockLearnerAchievementsFindMany = vi.hoisted(() => vi.fn());

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

// Mock database with query interface
vi.mock("@/lib/db", () => {
  const mockQuery = {
    learners: {
      findFirst: mockLearnersFindFirst,
      findMany: mockLearnersFindMany,
    },
    achievements: {
      findMany: mockAchievementsFindMany,
    },
    learnerAchievements: {
      findFirst: mockLearnerAchievementsFindFirst,
      findMany: mockLearnerAchievementsFindMany,
    },
    learnerSubjectProgress: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  };

  const createChain = () => {
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.from = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockResolvedValue([{ count: 0 }]);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.values = vi.fn().mockReturnValue(chain);
    chain.returning = vi.fn().mockResolvedValue([{ id: "new-id" }]);
    return chain;
  };

  return {
    db: {
      query: mockQuery,
      ...createChain(),
    },
  };
});

vi.mock("@/lib/db/schema/progress", () => ({
  achievements: {},
  learnerAchievements: {},
  learnerSubjectProgress: {},
  lessonProgress: {},
  conceptMastery: {},
}));

vi.mock("@/lib/db/schema/users", () => ({
  learners: {},
}));

vi.mock("@/lib/validation", () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message: string, public errors: unknown[]) {
      super(message);
    }
    toResponse() {
      return new Response(JSON.stringify({ error: this.message }), {
        status: 400,
      });
    }
  },
}));

// Import after mocks
import { GET, POST } from "@/app/api/achievements/route";

describe("GET /api/achievements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock implementations
    mockAuth.mockResolvedValue(null);
    mockLearnersFindFirst.mockResolvedValue(null);
    mockLearnersFindMany.mockResolvedValue([]);
    mockAchievementsFindMany.mockResolvedValue([]);
    mockLearnerAchievementsFindFirst.mockResolvedValue(null);
    mockLearnerAchievementsFindMany.mockResolvedValue([]);
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/achievements");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return achievements for authenticated user", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockLearnersFindMany.mockResolvedValueOnce([
      { id: "learner-1", userId: "test-user-id" },
    ]);
    mockAchievementsFindMany.mockResolvedValueOnce([
      {
        id: "ach-1",
        name: "First Steps",
        description: "Complete your first lesson",
        type: "milestone",
        points: 10,
        criteria: { type: "lessons_completed", threshold: 1 },
      },
    ]);

    const request = new NextRequest("http://localhost:3000/api/achievements");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("achievements");
    expect(data).toHaveProperty("stats");
    expect(data.achievements).toBeInstanceOf(Array);
  });

  it("should include nextAchievement in response", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockLearnersFindMany.mockResolvedValueOnce([]);
    mockAchievementsFindMany.mockResolvedValueOnce([
      { id: "ach-1", name: "First Steps", points: 10, criteria: null },
    ]);

    const request = new NextRequest("http://localhost:3000/api/achievements");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("nextAchievement");
  });
});

describe("POST /api/achievements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learnerId: "learner-1",
        achievementId: "ach-1",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should require learnerId and achievementId", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const request = new NextRequest("http://localhost:3000/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("required");
  });

  it("should verify learner belongs to user", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockLearnersFindFirst.mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learnerId: "other-learner",
        achievementId: "ach-1",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("not found");
  });
});
