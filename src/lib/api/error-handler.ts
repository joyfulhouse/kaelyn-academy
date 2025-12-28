/**
 * API Error Handler
 *
 * SECURITY: Sanitizes error responses to prevent information leakage:
 * - In production: Generic error messages only
 * - In development: Detailed error info for debugging
 *
 * Prevents exposure of:
 * - Stack traces
 * - SQL query details
 * - File paths
 * - Internal service information
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export interface ApiError {
  /** Public error message safe for clients */
  message: string;
  /** HTTP status code */
  status: number;
  /** Error code for client-side handling */
  code?: string;
  /** Validation errors (Zod) - safe to expose */
  validation?: unknown[];
}

/**
 * Generic error messages for production
 */
const GENERIC_ERRORS: Record<number, string> = {
  400: "Invalid request",
  401: "Authentication required",
  403: "Access denied",
  404: "Resource not found",
  409: "Conflict with current state",
  413: "Request too large",
  429: "Too many requests",
  500: "An error occurred",
  503: "Service temporarily unavailable",
};

/**
 * Handle an API error and return a sanitized response
 *
 * @param error - The caught error
 * @param context - Context for logging (e.g., "contact form", "user update")
 * @param defaultStatus - Default status code if not determinable
 * @returns NextResponse with sanitized error
 *
 * @example
 * try {
 *   // ... operation
 * } catch (error) {
 *   return handleApiError(error, "creating user");
 * }
 */
export function handleApiError(
  error: unknown,
  context: string,
  defaultStatus = 500
): NextResponse {
  // Always log the full error server-side
  console.error(`API Error [${context}]:`, error);

  // Handle Zod validation errors specially (safe to expose)
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        ...(isProduction ? {} : { details: error.issues }),
        // In production, provide field-level errors without internal details
        ...(isProduction ? { fields: error.issues.map(i => ({ path: i.path, message: i.message })) } : {}),
      },
      { status: 400 }
    );
  }

  // Determine status code
  let status = defaultStatus;
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("not found")) status = 404;
    else if (error.message.includes("unauthorized") || error.message.includes("unauthenticated")) status = 401;
    else if (error.message.includes("forbidden") || error.message.includes("permission")) status = 403;
    else if (error.message.includes("duplicate") || error.message.includes("unique")) status = 409;
  }

  // Build response
  const response: Record<string, unknown> = {
    error: isProduction ? GENERIC_ERRORS[status] || "An error occurred" : getErrorMessage(error),
    code: getErrorCode(error, status),
  };

  // In development, include more details
  if (!isProduction && error instanceof Error) {
    response.detail = error.message;
    response.stack = error.stack?.split("\n").slice(0, 5);
  }

  return NextResponse.json(response, { status });
}

/**
 * Create a standardized error response
 *
 * @param message - Error message (will be sanitized in production)
 * @param status - HTTP status code
 * @param code - Optional error code
 * @returns NextResponse
 */
export function apiError(
  message: string,
  status: number,
  code?: string
): NextResponse {
  const publicMessage = isProduction ? GENERIC_ERRORS[status] || "An error occurred" : message;

  return NextResponse.json(
    {
      error: publicMessage,
      ...(code ? { code } : {}),
    },
    { status }
  );
}

/**
 * Extract a safe error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}

/**
 * Generate an error code from the error type
 */
function getErrorCode(error: unknown, status: number): string {
  if (error instanceof ZodError) return "VALIDATION_ERROR";
  if (error instanceof Error) {
    if (error.name === "NotFoundError") return "NOT_FOUND";
    if (error.name === "AuthError") return "AUTH_ERROR";
  }

  const statusCodes: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    413: "PAYLOAD_TOO_LARGE",
    429: "RATE_LIMITED",
    500: "INTERNAL_ERROR",
    503: "SERVICE_UNAVAILABLE",
  };

  return statusCodes[status] || "ERROR";
}

/**
 * Wrap an async handler with error handling
 *
 * @param handler - The async handler function
 * @param context - Context for error logging
 * @returns Wrapped handler
 *
 * @example
 * export const POST = withErrorHandler(
 *   async (request) => {
 *     // ... your logic
 *     return NextResponse.json({ success: true });
 *   },
 *   "create-user"
 * );
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context: string
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}
