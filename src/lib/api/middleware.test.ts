/**
 * Tests for API Middleware Layer
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Define hoisted mocks - vi.hoisted ensures mocks are available when vi.mock runs
const mockAuth = vi.hoisted(() => vi.fn());
const mockDbSelect = vi.hoisted(() => vi.fn());

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: mockDbSelect,
  },
}));

vi.mock("@/lib/db/schema/users", () => ({
  users: {
    id: "id",
    role: "role",
    organizationId: "organizationId",
    email: "email",
    name: "name",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ type: "eq", left: a, right: b })),
}));

// Import after mocks
import {
  withAuth,
  withPermission,
  withAdminAuth,
  withOrganization,
  type AuthenticatedRequest,
} from "./middleware";

describe("withAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no session exists", async () => {
    mockAuth.mockResolvedValue(null);

    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should return 401 when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} });

    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("should return 401 when user not found in database", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([]),
      }),
    });

    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.code).toBe("USER_NOT_FOUND");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should call handler with authenticated request when user is valid", async () => {
    const mockUser = {
      id: "user-123",
      role: "teacher",
      organizationId: "org-1",
      email: "teacher@example.com",
      name: "Test Teacher",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);

    // Verify the request was extended with user data
    const calledRequest = handler.mock.calls[0][0] as AuthenticatedRequest;
    expect(calledRequest.user.id).toBe("user-123");
    expect(calledRequest.user.role).toBe("teacher");
  });
});

describe("withPermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 403 when user role is not allowed", async () => {
    const mockUser = {
      id: "user-123",
      role: "learner",
      organizationId: "org-1",
      email: "learner@example.com",
      name: "Test Learner",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn();
    const wrappedHandler = withPermission(["teacher", "school_admin"])(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Insufficient permissions");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should call handler when user role is allowed", async () => {
    const mockUser = {
      id: "user-123",
      role: "school_admin",
      organizationId: "org-1",
      email: "admin@example.com",
      name: "Test Admin",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withPermission(["teacher", "school_admin"])(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("withAdminAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow platform_admin access", async () => {
    const mockUser = {
      id: "user-123",
      role: "platform_admin",
      organizationId: null,
      email: "platform@example.com",
      name: "Platform Admin",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withAdminAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should allow school_admin access", async () => {
    const mockUser = {
      id: "user-123",
      role: "school_admin",
      organizationId: "org-1",
      email: "school@example.com",
      name: "School Admin",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withAdminAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should deny teacher access", async () => {
    const mockUser = {
      id: "user-123",
      role: "teacher",
      organizationId: "org-1",
      email: "teacher@example.com",
      name: "Teacher",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn();
    const wrappedHandler = withAdminAuth(handler);
    const request = new NextRequest("http://localhost/api/test");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("withOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow platform_admin to access any organization", async () => {
    const mockUser = {
      id: "user-123",
      role: "platform_admin",
      organizationId: null,
      email: "platform@example.com",
      name: "Platform Admin",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withOrganization((req) => req.nextUrl.searchParams.get("orgId"))(
      handler
    );
    const request = new NextRequest("http://localhost/api/test?orgId=other-org");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should deny access when user tries to access different organization", async () => {
    const mockUser = {
      id: "user-123",
      role: "school_admin",
      organizationId: "org-1",
      email: "school@example.com",
      name: "School Admin",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn();
    const wrappedHandler = withOrganization((req) => req.nextUrl.searchParams.get("orgId"))(
      handler
    );
    const request = new NextRequest("http://localhost/api/test?orgId=other-org");

    const response = await wrappedHandler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe("ORG_ACCESS_DENIED");
    expect(handler).not.toHaveBeenCalled();
  });

  it("should allow access when user accesses their own organization", async () => {
    const mockUser = {
      id: "user-123",
      role: "school_admin",
      organizationId: "org-1",
      email: "school@example.com",
      name: "School Admin",
    };

    mockAuth.mockResolvedValue({ user: { id: "user-123" } });
    mockDbSelect.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve([mockUser]),
      }),
    });

    const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withOrganization((req) => req.nextUrl.searchParams.get("orgId"))(
      handler
    );
    const request = new NextRequest("http://localhost/api/test?orgId=org-1");

    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
