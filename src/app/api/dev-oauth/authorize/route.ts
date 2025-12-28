import { NextRequest, NextResponse } from "next/server";

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

/**
 * Dev OAuth Authorization Endpoint
 * Simulates OAuth authorization flow - only available in development
 * Reads role from 'dev-oauth-role' cookie (set by login page before OAuth redirect)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  // Read role from cookie (set by login page before OAuth redirect)
  const cookieRole = request.cookies.get("dev-oauth-role")?.value;
  const role = (cookieRole || "learner") as DevRole;

  if (!redirectUri) {
    return NextResponse.json({ error: "Missing redirect_uri" }, { status: 400 });
  }

  // Generate a mock authorization code that includes the role
  const code = `dev_auth_code_${role}_${Date.now()}`;

  // Redirect back to NextAuth callback with the code
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) {
    callbackUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(callbackUrl);
}
