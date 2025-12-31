/**
 * Tests for lib/utils.ts
 *
 * Comprehensive tests for utility functions including:
 * - Class name merging
 * - Date/time formatting
 * - String utilities
 * - Security sanitization functions
 */
import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatTime,
  slugify,
  getGradeLabel,
  getAgeGroup,
  escapeHtml,
  escapeHtmlAttr,
  sanitizeCallbackUrl,
  validateRedirectUrl,
} from "./utils";

describe("cn (class name utility)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
  });

  it("should merge Tailwind classes correctly", () => {
    // twMerge should dedupe conflicting utilities
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle arrays and objects", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("", null, undefined)).toBe("");
  });
});

describe("formatDate", () => {
  it("should format Date objects", () => {
    // Use UTC date to avoid timezone issues in tests
    const date = new Date("2025-01-15T12:00:00Z");
    const result = formatDate(date);
    expect(result).toContain("January");
    expect(result).toContain("2025");
  });

  it("should format date strings", () => {
    // Use full ISO string to avoid timezone parsing issues
    const result = formatDate("2024-12-25T12:00:00Z");
    expect(result).toContain("December");
    expect(result).toContain("2024");
  });

  it("should handle ISO date strings", () => {
    const result = formatDate("2025-07-04T12:00:00Z");
    expect(result).toContain("July");
    expect(result).toContain("2025");
  });

  it("should return a formatted string with month, day, and year", () => {
    const result = formatDate(new Date(2024, 5, 15)); // June 15, 2024
    expect(result).toBe("June 15, 2024");
  });
});

describe("formatTime", () => {
  it("should format seconds only", () => {
    expect(formatTime(45)).toBe("45s");
    expect(formatTime(0)).toBe("0s");
  });

  it("should format minutes and seconds", () => {
    expect(formatTime(90)).toBe("1m 30s");
    expect(formatTime(120)).toBe("2m 0s");
    expect(formatTime(305)).toBe("5m 5s");
  });

  it("should format hours and minutes", () => {
    expect(formatTime(3600)).toBe("1h 0m");
    expect(formatTime(3660)).toBe("1h 1m");
    expect(formatTime(7200)).toBe("2h 0m");
    expect(formatTime(5400)).toBe("1h 30m");
  });
});

describe("slugify", () => {
  it("should convert to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should replace spaces with hyphens", () => {
    expect(slugify("foo bar baz")).toBe("foo-bar-baz");
  });

  it("should remove special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("What's up?")).toBe("whats-up");
  });

  it("should collapse multiple hyphens", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
    expect(slugify("foo---bar")).toBe("foo-bar");
  });

  it("should handle edge cases", () => {
    expect(slugify("")).toBe("");
    // Spaces become hyphen, and after trim it's a single hyphen
    expect(slugify("   ")).toBe("-");
    // Multiple hyphens collapse to single hyphen
    expect(slugify("---")).toBe("-");
  });
});

describe("getGradeLabel", () => {
  it("should return Kindergarten for grade 0", () => {
    expect(getGradeLabel(0)).toBe("Kindergarten");
  });

  it("should return 1st Grade for grade 1", () => {
    expect(getGradeLabel(1)).toBe("1st Grade");
  });

  it("should return 2nd Grade for grade 2", () => {
    expect(getGradeLabel(2)).toBe("2nd Grade");
  });

  it("should return 3rd Grade for grade 3", () => {
    expect(getGradeLabel(3)).toBe("3rd Grade");
  });

  it("should return nth Grade for grades 4+", () => {
    expect(getGradeLabel(4)).toBe("4th Grade");
    expect(getGradeLabel(5)).toBe("5th Grade");
    expect(getGradeLabel(12)).toBe("12th Grade");
  });
});

describe("getAgeGroup", () => {
  it("should return early for grades 0-2", () => {
    expect(getAgeGroup(0)).toBe("early");
    expect(getAgeGroup(1)).toBe("early");
    expect(getAgeGroup(2)).toBe("early");
  });

  it("should return elementary for grades 3-5", () => {
    expect(getAgeGroup(3)).toBe("elementary");
    expect(getAgeGroup(4)).toBe("elementary");
    expect(getAgeGroup(5)).toBe("elementary");
  });

  it("should return middle for grades 6-8", () => {
    expect(getAgeGroup(6)).toBe("middle");
    expect(getAgeGroup(7)).toBe("middle");
    expect(getAgeGroup(8)).toBe("middle");
  });

  it("should return high for grades 9+", () => {
    expect(getAgeGroup(9)).toBe("high");
    expect(getAgeGroup(10)).toBe("high");
    expect(getAgeGroup(11)).toBe("high");
    expect(getAgeGroup(12)).toBe("high");
  });
});

describe("escapeHtml", () => {
  it("should escape HTML special characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml('"')).toBe("&quot;");
    expect(escapeHtml("'")).toBe("&#39;");
  });

  it("should handle null and undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  it("should preserve safe text", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
    expect(escapeHtml("12345")).toBe("12345");
  });

  it("should escape XSS attack vectors", () => {
    // = is also escaped as &#x3D;
    expect(escapeHtml('<img src="x" onerror="alert(1)">')).toBe(
      "&lt;img src&#x3D;&quot;x&quot; onerror&#x3D;&quot;alert(1)&quot;&gt;"
    );
    expect(escapeHtml("javascript:alert(1)")).toBe("javascript:alert(1)");
    expect(escapeHtml("`${code}`")).toBe("&#x60;${code}&#x60;");
  });

  it("should escape all special characters", () => {
    const input = '&<>"\'/`=';
    const expected = "&amp;&lt;&gt;&quot;&#39;&#x2F;&#x60;&#x3D;";
    expect(escapeHtml(input)).toBe(expected);
  });
});

