/**
 * Tests for lib/api/error-handler.ts
 *
 * Tests API error handling utilities including:
 * - Error sanitization for production
 * - Status code determination
 * - Zod validation error handling
 * - Error wrapping utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { NextResponse } from "next/server";
import { handleApiError, apiError, withErrorHandler } from "./error-handler";

describe("handleApiError", () => {
  beforeEach(() => {
    // Suppress console.error output during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 400 for ZodError", async () => {
    const schema = z.object({ name: z.string().min(2) });

    try {
      schema.parse({ name: "a" });
    } catch (error) {
      const response = handleApiError(error, "test context");
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.code).toBe("VALIDATION_ERROR");
    }
  });

  it("should include Zod issues in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const schema = z.object({ email: z.string().email() });

    try {
      schema.parse({ email: "invalid" });
    } catch (error) {
      const response = handleApiError(error, "test");
      const body = await response.json();

      expect(body.details).toBeDefined();
      expect(body.details).toBeInstanceOf(Array);
    }
  });

  it("should detect 404 errors from message", async () => {
    const error = new Error("Resource not found");
    const response = handleApiError(error, "test");

    expect(response.status).toBe(404);
  });

  it("should detect 401 errors from message", async () => {
    const error = new Error("User is unauthorized");
    const response = handleApiError(error, "test");

    expect(response.status).toBe(401);
  });

  it("should detect 403 errors from message", async () => {
    // Must contain "forbidden" or "permission" (lowercase check)
    const error = new Error("Access is forbidden for this resource");
    const response = handleApiError(error, "test");

    expect(response.status).toBe(403);
  });

  it("should detect 409 errors from message", async () => {
    // Must contain "duplicate" or "unique" (lowercase check)
    const error = new Error("A duplicate record already exists");
    const response = handleApiError(error, "test");

    expect(response.status).toBe(409);
  });

  it("should default to 500 for unknown errors", async () => {
    const error = new Error("Something went wrong");
    const response = handleApiError(error, "test");

    expect(response.status).toBe(500);
  });

  it("should use custom default status", async () => {
    const error = new Error("Custom error");
    const response = handleApiError(error, "test", 418);

    expect(response.status).toBe(418);
  });

  it("should handle non-Error objects", async () => {
    const response = handleApiError("string error", "test");

    expect(response.status).toBe(500);
  });
});

describe("apiError", () => {

  it("should create error response with message and status", async () => {
    const response = apiError("Bad request", 400);

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Bad request");
  });

  it("should include error code when provided", async () => {
    const response = apiError("Not found", 404, "NOT_FOUND");

    const body = await response.json();
    expect(body.code).toBe("NOT_FOUND");
  });

  it("should pass through message in non-production", async () => {
    // In test/development, the actual message is passed through
    const response = apiError("Detailed error info", 500);

    const body = await response.json();
    expect(body.error).toBe("Detailed error info");
  });

  it("should return custom message for any status code in non-production", async () => {
    // In test/development, custom messages are shown
    const response = apiError("Custom teapot message", 418);

    const body = await response.json();
    expect(body.error).toBe("Custom teapot message");
  });
});

describe("withErrorHandler", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should wrap handler and catch errors", async () => {
    const handler = async () => {
      throw new Error("Handler error");
    };

    const wrapped = withErrorHandler(handler, "test handler");
    const response = await wrapped();

    expect(response.status).toBe(500);
  });

  it("should pass through successful responses", async () => {
    const handler = async () => {
      return NextResponse.json({ success: true });
    };

    const wrapped = withErrorHandler(handler, "test handler");
    const response = await wrapped();

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should pass arguments to handler", async () => {
    const handler = async (name: string, age: number) => {
      return NextResponse.json({ name, age });
    };

    const wrapped = withErrorHandler(handler, "test handler");
    const response = await wrapped("John", 25);

    const body = await response.json();
    expect(body.name).toBe("John");
    expect(body.age).toBe(25);
  });
});
