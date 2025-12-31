/**
 * Structured Logging Utility
 *
 * Provides consistent JSON-formatted logging for production environments.
 * Integrates with common log aggregation services (Datadog, Papertrail, etc.)
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  /** Request ID for tracing */
  requestId?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Organization ID for multi-tenant context */
  organizationId?: string;
  /** Additional metadata */
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Determine if we should use structured JSON logging
 */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Minimum log level (configurable via environment)
 */
const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const minLevel = (process.env.LOG_LEVEL as LogLevel) ?? (isProduction ? "info" : "debug");

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return logLevelPriority[level] >= logLevelPriority[minLevel];
}

/**
 * Format error for logging
 */
function formatError(error: unknown): LogEntry["error"] | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isProduction ? undefined : error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && Object.keys(context).length > 0 && { context }),
    ...(error && { error: formatError(error) }),
  };
}

/**
 * Output a log entry
 */
function output(entry: LogEntry): void {
  const logFn = entry.level === "error" ? console.error :
                entry.level === "warn" ? console.warn :
                console.log;

  if (isProduction) {
    // JSON format for production log aggregation
    logFn(JSON.stringify(entry));
  } else {
    // Human-readable format for development
    const prefix = `[${entry.level.toUpperCase()}]`;
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
    const errorStr = entry.error ? ` Error: ${entry.error.message}` : "";
    logFn(`${prefix} ${entry.message}${contextStr}${errorStr}`);
    if (entry.error?.stack) {
      logFn(entry.error.stack);
    }
  }
}

/**
 * Logger interface
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog("debug")) {
      output(createLogEntry("debug", message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog("info")) {
      output(createLogEntry("info", message, context));
    }
  },

  warn(message: string, context?: LogContext, error?: unknown): void {
    if (shouldLog("warn")) {
      output(createLogEntry("warn", message, context, error));
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog("error")) {
      output(createLogEntry("error", message, context, error));
    }
  },

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...defaultContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: LogContext, error?: unknown) =>
        logger.warn(message, { ...defaultContext, ...context }, error),
      error: (message: string, error?: unknown, context?: LogContext) =>
        logger.error(message, error, { ...defaultContext, ...context }),
    };
  },
};

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(requestId: string, userId?: string, organizationId?: string) {
  return logger.child({
    requestId,
    ...(userId && { userId }),
    ...(organizationId && { organizationId }),
  });
}

/**
 * Log API request/response for observability
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  context?: LogContext
): void {
  const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

  logger[level](`${method} ${path} ${statusCode} ${durationMs}ms`, {
    ...context,
    method,
    path,
    statusCode,
    durationMs,
  });
}
