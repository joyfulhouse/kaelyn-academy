/**
 * Tests for GET /api/subjects
 *
 * This endpoint returns available subjects for the authenticated user.
 * Requires authentication and respects organization isolation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/subjects/route";

// Mock auth
const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "parent",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn().mockResolvedValue({
          id: "test-user-id",
          organizationId: "test-org-id",
        }),
      },
    },
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/db/schema/curriculum", () => ({
  subjects: {
    id: {},
    name: {},
    slug: {},
    description: {},
    iconName: {},
    color: {},
    order: {},
    isDefault: {},
    organizationId: {},
  },
}));

describe("GET /api/subjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when session has no user id", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: undefined },
      expires: new Date().toISOString(),
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return subjects for authenticated user", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce(mockSession as never);

    const { db } = await import("@/lib/db");
    const mockSubjects = [
      {
        id: "math-id",
        name: "Mathematics",
        slug: "math",
        description: "Learn math",
        iconName: "calculator",
        color: "#3b82f6",
        order: 1,
        isDefault: true,
      },
      {
        id: "reading-id",
        name: "Reading",
        slug: "reading",
        description: "Learn to read",
        iconName: "book",
        color: "#10b981",
        order: 2,
        isDefault: true,
      },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockSubjects),
        }),
      }),
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subjects).toHaveLength(2);
    expect(data.subjects[0].name).toBe("Mathematics");
    expect(data.subjects[1].name).toBe("Reading");
  });

  it("should include only required fields in response", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce(mockSession as never);

    const { db } = await import("@/lib/db");
    const mockSubject = {
      id: "science-id",
      name: "Science",
      slug: "science",
      description: "Learn science",
      iconName: "flask",
      color: "#8b5cf6",
      order: 3,
      isDefault: true,
    };

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([mockSubject]),
        }),
      }),
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subjects[0]).toHaveProperty("id");
    expect(data.subjects[0]).toHaveProperty("name");
    expect(data.subjects[0]).toHaveProperty("slug");
    expect(data.subjects[0]).toHaveProperty("description");
    expect(data.subjects[0]).toHaveProperty("iconName");
    expect(data.subjects[0]).toHaveProperty("color");
    expect(data.subjects[0]).toHaveProperty("order");
    expect(data.subjects[0]).toHaveProperty("isDefault");
  });

  it("should handle database errors gracefully", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce(mockSession as never);

    const { db } = await import("@/lib/db");
    vi.mocked(db.query.users.findFirst).mockRejectedValueOnce(
      new Error("Database error")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch subjects");
  });

  it("should return empty array when no subjects exist", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce(mockSession as never);

    const { db } = await import("@/lib/db");
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subjects).toEqual([]);
  });
});
