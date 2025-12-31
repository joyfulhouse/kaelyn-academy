/**
 * Standardized API Response Utilities
 *
 * Provides consistent response formatting across all API routes.
 * All responses follow the format: { data, error, meta }
 */

import { NextResponse } from "next/server";

// Response types
export interface SuccessResponse<T = unknown> {
  data: T;
  meta?: ResponseMeta;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  meta: PaginationMeta;
}

export interface ResponseMeta {
  timestamp?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface PaginationMeta extends ResponseMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Standardized API Response builder
 */
export const ApiResponse = {
  /**
   * Create a success response
   *
   * @example
   * return ApiResponse.success({ user: { id: "1", name: "John" } });
   * // { data: { user: { id: "1", name: "John" } } }
   */
  success<T>(data: T, meta?: ResponseMeta): NextResponse<SuccessResponse<T>> {
    return NextResponse.json({
      data,
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    });
  },

  /**
   * Create a paginated success response
   *
   * @example
   * return ApiResponse.paginated(users, { total: 100, limit: 10, offset: 0 });
   * // { data: [...], meta: { total: 100, limit: 10, offset: 0, hasMore: true } }
   */
  paginated<T>(
    data: T[],
    pagination: { total: number; limit: number; offset: number },
    extraMeta?: Omit<ResponseMeta, "total" | "limit" | "offset" | "hasMore">
  ): NextResponse<PaginatedResponse<T>> {
    const { total, limit, offset } = pagination;
    return NextResponse.json({
      data,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + data.length < total,
        ...extraMeta,
      },
    });
  },

  /**
   * Create an error response
   *
   * @example
   * return ApiResponse.error("User not found", 404, "USER_NOT_FOUND");
   * // { error: "User not found", code: "USER_NOT_FOUND" }
   */
  error(
    message: string,
    status: number = 400,
    code?: string,
    details?: unknown
  ): NextResponse<ErrorResponse> {
    return NextResponse.json(
      {
        error: message,
        ...(code ? { code } : {}),
        ...(details !== undefined ? { details } : {}),
      },
      { status }
    );
  },

  /**
   * Create a 201 Created response
   *
   * @example
   * return ApiResponse.created({ id: "new-user-id", name: "John" });
   */
  created<T>(data: T, meta?: ResponseMeta): NextResponse<SuccessResponse<T>> {
    return NextResponse.json(
      {
        data,
        ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
      },
      { status: 201 }
    );
  },

  /**
   * Create a 204 No Content response
   *
   * @example
   * return ApiResponse.noContent();
   */
  noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  },

  /**
   * Common error responses
   */
  unauthorized(message = "Authentication required"): NextResponse<ErrorResponse> {
    return ApiResponse.error(message, 401, "UNAUTHORIZED");
  },

  forbidden(message = "Access denied"): NextResponse<ErrorResponse> {
    return ApiResponse.error(message, 403, "FORBIDDEN");
  },

  notFound(resource = "Resource"): NextResponse<ErrorResponse> {
    return ApiResponse.error(`${resource} not found`, 404, "NOT_FOUND");
  },

  badRequest(message: string, details?: unknown): NextResponse<ErrorResponse> {
    return ApiResponse.error(message, 400, "BAD_REQUEST", details);
  },

  conflict(message: string): NextResponse<ErrorResponse> {
    return ApiResponse.error(message, 409, "CONFLICT");
  },

  tooManyRequests(retryAfter?: number): NextResponse<ErrorResponse> {
    const response = ApiResponse.error(
      "Too many requests. Please try again later.",
      429,
      "RATE_LIMITED"
    );
    if (retryAfter) {
      response.headers.set("Retry-After", String(retryAfter));
    }
    return response;
  },

  internalError(message = "An unexpected error occurred"): NextResponse<ErrorResponse> {
    return ApiResponse.error(message, 500, "INTERNAL_ERROR");
  },
};

export default ApiResponse;
