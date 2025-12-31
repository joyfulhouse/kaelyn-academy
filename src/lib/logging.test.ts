/**
 * Tests for lib/logging.ts
 *
 * Tests structured logging utility including:
 * - Log level filtering
 * - Context propagation
 * - Error formatting
 * - Child loggers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, createRequestLogger, logApiRequest } from "./logging";

describe("logger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("info", () => {
    it("should log info messages", () => {
      logger.info("Test message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("Test message");
    });

    it("should include context in log output", () => {
      logger.info("User action", { userId: "123", action: "login" });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("userId");
      expect(logOutput).toContain("123");
    });
  });

  describe("warn", () => {
    it("should log warnings with console.warn", () => {
      logger.warn("Warning message");

      expect(warnSpy).toHaveBeenCalled();
    });

    it("should include error information when provided", () => {
      const error = new Error("Something went wrong");
      logger.warn("Warning with error", {}, error);

      expect(warnSpy).toHaveBeenCalled();
      const logOutput = warnSpy.mock.calls[0][0];
      expect(logOutput).toContain("Something went wrong");
    });
  });

  describe("error", () => {
    it("should log errors with console.error", () => {
      logger.error("Error message");

      expect(errorSpy).toHaveBeenCalled();
    });

    it("should format Error objects", () => {
      const error = new Error("Test error");
      logger.error("Operation failed", error);

      expect(errorSpy).toHaveBeenCalled();
      const logOutput = errorSpy.mock.calls[0][0];
      expect(logOutput).toContain("Test error");
    });

    it("should handle non-Error objects", () => {
      logger.error("Operation failed", "string error");

      expect(errorSpy).toHaveBeenCalled();
      const logOutput = errorSpy.mock.calls[0][0];
      expect(logOutput).toContain("string error");
    });
  });

  describe("child", () => {
    it("should create child logger with default context", () => {
      const childLogger = logger.child({ requestId: "req-123" });
      childLogger.info("Child log message");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("req-123");
    });

    it("should merge context from child and call", () => {
      const childLogger = logger.child({ requestId: "req-123" });
      childLogger.info("User action", { userId: "user-456" });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("req-123");
      expect(logOutput).toContain("user-456");
    });
  });
});

describe("createRequestLogger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create logger with request context", () => {
    const reqLogger = createRequestLogger("req-abc", "user-123", "org-456");
    reqLogger.info("Request processed");

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain("req-abc");
    expect(logOutput).toContain("user-123");
    expect(logOutput).toContain("org-456");
  });

  it("should work with only requestId", () => {
    const reqLogger = createRequestLogger("req-only");
    reqLogger.info("Anonymous request");

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain("req-only");
  });
});

describe("logApiRequest", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log successful requests as info", () => {
    logApiRequest("GET", "/api/users", 200, 50);

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain("GET");
    expect(logOutput).toContain("/api/users");
    expect(logOutput).toContain("200");
    expect(logOutput).toContain("50ms");
  });

  it("should log 4xx errors as warnings", () => {
    logApiRequest("POST", "/api/login", 401, 30);

    expect(warnSpy).toHaveBeenCalled();
  });

  it("should log 5xx errors as errors", () => {
    logApiRequest("GET", "/api/data", 500, 100);

    expect(errorSpy).toHaveBeenCalled();
  });

  it("should include additional context", () => {
    logApiRequest("GET", "/api/users", 200, 50, { userId: "user-123" });

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain("user-123");
  });
});
