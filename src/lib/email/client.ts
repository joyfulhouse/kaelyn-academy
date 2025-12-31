/**
 * Email Client (Resend)
 *
 * Provides a type-safe wrapper around the Resend API for sending emails.
 * All emails go through this client for consistent error handling and logging.
 */

import { Resend } from "resend";
import { logger } from "@/lib/logging";

// Initialize Resend client (lazy to avoid errors when API key is not set)
let _resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not configured - emails will not be sent");
    return null;
  }

  if (!_resendClient) {
    _resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return _resendClient;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via Resend
 *
 * @example
 * const result = await sendEmail({
 *   to: "parent@example.com",
 *   subject: "Weekly Progress Report",
 *   html: "<h1>Your child made great progress!</h1>",
 * });
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  const client = getResendClient();

  if (!client) {
    logger.warn("Email not sent - Resend client not available", {
      to: options.to,
      subject: options.subject,
    });
    return { success: false, error: "Email client not configured" };
  }

  const from = options.from || "Kaelyn's Academy <noreply@kaelyns.academy>";

  try {
    const { data, error } = await client.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      logger.error("Failed to send email", {
        error: error.message,
        to: options.to,
        subject: options.subject,
      });
      return { success: false, error: error.message };
    }

    logger.info("Email sent successfully", {
      messageId: data?.id,
      to: options.to,
      subject: options.subject,
    });

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error("Email sending threw exception", {
      error: errorMessage,
      to: options.to,
      subject: options.subject,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send multiple emails in batch
 * Note: Resend has rate limits, so this should be used carefully
 */
export async function sendBatchEmails(
  emails: EmailOptions[]
): Promise<SendEmailResult[]> {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { success: false, error: result.reason?.message || "Unknown error" }
  );
}
