/**
 * Rate Limiting
 *
 * Distributed rate limiter for API endpoints.
 * Uses Upstash Redis when configured (production), falls back to in-memory (development).
 *
 * Production requires:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  response?: NextResponse;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Check if Redis is configured
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialize Redis client only if configured
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory storage for development (fallback)
const rateLimitStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60000;
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

// Log once at startup which mode we're using
if (typeof window === "undefined") {
  if (isRedisConfigured) {
    console.log("[Rate Limit] Using distributed rate limiting (Upstash Redis)");
  } else {
    console.log("[Rate Limit] Using in-memory rate limiting (development mode)");
  }
}

/**
 * Get client identifier from request
 * Uses IP address or falls back to a session identifier
 */
function getClientId(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return `ip:${forwardedFor.split(",")[0].trim()}`;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return `ip:${realIp}`;
  }

  return `ip:unknown`;
}

/**
 * Convert milliseconds to Upstash duration string
 */
function msToUpstashDuration(ms: number): `${number} s` | `${number} m` | `${number} h` {
  if (ms >= 3600000) {
    return `${Math.round(ms / 3600000)} h` as `${number} h`;
  }
  if (ms >= 60000) {
    return `${Math.round(ms / 60000)} m` as `${number} m`;
  }
  return `${Math.round(ms / 1000)} s` as `${number} s`;
}

// Cache for Upstash ratelimiters (one per config)
const upstashLimiters = new Map<string, Ratelimit>();

/**
 * Get or create an Upstash ratelimiter for a config
 */
function getUpstashLimiter(config: RateLimitConfig): Ratelimit {
  const key = `${config.name}:${config.limit}:${config.windowMs}`;

  let limiter = upstashLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(config.limit, msToUpstashDuration(config.windowMs)),
      prefix: `ratelimit:${config.name}`,
      analytics: true,
    });
    upstashLimiters.set(key, limiter);
  }

  return limiter;
}

/**
 * Create a rate limiter function that uses Redis when available
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { limit, windowMs, message = "Too many requests", name = "default" } = config;

  return async function checkRateLimit(
    request: NextRequest,
    userId?: string
  ): Promise<RateLimitResult> {
    const clientId = getClientId(request, userId);

    // Use Upstash Redis in production
    if (isRedisConfigured && redis) {
      try {
        const limiter = getUpstashLimiter(config);
        const result = await limiter.limit(clientId);

        if (!result.success) {
          const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
          return {
            success: false,
            remaining: 0,
            resetAt: result.reset,
            response: NextResponse.json(
              { error: message, retryAfter },
              {
                status: 429,
                headers: {
                  "Retry-After": String(retryAfter),
                  "X-RateLimit-Limit": String(limit),
                  "X-RateLimit-Remaining": "0",
                  "X-RateLimit-Reset": String(result.reset),
                },
              }
            ),
          };
        }

        return {
          success: true,
          remaining: result.remaining,
          resetAt: result.reset,
        };
      } catch (error) {
        // Log error but don't block requests if Redis is down
        console.error("[Rate Limit] Redis error, falling back to allow:", error);
        return {
          success: true,
          remaining: limit,
          resetAt: Date.now() + windowMs,
        };
      }
    }

    // Fallback to in-memory for development
    cleanup();

    const key = `${name}:${clientId}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt <= now) {
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
    const userId = request.headers.get("x-user-id") ?? undefined;

    const result = await checkLimit(request, userId);

    if (!result.success && result.response) {
      return result.response;
    }

    const response = await handler(request, context);

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

  /** Form submissions: 5 per hour (contact, demo requests, newsletter) */
  form: createRateLimiter({
    limit: 5,
    windowMs: 3600000,
    name: "form",
    message: "Too many form submissions. Please try again later.",
  }),

  /** Consent verification: 3 attempts per 15 minutes (security-sensitive) */
  consent: createRateLimiter({
    limit: 3,
    windowMs: 900000,
    name: "consent",
    message: "Too many verification attempts. Please wait before trying again.",
  }),

  /** Public endpoints: 30 per minute (blog, stats) */
  public: createRateLimiter({
    limit: 30,
    windowMs: 60000,
    name: "public",
    message: "Too many requests. Please try again later.",
  }),
};

/**
 * Check rate limit helpers
 * Note: These are now async functions that return Promises
 */
export async function checkApiRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.api(request, userId);
}

export async function checkAiRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.ai(request, userId);
}

export async function checkAuthRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.auth(request, userId);
}

export async function checkGraphqlRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.graphql(request, userId);
}

export async function checkFormRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.form(request, userId);
}

export async function checkConsentRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.consent(request, userId);
}

export async function checkPublicRateLimit(request: NextRequest, userId?: string) {
  return rateLimiters.public(request, userId);
}
