import { NextResponse } from "next/server";
import { isDevOAuthEnabled, verifyDevToken, signDevToken } from "../authorize/route";

/**
 * Dev OAuth Token Endpoint
 * Exchanges authorization code for tokens - only available in development with explicit opt-in
 * Uses HMAC-signed tokens for security
 */
export async function POST(request: Request) {
  // SECURITY: Require both development mode AND explicit opt-in
  if (!isDevOAuthEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Parse the authorization code
  const body = await request.text();
  const params = new URLSearchParams(body);
  const code = params.get("code") || "";

  // SECURITY: Verify the authorization code signature and expiration
  const verified = verifyDevToken(code);
  if (!verified) {
    return NextResponse.json(
      { error: "Invalid or expired authorization code" },
      { status: 400 }
    );
  }

  // Extract role from verified code data (format: "code:{role}")
  const roleMatch = verified.data.match(/^code:(\w+)$/);
  if (!roleMatch) {
    return NextResponse.json(
      { error: "Invalid authorization code format" },
      { status: 400 }
    );
  }
  const role = roleMatch[1];

  // Generate a cryptographically signed access token
  const accessToken = signDevToken(`token:${role}`);

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 300, // 5 minutes - matches token verification window
    scope: "openid profile email",
  });
}
