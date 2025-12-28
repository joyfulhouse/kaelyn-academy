import { NextRequest, NextResponse } from "next/server";
import { DEV_USERS, type DevRole, isDevOAuthEnabled, verifyDevToken } from "../authorize/route";

/**
 * Dev OAuth UserInfo Endpoint
 * Returns user profile based on the access token's role - only available in development with explicit opt-in
 * Requires cryptographically signed and valid (non-expired) access token
 */
export async function GET(request: NextRequest) {
  // SECURITY: Require both development mode AND explicit opt-in
  if (!isDevOAuthEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Extract the access token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }
  const accessToken = authHeader.slice(7); // Remove "Bearer " prefix

  // SECURITY: Verify the access token signature and expiration
  const verified = verifyDevToken(accessToken);
  if (!verified) {
    return NextResponse.json(
      { error: "Invalid or expired access token" },
      { status: 401 }
    );
  }

  // Extract role from verified token data (format: "token:{role}")
  const roleMatch = verified.data.match(/^token:(\w+)$/);
  if (!roleMatch) {
    return NextResponse.json(
      { error: "Invalid access token format" },
      { status: 401 }
    );
  }
  const role = roleMatch[1] as DevRole;

  // Get the user profile for this role (fallback to learner if unknown)
  const user = DEV_USERS[role] || DEV_USERS.learner;

  return NextResponse.json({
    sub: user.sub,
    email: user.email,
    name: user.name,
    picture: null,
    email_verified: true,
    role: user.role,
  });
}