describe("escapeHtmlAttr", () => {
  it("should escape HTML special characters", () => {
    expect(escapeHtmlAttr("<script>")).toBe("&lt;script&gt;");
  });

  it("should replace newlines and tabs with spaces", () => {
    expect(escapeHtmlAttr("line1\nline2")).toBe("line1 line2");
    expect(escapeHtmlAttr("col1\tcol2")).toBe("col1 col2");
    expect(escapeHtmlAttr("line1\r\nline2")).toBe("line1  line2");
  });

  it("should handle null and undefined", () => {
    expect(escapeHtmlAttr(null)).toBe("");
    expect(escapeHtmlAttr(undefined)).toBe("");
  });
});

describe("sanitizeCallbackUrl", () => {
  it("should allow relative URLs starting with /", () => {
    expect(sanitizeCallbackUrl("/dashboard")).toBe("/dashboard");
    expect(sanitizeCallbackUrl("/auth/callback")).toBe("/auth/callback");
    expect(sanitizeCallbackUrl("/")).toBe("/");
  });

  it("should return default for null/undefined", () => {
    expect(sanitizeCallbackUrl(null)).toBe("/auth/redirect");
    expect(sanitizeCallbackUrl(undefined)).toBe("/auth/redirect");
    expect(sanitizeCallbackUrl("")).toBe("/auth/redirect");
  });

  it("should use custom default when provided", () => {
    expect(sanitizeCallbackUrl(null, "/custom")).toBe("/custom");
  });

  it("should block javascript: URLs", () => {
    expect(sanitizeCallbackUrl("javascript:alert(1)")).toBe("/auth/redirect");
    expect(sanitizeCallbackUrl("JAVASCRIPT:alert(1)")).toBe("/auth/redirect");
  });

  it("should block data: URLs", () => {
    expect(sanitizeCallbackUrl("data:text/html,<script>")).toBe("/auth/redirect");
  });

  it("should block protocol-relative URLs", () => {
    expect(sanitizeCallbackUrl("//evil.com")).toBe("/auth/redirect");
    expect(sanitizeCallbackUrl("//evil.com/path")).toBe("/auth/redirect");
  });

  it("should block encoded protocol-relative URLs", () => {
    expect(sanitizeCallbackUrl("/%2F/evil.com")).toBe("/auth/redirect");
  });

  it("should allow allowed hosts", () => {
    expect(sanitizeCallbackUrl("https://kaelyns.academy/path")).toBe(
      "https://kaelyns.academy/path"
    );
    expect(sanitizeCallbackUrl("https://localhost/path")).toBe(
      "https://localhost/path"
    );
  });

  it("should block external hosts", () => {
    expect(sanitizeCallbackUrl("https://evil.com/path")).toBe("/auth/redirect");
    expect(sanitizeCallbackUrl("https://google.com")).toBe("/auth/redirect");
  });

  it("should block non-http protocols", () => {
    expect(sanitizeCallbackUrl("ftp://kaelyns.academy")).toBe("/auth/redirect");
    expect(sanitizeCallbackUrl("file:///etc/passwd")).toBe("/auth/redirect");
  });
});

describe("validateRedirectUrl", () => {
  it("should return valid relative URLs", () => {
    expect(validateRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(validateRedirectUrl("/")).toBe("/");
  });

  it("should return null for invalid inputs", () => {
    expect(validateRedirectUrl(null)).toBe(null);
    expect(validateRedirectUrl(undefined)).toBe(null);
    expect(validateRedirectUrl("")).toBe(null);
  });

  it("should block dangerous protocols", () => {
    expect(validateRedirectUrl("javascript:alert(1)")).toBe(null);
    expect(validateRedirectUrl("data:text/html,foo")).toBe(null);
    expect(validateRedirectUrl("vbscript:alert(1)")).toBe(null);
  });

  it("should block protocol-relative URLs", () => {
    expect(validateRedirectUrl("//evil.com")).toBe(null);
    expect(validateRedirectUrl("/%2F/evil.com")).toBe(null);
  });

  it("should allow allowed hosts", () => {
    expect(validateRedirectUrl("https://kaelyns.academy")).toBe(
      "https://kaelyns.academy"
    );
    expect(validateRedirectUrl("http://localhost/path")).toBe(
      "http://localhost/path"
    );
  });

  it("should block external hosts", () => {
    expect(validateRedirectUrl("https://evil.com")).toBe(null);
  });

  it("should include requestHost in allowed hosts", () => {
    expect(
      validateRedirectUrl("https://custom.example.com", "custom.example.com")
    ).toBe("https://custom.example.com");
  });

  it("should block non-http protocols", () => {
    expect(validateRedirectUrl("ftp://kaelyns.academy")).toBe(null);
  });
});
