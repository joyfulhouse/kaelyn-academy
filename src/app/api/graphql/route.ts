import { createYoga } from "graphql-yoga";
import { NextRequest, NextResponse } from "next/server";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { costLimitPlugin } from "@escape.tech/graphql-armor-cost-limit";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { schema } from "@/lib/graphql/schema";
import { auth } from "@/lib/auth";
import { checkGraphqlRateLimit } from "@/lib/rate-limit";
import type { GraphQLContext } from "@/lib/graphql/builder";

// Security configuration
const MAX_DEPTH = 6; // Prevents deeply nested queries
const MAX_ALIASES = 15; // Prevents alias-based DoS attacks
const MAX_COST = 5000; // Maximum query cost
const DISABLE_INTROSPECTION_IN_PRODUCTION = process.env.NODE_ENV === "production";

// Create the Yoga handler with security plugins
const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  plugins: [
    // Limit query depth to prevent deeply nested queries
    maxDepthPlugin({ n: MAX_DEPTH }),
    // Limit aliases to prevent alias-based DoS
    maxAliasesPlugin({ n: MAX_ALIASES }),
    // Limit query cost to prevent complex queries
    costLimitPlugin({ maxCost: MAX_COST }),
    // Disable introspection in production for security
    ...(DISABLE_INTROSPECTION_IN_PRODUCTION ? [useDisableIntrospection()] : []),
  ],
  context: async () => {
    // Get authenticated user from session
    const session = await auth();

    if (!session?.user) {
      return {};
    }

    return {
      user: {
        id: session.user.id!,
        email: session.user.email!,
        role: session.user.role,
        organizationId: session.user.organizationId,
      },
    };
  },
});

// Next.js App Router handlers - wrap yoga to match expected signature
export async function GET(request: NextRequest): Promise<NextResponse | Response> {
  return yoga.fetch(request);
}

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  // Get session for rate limiting
  const session = await auth();
  const userId = session?.user?.id;

  // Apply rate limiting
  const rateLimitResult = checkGraphqlRateLimit(request, userId);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  return yoga.fetch(request);
}
