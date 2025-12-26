import { NextResponse } from "next/server";

/**
 * Dev OAuth Token Endpoint
 * Exchanges authorization code for tokens - only available in development
 * Uses simple opaque tokens (not JWTs) for OAuth2 compatibility
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Parse the authorization code to extract the role
  const body = await request.text();
  const params = new URLSearchParams(body);
  const code = params.get("code") || "";

  // Extract role from code format: dev_auth_code_{role}_{timestamp}
  const roleMatch = code.match(/^dev_auth_code_(\w+)_\d+$/);
  const role = roleMatch ? roleMatch[1] : "learner";

  // Generate access token that includes the role
  const accessToken = `dev_access_token_${role}_${Date.now()}`;

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: "openid profile email",
  });
}
