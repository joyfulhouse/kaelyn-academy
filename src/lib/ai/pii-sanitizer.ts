/**
 * PII Sanitization for AI Requests
 *
 * COPPA and privacy compliance: Removes or pseudonymizes personally identifiable
 * information before sending data to external AI providers.
 *
 * This helps ensure:
 * 1. Children's names aren't stored in third-party AI training data
 * 2. No PII leaks to external services
 * 3. Compliance with COPPA, GDPR, and school privacy policies
 */

export interface PIISanitizerOptions {
  /** Replace real names with pseudonyms (default: true) */
  pseudonymizeNames?: boolean;
  /** Generic label for student (default: "Student") */
  studentLabel?: string;
  /** Whether to completely remove names instead of pseudonymizing (default: false) */
  removeNames?: boolean;
}

const defaultOptions: Required<PIISanitizerOptions> = {
  pseudonymizeNames: true,
  studentLabel: "Student",
  removeNames: false,
};

/**
 * Patterns for detecting PII in text
 */
const PII_PATTERNS = {
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  // Phone numbers (various formats)
  phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  // Social Security Numbers
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  // Dates of birth (common formats)
  dob: /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](\d{2}|\d{4})\b/g,
  // Street addresses (basic pattern)
  address: /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|way|boulevard|blvd|court|ct)\b/gi,
};

/**
 * Sanitize a learner name for use in AI prompts
 *
 * @param name - The learner's real name
 * @param options - Sanitization options
 * @returns Sanitized/pseudonymized name
 */
export function sanitizeLearnerName(
  name: string | null | undefined,
  options: PIISanitizerOptions = {}
): string {
  const opts = { ...defaultOptions, ...options };

  if (!name) {
    return opts.studentLabel;
  }

  if (opts.removeNames) {
    return opts.studentLabel;
  }

  if (opts.pseudonymizeNames) {
    // Use first letter only to give AI context about gender/format
    // while not revealing actual name
    const firstLetter = name.trim().charAt(0).toUpperCase();
    return `${opts.studentLabel} ${firstLetter}.`;
  }

  return name;
}

/**
 * Remove PII patterns from text content
 *
 * @param text - Text that may contain PII
 * @returns Text with PII redacted
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  // Replace email addresses
  sanitized = sanitized.replace(PII_PATTERNS.email, "[EMAIL REDACTED]");

  // Replace phone numbers
  sanitized = sanitized.replace(PII_PATTERNS.phone, "[PHONE REDACTED]");

  // Replace SSNs
  sanitized = sanitized.replace(PII_PATTERNS.ssn, "[SSN REDACTED]");

  // Replace dates that look like DOB
  sanitized = sanitized.replace(PII_PATTERNS.dob, "[DATE REDACTED]");

  // Replace addresses
  sanitized = sanitized.replace(PII_PATTERNS.address, "[ADDRESS REDACTED]");

  return sanitized;
}

/**
 * Sanitize a tutoring context for AI requests
 */
export interface SanitizedTutoringContext {
  learnerId: string; // Keep for tracking but not PII
  displayName: string; // Pseudonymized name
  gradeLevel: number;
  subject: string;
  topic: string;
  conceptName: string;
  previousMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  masteryLevel?: number;
}

/**
 * Create a sanitized version of tutoring context
 *
 * @param context - Original tutoring context with potentially identifying info
 * @param options - Sanitization options
 * @returns Sanitized context safe for AI requests
 */
export function sanitizeTutoringContext<T extends {
  learnerId?: string;
  learnerName?: string;
  gradeLevel: number;
  subject: string;
  topic: string;
  conceptName: string;
  previousMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  masteryLevel?: number;
}>(context: T, options: PIISanitizerOptions = {}): SanitizedTutoringContext {
  const sanitizedMessages = context.previousMessages?.map((msg) => ({
    role: msg.role,
    content: sanitizeText(msg.content),
  }));

  return {
    learnerId: context.learnerId ?? "anonymous",
    displayName: sanitizeLearnerName(context.learnerName, options),
    gradeLevel: context.gradeLevel,
    subject: context.subject,
    topic: context.topic,
    conceptName: context.conceptName,
    previousMessages: sanitizedMessages,
    masteryLevel: context.masteryLevel,
  };
}

/**
 * Check if text contains potential PII
 * Useful for logging/monitoring
 *
 * @param text - Text to check
 * @returns True if potential PII detected
 */
export function containsPotentialPII(text: string): boolean {
  return Object.values(PII_PATTERNS).some((pattern) => {
    pattern.lastIndex = 0; // Reset regex state
    return pattern.test(text);
  });
}

/**
 * Log warning if PII is detected in AI request
 * Call this before sending to AI to catch issues
 */
export function warnIfPIIDetected(
  data: Record<string, unknown>,
  context: string
): void {
  const json = JSON.stringify(data);
  if (containsPotentialPII(json)) {
    console.warn(
      `[PII Warning] Potential PII detected in AI request (${context}). ` +
      "Review data being sent to external AI providers."
    );
  }
}
