/**
 * Tests for API Response Utilities
 */
import { describe, it, expect } from "vitest";
import { ApiResponse } from "./response";

describe("ApiResponse.success", () => {
  it("should create a success response with data", async () => {
    const response = ApiResponse.success({ id: "123", name: "Test" });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({ id: "123", name: "Test" });
  });

  it("should include meta when provided", async () => {
    const response = ApiResponse.success(
      { id: "123" },
      { timestamp: "2025-01-01" }
    );
    const data = await response.json();

    expect(data.meta).toEqual({ timestamp: "2025-01-01" });
  });

  it("should not include meta when empty", async () => {
    const response = ApiResponse.success({ id: "123" }, {});
    const data = await response.json();

    expect(data.meta).toBeUndefined();
  });
});

describe("ApiResponse.paginated", () => {
  it("should create a paginated response", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    const response = ApiResponse.paginated(items, {
      total: 10,
      limit: 2,
      offset: 0,
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(items);
    expect(data.meta.total).toBe(10);
    expect(data.meta.limit).toBe(2);
    expect(data.meta.offset).toBe(0);
    expect(data.meta.hasMore).toBe(true);
  });

  it("should set hasMore to false when at end", async () => {
    const items = [{ id: "9" }, { id: "10" }];
    const response = ApiResponse.paginated(items, {
      total: 10,
      limit: 2,
      offset: 8,
    });
    const data = await response.json();

    expect(data.meta.hasMore).toBe(false);
  });

  it("should include extra meta when provided", async () => {
    const response = ApiResponse.paginated(
      [],
      { total: 0, limit: 10, offset: 0 },
      { requestId: "req-123" }
    );
    const data = await response.json();

    expect(data.meta.requestId).toBe("req-123");
  });
});

describe("ApiResponse.error", () => {
  it("should create an error response", async () => {
    const response = ApiResponse.error("Something went wrong", 400);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Something went wrong");
  });

  it("should include code when provided", async () => {
    const response = ApiResponse.error("Not found", 404, "NOT_FOUND");
    const data = await response.json();

    expect(data.code).toBe("NOT_FOUND");
  });

  it("should include details when provided", async () => {
    const response = ApiResponse.error(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      { fields: ["email"] }
    );
    const data = await response.json();

    expect(data.details).toEqual({ fields: ["email"] });
  });
});

describe("ApiResponse.created", () => {
  it("should create a 201 response", async () => {
    const response = ApiResponse.created({ id: "new-123" });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).toEqual({ id: "new-123" });
  });
});

describe("ApiResponse.noContent", () => {
  it("should create a 204 response", () => {
    const response = ApiResponse.noContent();

    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });
});

describe("ApiResponse convenience methods", () => {
  it("unauthorized should return 401", async () => {
    const response = ApiResponse.unauthorized();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe("UNAUTHORIZED");
  });

  it("unauthorized should accept custom message", async () => {
    const response = ApiResponse.unauthorized("Session expired");
    const data = await response.json();

    expect(data.error).toBe("Session expired");
  });

  it("forbidden should return 403", async () => {
    const response = ApiResponse.forbidden();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe("FORBIDDEN");
  });

  it("notFound should return 404 with resource name", async () => {
    const response = ApiResponse.notFound("User");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
    expect(data.code).toBe("NOT_FOUND");
  });

  it("badRequest should return 400 with details", async () => {
    const response = ApiResponse.badRequest("Invalid input", { field: "email" });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(data.details).toEqual({ field: "email" });
  });

  it("conflict should return 409", async () => {
    const response = ApiResponse.conflict("Email already exists");
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.code).toBe("CONFLICT");
  });

  it("tooManyRequests should return 429", async () => {
    const response = ApiResponse.tooManyRequests(60);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("internalError should return 500", async () => {
    const response = ApiResponse.internalError();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe("INTERNAL_ERROR");
  });
});
