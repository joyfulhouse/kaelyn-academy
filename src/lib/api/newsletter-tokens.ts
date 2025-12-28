/**
 * Newsletter Token Utilities
 *
 * SECURITY: Generates and validates signed tokens for newsletter operations
 * to prevent CSRF attacks on unsubscribe endpoints.
 *
 * Token structure: base64(email):timestamp:signature
 * - email: The subscriber's email (base64 encoded)
 * - timestamp: When the token was created (Unix ms)
 * - signature: HMAC-SHA256 of email:timestamp using secret
 */

import { createHmac } from "crypto";

// Secret for signing tokens - falls back to a random value in dev
const TOKEN_SECRET =
  process.env.NEWSLETTER_TOKEN_SECRET ||
  process.env.AUTH_SECRET ||
  "dev-newsletter-token-secret-do-not-use-in-production";

// Token expiry time (7 days)
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a signed unsubscribe token for an email
 *
 * @param email - The subscriber's email
 * @returns Signed token string
 */
export function generateUnsubscribeToken(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  const timestamp = Date.now();
  const emailBase64 = Buffer.from(normalizedEmail).toString("base64url");

  const dataToSign = `${emailBase64}:${timestamp}`;
  const signature = createHmac("sha256", TOKEN_SECRET)
    .update(dataToSign)
    .digest("base64url");

  return `${emailBase64}:${timestamp}:${signature}`;
}

/**
 * Validate and extract email from an unsubscribe token
 *
 * @param token - The token to validate
 * @returns The email if valid, null if invalid or expired
 */
export function validateUnsubscribeToken(
  token: string
): { email: string; valid: true } | { error: string; valid: false } {
  if (!token) {
    return { error: "Token is required", valid: false };
  }

  const parts = token.split(":");
  if (parts.length !== 3) {
    return { error: "Invalid token format", valid: false };
  }

  const [emailBase64, timestampStr, providedSignature] = parts;

  // Verify timestamp
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { error: "Invalid token timestamp", valid: false };
  }

  // Check expiry
  const now = Date.now();
  if (now - timestamp > TOKEN_EXPIRY_MS) {
    return { error: "Token has expired", valid: false };
  }

  // Verify signature
  const dataToSign = `${emailBase64}:${timestamp}`;
  const expectedSignature = createHmac("sha256", TOKEN_SECRET)
    .update(dataToSign)
    .digest("base64url");

  if (providedSignature !== expectedSignature) {
    return { error: "Invalid token signature", valid: false };
  }

  // Decode email
  try {
    const email = Buffer.from(emailBase64, "base64url").toString("utf8");
    return { email, valid: true };
  } catch {
    return { error: "Invalid token encoding", valid: false };
  }
}

/**
 * Generate a full unsubscribe URL
 *
 * @param email - The subscriber's email
 * @param baseUrl - The base URL of the application
 * @returns Full unsubscribe URL
 */
export function generateUnsubscribeUrl(email: string, baseUrl: string): string {
  const token = generateUnsubscribeToken(email);
  return `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
