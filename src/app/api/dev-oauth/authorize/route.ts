import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";

// Dev user profiles for different roles
export const DEV_USERS = {
  learner: {
    sub: "dev-learner-id",
    email: "learner@kaelyns.academy",
    name: "Dev Learner",
    role: "learner",
  },
  parent: {
    sub: "dev-parent-id",
    email: "parent@kaelyns.academy",
    name: "Dev Parent",
    role: "parent",
  },
  teacher: {
    sub: "dev-teacher-id",
    email: "teacher@kaelyns.academy",
    name: "Dev Teacher",
    role: "teacher",
  },
  admin: {
    sub: "dev-admin-id",
    email: "admin@kaelyns.academy",
    name: "Dev Admin",
    role: "platform_admin",
  },
} as const;

export type DevRole = keyof typeof DEV_USERS;

// Allowed roles whitelist - prevents arbitrary role injection
const ALLOWED_ROLES: readonly string[] = ["learner", "parent", "teacher", "admin"] as const;

// Secret for signing dev OAuth tokens - generated once per server start
// In dev mode only, this provides defense-in-depth against token forgery
const DEV_OAUTH_SECRET = process.env.DEV_OAUTH_SECRET || randomBytes(32).toString("hex");

/**
 * Check if dev OAuth is allowed
 * Requires BOTH development mode AND explicit opt-in via ENABLE_DEV_OAUTH=true
 */
export function isDevOAuthEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_OAUTH === "true"
  );
}

/**
 * Sign a dev OAuth code/token using HMAC
 * Format: {data}.{timestamp}.{signature}
 */
export function signDevToken(data: string): string {
  const timestamp = Date.now().toString();
  const payload = `${data}.${timestamp}`;
  const signature = createHmac("sha256", DEV_OAUTH_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16); // Use first 16 chars for shorter tokens
  return `${payload}.${signature}`;
}

/**
 * Verify and extract data from a signed dev OAuth token
 * Returns null if invalid or expired (tokens expire after 5 minutes)
 */
export function verifyDevToken(token: string): { data: string; timestamp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [data, timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  // Check timestamp validity (must be within last 5 minutes)
  const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
  if (isNaN(timestamp) || Date.now() - timestamp > MAX_AGE_MS) {
    return null;
  }

  // Verify signature
  const payload = `${data}.${timestampStr}`;
  const expectedSignature = createHmac("sha256", DEV_OAUTH_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);

  if (providedSignature !== expectedSignature) {
    return null;
  }

  return { data, timestamp };
}

/**
 * Dev OAuth Authorization Endpoint
 * Simulates OAuth authorization flow - only available in development with explicit opt-in
 * Reads role from 'dev-oauth-role' cookie (set by login page before OAuth redirect)
 */
export async function GET(request: NextRequest) {
  // SECURITY: Require both development mode AND explicit opt-in
  if (!isDevOAuthEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!redirectUri) {
    return NextResponse.json({ error: "Missing redirect_uri" }, { status: 400 });
  }

  // SECURITY: Validate redirect_uri is localhost only
  try {
    const redirectUrl = new URL(redirectUri);
    if (!["localhost", "127.0.0.1"].includes(redirectUrl.hostname)) {
      return NextResponse.json(
        { error: "Invalid redirect_uri - must be localhost" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  // Read role from cookie (set by login page before OAuth redirect)
  const cookieRole = request.cookies.get("dev-oauth-role")?.value;

  // SECURITY: Whitelist validation - only allow known roles
  const role = ALLOWED_ROLES.includes(cookieRole || "")
    ? (cookieRole as DevRole)
    : "learner";

  // Generate a cryptographically signed authorization code
  const code = signDevToken(`code:${role}`);

  // Redirect back to NextAuth callback with the code
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) {
    callbackUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(callbackUrl);
}
