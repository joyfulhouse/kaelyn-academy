import { NextResponse } from "next/server";
import { SignJWT } from "jose";

/**
 * Dev OAuth Token Endpoint
 * Exchanges authorization code for tokens - only available in development
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Generate a proper JWT access token
  const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-secret-key-min-32-chars-long!!"
  );

  const accessToken = await new SignJWT({
    sub: "dev-user-id",
    email: "dev@kaelyns.academy",
    name: "Dev User",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  // Generate ID token (for OIDC)
  const idToken = await new SignJWT({
    sub: "dev-user-id",
    email: "dev@kaelyns.academy",
    name: "Dev User",
    picture: null,
    email_verified: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer("http://localhost:3000")
    .setAudience("dev-oauth-client")
    .sign(secret);

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    id_token: idToken,
    scope: "openid profile email",
  });
}
