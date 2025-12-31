/**
 * Tests for /api/newsletter
 *
 * POST - Subscribe to newsletter
 * DELETE - Unsubscribe from newsletter (requires signed token)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Define hoisted mocks - vi.hoisted ensures mocks are available when vi.mock runs
const mockCheckFormRateLimit = vi.hoisted(() => vi.fn());
const mockValidateBodySize = vi.hoisted(() => vi.fn());
const mockValidateUnsubscribeToken = vi.hoisted(() => vi.fn());

// Mock all dependencies before importing the route
vi.mock("@/lib/db", () => {
  const createChainMock = (result: unknown) => {
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.from = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockResolvedValue(result);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.values = vi.fn().mockResolvedValue(undefined);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.set = vi.fn().mockReturnValue(chain);
    return chain;
  };

  return {
    db: createChainMock([]),
    __createChainMock: createChainMock,
  };
});

vi.mock("@/lib/db/schema/marketing", () => ({
  newsletterSubscriptions: { id: {}, email: {}, status: {} },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkFormRateLimit: mockCheckFormRateLimit,
}));

vi.mock("@/lib/api/body-size", () => ({
  validateBodySize: mockValidateBodySize,
  BODY_SIZE_PRESETS: { form: 10000 },
}));

vi.mock("@/lib/api/newsletter-tokens", () => ({
  validateUnsubscribeToken: mockValidateUnsubscribeToken,
}));

// Import after mocks are set up
import { POST, DELETE } from "@/app/api/newsletter/route";

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock implementations
    mockCheckFormRateLimit.mockResolvedValue({ success: true, response: null });
    mockValidateBodySize.mockResolvedValue({ success: true });
    mockValidateUnsubscribeToken.mockReturnValue({ valid: true, email: "test@example.com" });
  });

  it("should successfully subscribe a new email", async () => {
    const request = new NextRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBeDefined();
    expect(typeof data.message).toBe("string");
  });

  it("should validate email format", async () => {
    const request = new NextRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("email");
  });

  it("should respect rate limiting", async () => {
    mockCheckFormRateLimit.mockResolvedValueOnce({
      success: false,
      response: new Response("Too Many Requests", { status: 429 }),
    });

    const request = new NextRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
  });

  it("should accept optional name and interests", async () => {
    const request = new NextRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        name: "John Doe",
        interests: ["math", "science"],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("should enforce body size limits", async () => {
    mockValidateBodySize.mockResolvedValueOnce({
      success: false,
      response: new Response("Payload Too Large", { status: 413 }),
    });

    const request = new NextRequest("http://localhost:3000/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });
});

describe("DELETE /api/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should require a token parameter", async () => {
    const request = new NextRequest("http://localhost:3000/api/newsletter", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Invalid unsubscribe link");
  });

  it("should return success when email not found", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/newsletter?token=valid-token",
      { method: "DELETE" }
    );

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should reject invalid tokens", async () => {
    mockValidateUnsubscribeToken.mockReturnValueOnce({
      valid: false,
      error: "Token expired",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/newsletter?token=invalid-token",
      { method: "DELETE" }
    );

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("expired");
  });
});
