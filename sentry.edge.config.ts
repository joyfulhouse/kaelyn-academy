/**
 * Sentry Edge Configuration
 *
 * Initializes Sentry for Edge runtime (middleware, edge functions).
 * Uses minimal configuration since Edge has limited APIs.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production or when explicitly set
  enabled: !!SENTRY_DSN && process.env.NODE_ENV !== "development",

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version for source maps
  release: process.env.VERCEL_GIT_COMMIT_SHA ?? "development",
});
