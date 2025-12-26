import { NextResponse } from "next/server";

/**
 * Dev OAuth UserInfo Endpoint
 * Returns user profile - only available in development
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  return NextResponse.json({
    sub: "dev-user-id",
    email: "dev@kaelyns.academy",
    name: "Dev User",
    picture: null,
    email_verified: true,
  });
}
