/**
 * Sentry Server Configuration
 *
 * Initializes Sentry for the Node.js server-side (API routes, server components).
 * Includes error tracking and performance monitoring.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production or when explicitly set
  enabled: !!SENTRY_DSN && process.env.NODE_ENV !== "development",

  // Performance monitoring - lower sample rate on server to reduce noise
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Filter sensitive data before sending
  beforeSend(event) {
    // Remove potential PII from exception values
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => {
        if (exception.value) {
          // Redact email addresses
          exception.value = exception.value.replace(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            "[EMAIL]"
          );
          // Redact UUIDs (potential user IDs)
          exception.value = exception.value.replace(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
            "[UUID]"
          );
        }
        return exception;
      });
    }

    return event;
  },

  // Don't capture certain routes
  beforeSendTransaction(event) {
    // Skip health check endpoints
    if (event.transaction?.includes("/api/health")) {
      return null;
    }
    return event;
  },

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version for source maps
  release: process.env.VERCEL_GIT_COMMIT_SHA ?? "development",
});
