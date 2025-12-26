import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * CSRF Protection Middleware
 *
 * Validates that state-changing requests (POST, PUT, DELETE, PATCH) come from
 * the same origin. This protects against CSRF attacks where malicious sites
 * try to make requests on behalf of authenticated users.
 */

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

export default auth((request) => {
  // Run CSRF protection first
  const csrfResponse = csrfProtection(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Continue with the request
  return NextResponse.next();
});

// Configure which paths the middleware runs on
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
