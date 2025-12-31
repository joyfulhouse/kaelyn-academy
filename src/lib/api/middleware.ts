/**
 * API Middleware Layer
 *
 * Composable middleware wrappers for API routes to eliminate duplicate
 * auth checks, permission validation, and rate limiting code.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { handleApiError, apiError } from "./error-handler";
import type { Session } from "next-auth";

// Types
export type UserRole = "platform_admin" | "school_admin" | "teacher" | "parent" | "learner";

export interface AuthenticatedRequest extends NextRequest {
  auth: NonNullable<Session>;
  user: {
    id: string;
    role: UserRole;
    organizationId: string | null;
    email: string;
    name: string | null;
  };
}

export type AuthenticatedHandler = (
  request: AuthenticatedRequest,
  context?: { params?: Record<string, string | string[]> }
) => Promise<NextResponse>;

export type RouteHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string | string[]> }
) => Promise<NextResponse>;

/**
 * Require authentication for an API route
 *
 * @example
 * export const GET = withAuth(async (request) => {
 *   // request.auth and request.user are guaranteed to exist
 *   const userId = request.user.id;
 *   return ApiResponse.success({ userId });
 * });
 */
export function withAuth(handler: AuthenticatedHandler): RouteHandler {
  return async (request, context) => {
    try {
      const session = await auth();

      if (!session?.user?.id) {
        return apiError("Authentication required", 401, "UNAUTHORIZED");
      }

      // Get full user details including role and organization
      const [user] = await db
        .select({
          id: users.id,
          role: users.role,
          organizationId: users.organizationId,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, session.user.id));

      if (!user) {
        return apiError("User not found", 401, "USER_NOT_FOUND");
      }

      // Extend request with auth data
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = session as NonNullable<Session>;
      authenticatedRequest.user = user as AuthenticatedRequest["user"];

      return handler(authenticatedRequest, context);
    } catch (error) {
      return handleApiError(error, "auth-middleware");
    }
  };
}

/**
 * Require specific roles for an API route
 *
 * @param allowedRoles - Roles that are permitted to access this route
 *
 * @example
 * export const GET = withPermission(["platform_admin", "school_admin"])(
 *   async (request) => {
 *     // User is guaranteed to be admin
 *     return ApiResponse.success({ admin: true });
 *   }
 * );
 */
export function withPermission(allowedRoles: UserRole[]) {
  return (handler: AuthenticatedHandler): RouteHandler => {
    return withAuth(async (request, context) => {
      const userRole = request.user.role;

      if (!allowedRoles.includes(userRole)) {
        return apiError("Insufficient permissions", 403, "FORBIDDEN");
      }

      return handler(request, context);
    });
  };
}

/**
 * Require admin access (platform_admin or school_admin)
 *
 * @example
 * export const GET = withAdminAuth(async (request) => {
 *   // User is guaranteed to be an admin
 *   return ApiResponse.success({ admin: true });
 * });
 */
export function withAdminAuth(handler: AuthenticatedHandler): RouteHandler {
  return withPermission(["platform_admin", "school_admin"])(handler);
}

/**
 * Require platform admin access only
 *
 * @example
 * export const DELETE = withPlatformAdminAuth(async (request) => {
 *   // User is guaranteed to be platform admin
 *   return ApiResponse.success({ deleted: true });
 * });
 */
export function withPlatformAdminAuth(handler: AuthenticatedHandler): RouteHandler {
  return withPermission(["platform_admin"])(handler);
}

/**
 * Require teacher access
 */
export function withTeacherAuth(handler: AuthenticatedHandler): RouteHandler {
  return withPermission(["platform_admin", "school_admin", "teacher"])(handler);
}

/**
 * Require parent access
 */
export function withParentAuth(handler: AuthenticatedHandler): RouteHandler {
  return withPermission(["platform_admin", "school_admin", "parent"])(handler);
}

/**
 * Ensure the user belongs to the specified organization (tenant isolation)
 *
 * @param getOrgId - Function to extract organization ID from request
 *
 * @example
 * export const GET = withOrganization((req) => req.nextUrl.searchParams.get("orgId"))(
 *   async (request) => {
 *     // User is guaranteed to have access to this organization
 *     return ApiResponse.success({ data: "..." });
 *   }
 * );
 */
export function withOrganization(
  getOrgId: (request: AuthenticatedRequest) => string | null
) {
  return (handler: AuthenticatedHandler): RouteHandler => {
    return withAuth(async (request, context) => {
      const targetOrgId = getOrgId(request);
      const { user } = request;

      // Platform admins can access any organization
      if (user.role === "platform_admin") {
        return handler(request, context);
      }

      // Other users can only access their own organization
      if (targetOrgId && user.organizationId !== targetOrgId) {
        return apiError("Access denied to this organization", 403, "ORG_ACCESS_DENIED");
      }

      return handler(request, context);
    });
  };
}

/**
 * Compose multiple middleware wrappers
 *
 * @example
 * export const GET = compose(
 *   withAuth,
 *   withPermission(["teacher"]),
 *   withErrorHandler("get-students")
 * )(async (request) => {
 *   return ApiResponse.success({ students: [] });
 * });
 */
export function compose<T extends RouteHandler>(
  ...middlewares: Array<(handler: T) => T>
): (handler: T) => T {
  return (handler: T) =>
    middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}
