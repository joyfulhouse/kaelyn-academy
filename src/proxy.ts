import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Proxy Security (Next.js 16 pattern, replaces middleware.ts)
 *
 * 1. Rate limiting for all API routes (defense in depth)
 * 2. CSRF protection for state-changing requests
 */

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialize Redis and rate limiter only if configured
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Global API rate limiter: 100 requests per minute per IP
const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      prefix: "ratelimit:api:global",
      analytics: true,
    })
  : null;

// Shared rate limit configuration
const API_RATE_LIMIT = 100;
const API_WINDOW_MS = 60000;

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60000;

function cleanupMemoryStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

async function checkRateLimit(
  request: NextRequest
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const identifier = getClientIdentifier(request);

  // Use Upstash Redis if available
  if (apiRateLimiter) {
    try {
      const result = await apiRateLimiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      // If Redis fails, fall through to in-memory fallback
      console.error("[Proxy] Redis rate limit check failed, using in-memory fallback:", error);
    }
  }

  // Fallback to in-memory for development or Redis failure
  cleanupMemoryStore();
  const now = Date.now();
  const key = `global:${identifier}`;
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + API_WINDOW_MS });
    return { success: true, remaining: API_RATE_LIMIT - 1, reset: now + API_WINDOW_MS };
  }

  if (entry.count >= API_RATE_LIMIT) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: API_RATE_LIMIT - entry.count, reset: entry.resetAt };
}

// Paths exempt from rate limiting
const RATE_LIMIT_EXEMPT_PATHS = [
  "/api/health", // Health checks for load balancers
  "/api/auth", // NextAuth handles its own rate limiting
];

function isRateLimitExempt(pathname: string): boolean {
  return RATE_LIMIT_EXEMPT_PATHS.some((path) => pathname.startsWith(path));
}

// ============================================================================
// CSRF Protection Configuration
// ============================================================================

const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

// Methods that can change state and need CSRF protection
const PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

// Paths that don't need CSRF protection (public or have their own protection)
const CSRF_EXEMPT_PATHS = [
  "/api/auth", // NextAuth has its own CSRF protection
  "/api/webhooks", // Webhooks use signatures for verification
  "/api/dev-oauth", // Dev OAuth provider (has state verification, dev only)
];

function isExemptPath(pathname: string): boolean {
  return CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path));
}

function getOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  // Fall back to referer for same-origin requests without Origin header
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      return null;
    }
  }

  return null;
}

function isValidOrigin(origin: string | null, requestUrl: URL): boolean {
  if (!origin) {
    // Allow requests without origin/referer only if they're same-origin
    // (e.g., direct API calls from server components)
    return false;
  }

  // Check against allowed origins
  if (ALLOWED_ORIGINS.length > 0) {
    return ALLOWED_ORIGINS.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        const originUrl = new URL(origin);
        return allowedUrl.host === originUrl.host;
      } catch {
        return false;
      }
    });
  }

  // Default: check if origin matches request host
  try {
    const originUrl = new URL(origin);
    return originUrl.host === requestUrl.host;
  } catch {
    return false;
  }
}

function csrfProtection(request: NextRequest): NextResponse | null {
  const { method, url } = request;
  const requestUrl = new URL(url);

  // Only protect state-changing methods
  if (!PROTECTED_METHODS.includes(method)) {
    return null;
  }

  // Skip CSRF-exempt paths
  if (isExemptPath(requestUrl.pathname)) {
    return null;
  }

  // Only apply to API routes
  if (!requestUrl.pathname.startsWith("/api/")) {
    return null;
  }

  const origin = getOrigin(request);

  // For server-to-server calls (no browser), we rely on auth middleware
  // This handles SSR and internal API calls
  if (!origin) {
    // Check if it's likely a server-side request (no browser headers)
    const userAgent = request.headers.get("user-agent");
    const isServerRequest = !userAgent || userAgent.includes("Node") || userAgent.includes("Undici");

    if (isServerRequest) {
      return null; // Allow server-side requests, auth middleware handles authorization
    }

    // Browser request without origin - suspicious
    return NextResponse.json(
      { error: "CSRF validation failed: Missing origin header" },
      { status: 403 }
    );
  }

  // Validate the origin
  if (!isValidOrigin(origin, requestUrl)) {
    console.warn(`CSRF blocked: Origin ${origin} not allowed for ${requestUrl.pathname}`);
    return NextResponse.json(
      { error: "CSRF validation failed: Invalid origin" },
      { status: 403 }
    );
  }

  return null;
}

// ============================================================================
// Proxy Handler (Next.js 16 pattern)
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate limiting for API routes (defense in depth)
  if (pathname.startsWith("/api/") && !isRateLimitExempt(pathname)) {
    const rateLimitResult = await checkRateLimit(request);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(API_RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      );
    }
  }

  // 2. CSRF protection for state-changing requests
  const csrfResponse = csrfProtection(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure which paths the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
