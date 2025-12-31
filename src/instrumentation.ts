/**
 * Next.js Instrumentation
 *
 * This file is automatically loaded by Next.js at startup.
 * It initializes Sentry for both Node.js and Edge runtimes.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Initialize Sentry for Node.js runtime (API routes, server components)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  // Initialize Sentry for Edge runtime (middleware, edge functions)
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Capture errors from Server Components, middleware, and proxies.
 * This is the recommended way to capture server-side errors in Next.js 15+.
 */
export const onRequestError = Sentry.captureRequestError;
