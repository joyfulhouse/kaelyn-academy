/**
 * Sentry Client Configuration
 *
 * Initializes Sentry for the browser/client-side.
 * Includes error tracking, performance monitoring, and session replay.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production or when explicitly set
  enabled: !!SENTRY_DSN && process.env.NODE_ENV !== "development",

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay for error reproduction
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when errors occur

  integrations: [
    Sentry.replayIntegration({
      // COPPA compliance: mask all user input by default
      maskAllText: true,
      maskAllInputs: true,
      // Don't capture media to reduce data collection
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter sensitive data before sending
  beforeSend(event) {
    // Remove any potential PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        // Redact user input from breadcrumbs
        if (breadcrumb.category === "ui.input" && breadcrumb.message) {
          breadcrumb.message = "[REDACTED]";
        }
        return breadcrumb;
      });
    }

    // Remove email addresses from error messages
    if (event.message) {
      event.message = event.message.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        "[EMAIL]"
      );
    }

    return event;
  },

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Network errors
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    // User actions
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version for source maps
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "development",
});
