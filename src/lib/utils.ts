import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function getGradeLabel(grade: number): string {
  if (grade === 0) return "Kindergarten";
  if (grade === 1) return "1st Grade";
  if (grade === 2) return "2nd Grade";
  if (grade === 3) return "3rd Grade";
  return `${grade}th Grade`;
}

export function getAgeGroup(grade: number): "early" | "elementary" | "middle" | "high" {
  if (grade <= 2) return "early";
  if (grade <= 5) return "elementary";
  if (grade <= 8) return "middle";
  return "high";
}

/**
 * HTML Entity Map for escaping user input in HTML contexts
 * Prevents XSS and HTML injection attacks
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML special characters to prevent XSS/injection attacks
 * Use this for any user-generated content that will be rendered in HTML
 * @param text - The string to escape
 * @returns HTML-safe string with special characters escaped
 */
export function escapeHtml(text: string | undefined | null): string {
  if (text == null) return "";
  return String(text).replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Escape for use in HTML attribute values (more restrictive)
 * @param text - The string to escape
 * @returns Attribute-safe string
 */
export function escapeHtmlAttr(text: string | undefined | null): string {
  if (text == null) return "";
  // Same as escapeHtml but also handles newlines and tabs
  return String(text)
    .replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
    .replace(/[\n\r\t]/g, " ");
}

/**
 * Allowed hosts for redirects (prevents open redirect attacks)
 * Add your production domains here
 */
const ALLOWED_REDIRECT_HOSTS = new Set([
  "kaelyns.academy",
  "www.kaelyns.academy",
  "localhost",
  "127.0.0.1",
]);

/**
 * Sanitize a callback URL to prevent open redirect attacks
 * Only allows:
 * - Relative URLs starting with /
 * - Absolute URLs to allowed hosts
 *
 * @param url - The URL to sanitize
 * @param defaultUrl - Fallback URL if the input is invalid (default: "/auth/redirect")
 * @returns A safe URL string
 */
export function sanitizeCallbackUrl(
  url: string | null | undefined,
  defaultUrl: string = "/auth/redirect"
): string {
  if (!url) return defaultUrl;

  // Trim and decode
  const trimmed = url.trim();

  // Block javascript: and data: URLs (XSS vectors)
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return defaultUrl;
  }

  // Allow relative URLs starting with /
  // But block protocol-relative URLs (//) which could redirect to external sites
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    // Also check for encoded characters that could bypass the check
    const decoded = decodeURIComponent(trimmed);
    if (decoded.startsWith("//")) {
      return defaultUrl;
    }
    return trimmed;
  }

  // For absolute URLs, validate the host
  try {
    const parsed = new URL(trimmed);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return defaultUrl;
    }

    // Check if host is in allowlist
    if (!ALLOWED_REDIRECT_HOSTS.has(parsed.hostname)) {
      console.warn(`[Security] Blocked redirect to external host: ${parsed.hostname}`);
      return defaultUrl;
    }

    // Return the full URL if host is allowed
    return trimmed;
  } catch {
    // Invalid URL, use default
    return defaultUrl;
  }
}

/**
 * Validate a callback URL (server-side version with stricter checks)
 * Returns null if the URL is not safe for redirects
 *
 * @param url - The URL to validate
 * @param requestHost - The host from the current request (for dynamic host matching)
 * @returns The validated URL or null if invalid
 */
export function validateRedirectUrl(
  url: string | null | undefined,
  requestHost?: string
): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return null;
  }

  // Allow relative URLs
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    const decoded = decodeURIComponent(trimmed);
    if (decoded.startsWith("//")) {
      return null;
    }
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    // Build allowed hosts dynamically
    const allowedHosts = new Set(ALLOWED_REDIRECT_HOSTS);
    if (requestHost) {
      allowedHosts.add(requestHost);
    }

    if (!allowedHosts.has(parsed.hostname)) {
      return null;
    }

    return trimmed;
  } catch {
    return null;
  }
}
