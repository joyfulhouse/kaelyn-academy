import { NextRequest, NextResponse } from "next/server";
import { DEV_USERS, type DevRole } from "../authorize/route";

/**
 * Dev OAuth UserInfo Endpoint
 * Returns user profile based on the access token's role - only available in development
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Extract the access token from Authorization header
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || "";

  // Extract role from token format: dev_access_token_{role}_{timestamp}
  const roleMatch = accessToken.match(/^dev_access_token_(\w+)_\d+$/);
  const role = (roleMatch ? roleMatch[1] : "learner") as DevRole;

  // Get the user profile for this role
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
