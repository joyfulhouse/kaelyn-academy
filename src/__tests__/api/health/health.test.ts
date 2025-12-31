/**
 * Tests for /api/health
 *
 * GET - Health check with component status
 * HEAD - Simple liveness probe
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Define hoisted mocks - vi.hoisted ensures mocks are available when vi.mock runs
const mockDbExecute = vi.hoisted(() => vi.fn());

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    execute: mockDbExecute,
  },
}));

// Import after mocks
import { GET, HEAD } from "@/app/api/health/route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbExecute.mockResolvedValue([{ "?column?": 1 }]);
  });

  it("should return healthy status when all checks pass", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.checks.database.status).toBe("healthy");
    expect(data.checks.memory.status).toBe("healthy");
  });

  it("should include required health check fields", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("uptime");
    expect(data).toHaveProperty("checks");
    expect(data.checks).toHaveProperty("database");
    expect(data.checks).toHaveProperty("memory");
  });

  it("should return unhealthy status when database fails", async () => {
    mockDbExecute.mockRejectedValueOnce(new Error("Connection refused"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.checks.database.status).toBe("unhealthy");
    expect(data.checks.database.message).toContain("Connection refused");
  });

  it("should include database latency when healthy", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.database.latencyMs).toBeDefined();
    expect(typeof data.checks.database.latencyMs).toBe("number");
  });

  it("should set no-cache headers", async () => {
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(
      "no-store, no-cache, must-revalidate"
    );
  });

  it("should include valid ISO timestamp", async () => {
    const response = await GET();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it("should track uptime in seconds", async () => {
    const response = await GET();
    const data = await response.json();

    expect(typeof data.uptime).toBe("number");
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe("HEAD /api/health", () => {
  it("should return 200 OK for liveness probe", async () => {
    const response = await HEAD();

    expect(response.status).toBe(200);
  });

  it("should return no body", async () => {
    const response = await HEAD();

    expect(response.body).toBeNull();
  });
});
