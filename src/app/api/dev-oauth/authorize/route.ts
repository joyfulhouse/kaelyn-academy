import { NextRequest, NextResponse } from "next/server";

/**
 * Dev OAuth Authorization Endpoint
 * Simulates OAuth authorization flow - only available in development
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!redirectUri) {
    return NextResponse.json({ error: "Missing redirect_uri" }, { status: 400 });
  }

  // Generate a mock authorization code
  const code = `dev_auth_code_${Date.now()}`;

  // Redirect back to NextAuth callback with the code
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) {
    callbackUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(callbackUrl);
}
