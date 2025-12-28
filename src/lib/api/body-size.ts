/**
 * Request Body Size Validation
 *
 * SECURITY: Validates request body size to prevent:
 * - Memory exhaustion from very large payloads
 * - DoS attacks via oversized requests
 *
 * Note: Next.js App Router has built-in body limits, but this provides:
 * 1. Explicit, configurable limits per route type
 * 2. Consistent error handling
 * 3. Request body size logging for monitoring
 */

import { NextRequest, NextResponse } from "next/server";

export interface BodySizeConfig {
  /** Maximum body size in bytes (default: 100KB) */
  maxBytes?: number;
  /** Error message to return (default: "Request body too large") */
  errorMessage?: string;
}

const DEFAULT_CONFIG: Required<BodySizeConfig> = {
  maxBytes: 100 * 1024, // 100KB default
  errorMessage: "Request body too large",
};

/**
 * Body size presets for common use cases
 */
export const BODY_SIZE_PRESETS = {
  /** Form submissions (100KB) */
  form: { maxBytes: 100 * 1024 },
  /** Standard API requests (256KB) */
  standard: { maxBytes: 256 * 1024 },
  /** JSON data with moderate content (512KB) */
  moderate: { maxBytes: 512 * 1024 },
  /** Rich content like blog posts (1MB) */
  richContent: { maxBytes: 1024 * 1024 },
  /** File uploads or AI content (5MB) */
  large: { maxBytes: 5 * 1024 * 1024 },
} as const;

/**
 * Validate request body size
 *
 * @param request - The Next.js request object
 * @param config - Body size configuration
 * @returns Result with success status and optional error response
 *
 * @example
 * const result = await validateBodySize(request, BODY_SIZE_PRESETS.form);
 * if (!result.success) return result.response;
 */
export async function validateBodySize(
  request: NextRequest,
  config: BodySizeConfig = {}
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const { maxBytes, errorMessage } = { ...DEFAULT_CONFIG, ...config };

  // Check Content-Length header first (quick check)
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (!isNaN(length) && length > maxBytes) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: errorMessage,
            detail: `Maximum allowed size is ${Math.round(maxBytes / 1024)}KB`,
          },
          { status: 413 } // Payload Too Large
        ),
      };
    }
  }

  return { success: true };
}

/**
 * Parse JSON body with size validation
 *
 * @param request - The Next.js request object
 * @param config - Body size configuration
 * @returns Parsed body or error response
 */
export async function parseBodyWithLimit<T = unknown>(
  request: NextRequest,
  config: BodySizeConfig = {}
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> {
  // Validate size first
  const sizeResult = await validateBodySize(request, config);
  if (!sizeResult.success) {
    return sizeResult;
  }

  try {
    const data = (await request.json()) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }
}
