/**
 * Rate Limiting
 *
 * Simple sliding window rate limiter for API endpoints.
 * Uses in-memory storage - for production with multiple instances,
 * consider using Redis (e.g., @upstash/ratelimit).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Message to return when rate limited */
  message?: string;
  /** Unique identifier for this limiter (for logging) */
  name?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage for rate limit entries
// In production, use Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 * Uses IP address or falls back to a session identifier
 */
function getClientId(request: NextRequest, userId?: string): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (for proxied requests)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return `ip:${forwardedFor.split(",")[0].trim()}`;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback to a generic identifier (not ideal)
  return `ip:unknown`;
}

/**
 * Create a rate limiter function
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { limit, windowMs, message = "Too many requests", name = "default" } = config;

  return function checkRateLimit(
    request: NextRequest,
    userId?: string
  ): { success: boolean; remaining: number; resetAt: number; response?: NextResponse } {
    cleanup();

    const clientId = getClientId(request, userId);
    const key = `${name}:${clientId}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt <= now) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        success: true,
        remaining: limit - 1,
        resetAt: now + windowMs,
      };
    }

    if (entry.count >= limit) {
      // Rate limited
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
        response: NextResponse.json(
          { error: message, retryAfter },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(entry.resetAt),
            },
          }
        ),
      };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
      success: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    };
  };
}

/**
 * Wrapper function for easy use in API routes
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  const checkLimit = createRateLimiter(config);

  return async function rateLimitedHandler(
    request: NextRequest,
    context?: unknown
  ): Promise<NextResponse> {
    // Extract user ID if available (from header set by middleware)
    const userId = request.headers.get("x-user-id") ?? undefined;

    const result = checkLimit(request, userId);

    if (!result.success && result.response) {
      return result.response;
    }

    const response = await handler(request, context);

    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Limit", String(config.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.resetAt));

    return response;
  };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /** Standard API rate limit: 100 requests per minute */
  api: createRateLimiter({
    limit: 100,
    windowMs: 60000,
    name: "api",
    message: "Too many API requests. Please try again later.",
  }),

  /** AI/Agent endpoints: 20 requests per minute (expensive operations) */
  ai: createRateLimiter({
    limit: 20,
    windowMs: 60000,
    name: "ai",
    message: "Too many AI requests. Please wait before sending more.",
  }),

  /** Auth endpoints: 5 attempts per 5 minutes */
  auth: createRateLimiter({
    limit: 5,
    windowMs: 300000,
    name: "auth",
    message: "Too many authentication attempts. Please try again later.",
  }),

  /** GraphQL: 50 requests per minute */
  graphql: createRateLimiter({
    limit: 50,
    windowMs: 60000,
    name: "graphql",
    message: "Too many GraphQL requests. Please try again later.",
  }),
};

/**
 * Check rate limit and return early if exceeded
 * Use in route handlers:
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = checkApiRateLimit(request);
 *   if (!rateLimitResult.success) return rateLimitResult.response!;
 *   // ... rest of handler
 * }
 */
export function checkApiRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.api(request, userId);
}

export function checkAiRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.ai(request, userId);
}

export function checkAuthRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.auth(request, userId);
}

export function checkGraphqlRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.graphql(request, userId);
}
