/**
 * Tests for POST /api/contact
 *
 * This endpoint handles contact form submissions.
 * It's public but rate limited with validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Define hoisted mocks
const {
  mockCheckFormRateLimit,
  mockValidateBodySize,
  mockDbInsert,
  mockDbValues,
  mockDbReturning,
} = vi.hoisted(() => ({
  mockCheckFormRateLimit: vi.fn(),
  mockValidateBodySize: vi.fn(),
  mockDbInsert: vi.fn(),
  mockDbValues: vi.fn(),
  mockDbReturning: vi.fn(),
}));

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    insert: mockDbInsert,
    values: mockDbValues,
    returning: mockDbReturning,
  },
}));

vi.mock("@/lib/db/schema", () => ({
  contactSubmissions: {},
}));

vi.mock("@/lib/rate-limit", () => ({
  checkFormRateLimit: mockCheckFormRateLimit,
}));

vi.mock("@/lib/api/body-size", () => ({
  validateBodySize: mockValidateBodySize,
  BODY_SIZE_PRESETS: { form: 10000 },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock Resend - not configured in test environment
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "email-id" }),
    },
  })),
}));

// Import after mocks
import { POST } from "@/app/api/contact/route";

describe("POST /api/contact", () => {
  const validContactData = {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-1234",
    organization: "Test School",
    role: "Teacher",
    inquiryType: "general",
    subject: "Question about the platform",
    message:
      "I would like to learn more about Kaelyn's Academy for my students.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock implementations
    mockCheckFormRateLimit.mockResolvedValue({ success: true, response: null });
    mockValidateBodySize.mockResolvedValue({ success: true });
    // Reset mock chain
    mockDbValues.mockReturnThis();
    mockDbReturning.mockResolvedValue([{ id: "test-submission-id" }]);
    mockDbInsert.mockReturnValue({
      values: mockDbValues,
      returning: mockDbReturning,
    });
  });

  it("should successfully submit a contact form with 201 status", async () => {
    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validContactData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.id).toBe("test-submission-id");
    expect(data.message).toContain("received");
  });

  it("should validate required fields", async () => {
    const invalidData = {
      name: "J", // Too short
      email: "invalid-email",
      inquiryType: "general",
      subject: "Hi", // Too short
      message: "Short", // Too short
    };

    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should accept minimal valid data (without optional fields)", async () => {
    const minimalData = {
      name: "Jane Doe",
      email: "jane@example.com",
      inquiryType: "general",
      subject: "Simple question",
      message: "This is a longer message that meets the minimum requirement.",
    };

    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(minimalData),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it("should respect rate limiting", async () => {
    mockCheckFormRateLimit.mockResolvedValueOnce({
      success: false,
      response: new Response("Too Many Requests", { status: 429 }),
    });

    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validContactData),
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
  });

  it("should enforce body size limits", async () => {
    mockValidateBodySize.mockResolvedValueOnce({
      success: false,
      response: new Response("Payload Too Large", { status: 413 }),
    });

    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validContactData),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
  });

  it("should reject invalid JSON body", async () => {
    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const response = await POST(request);

    // handleApiError defaults to 500 for parse errors
    expect(response.status).toBe(500);
  });

  it("should call db.insert with contact data", async () => {
    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validContactData),
    });

    await POST(request);

    expect(mockDbInsert).toHaveBeenCalled();
    expect(mockDbValues).toHaveBeenCalled();
  });
});
