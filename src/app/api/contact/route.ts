import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { headers } from "next/headers";
import { Resend } from "resend";
import { escapeHtml, escapeHtmlAttr } from "@/lib/utils";
import { checkFormRateLimit } from "@/lib/rate-limit";
import { validateBodySize, BODY_SIZE_PRESETS } from "@/lib/api/body-size";
import { handleApiError } from "@/lib/api/error-handler";

// Initialize Resend client if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  role: z.string().optional(),
  inquiryType: z.string(),
  subject: z.string().min(5),
  message: z.string().min(20),
});

export async function POST(request: NextRequest) {
  // SECURITY: Rate limit form submissions to prevent spam
  const rateLimitResult = await checkFormRateLimit(request);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  // SECURITY: Validate request body size to prevent DoS
  const bodySizeResult = await validateBodySize(request, BODY_SIZE_PRESETS.form);
  if (!bodySizeResult.success) {
    return bodySizeResult.response;
  }

  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // Get request metadata
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const referer = headersList.get("referer") || undefined;

    // Extract UTM parameters from referer if present
    let utmSource: string | undefined;
    let utmMedium: string | undefined;
    let utmCampaign: string | undefined;

    if (referer) {
      try {
        const url = new URL(referer);
        utmSource = url.searchParams.get("utm_source") || undefined;
        utmMedium = url.searchParams.get("utm_medium") || undefined;
        utmCampaign = url.searchParams.get("utm_campaign") || undefined;
      } catch {
        // Invalid URL, ignore
      }
    }

    // Insert contact submission
    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        organization: data.organization || null,
        role: data.role || null,
        inquiryType: data.inquiryType,
        subject: data.subject,
        message: data.message,
        metadata: {
          userAgent,
          referrer: referer,
          utmSource,
          utmMedium,
          utmCampaign,
        },
        status: "new",
      })
      .returning({ id: contactSubmissions.id });

    // Send email notification to support team if Resend is configured
    if (resend) {
      try {
        // Notification to support team
        // SECURITY: All user input is HTML-escaped to prevent injection
        await resend.emails.send({
          from: "Kaelyn's Academy <noreply@kaelyns.academy>",
          to: ["contact@kaelyns.academy"],
          replyTo: data.email,
          subject: `[${escapeHtmlAttr(data.inquiryType).toUpperCase()}] ${escapeHtmlAttr(data.subject)}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.name)}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtmlAttr(data.email)}">${escapeHtml(data.email)}</a></td></tr>
              ${data.phone ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.phone)}</td></tr>` : ""}
              ${data.organization ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Organization:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.organization)}</td></tr>` : ""}
              ${data.role ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Role:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.role)}</td></tr>` : ""}
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Inquiry Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.inquiryType)}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(data.subject)}</td></tr>
            </table>
            <h3 style="margin-top: 24px;">Message:</h3>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              Submission ID: ${submission.id}<br />
              Submitted at: ${new Date().toISOString()}
            </p>
          `,
        });

        // Confirmation email to submitter
        // SECURITY: User input is HTML-escaped
        await resend.emails.send({
          from: "Kaelyn's Academy <noreply@kaelyns.academy>",
          to: [data.email],
          subject: "We received your message - Kaelyn's Academy",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Thank you for contacting us!</h1>
              <p>Hi ${escapeHtml(data.name)},</p>
              <p>We've received your message and will get back to you within 24 hours.</p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0;"><strong>Your inquiry:</strong> ${escapeHtml(data.subject)}</p>
              </div>
              <p>In the meantime, feel free to explore our <a href="https://kaelyns.academy">learning platform</a>.</p>
              <p>Best regards,<br />The Kaelyn's Academy Team</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #666; font-size: 12px;">
                This is an automated response. Please don't reply to this email directly.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the request if email fails - submission is already saved
      }
    } else {
      console.log("Resend not configured - skipping email notification");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
        id: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    // SECURITY: Use centralized error handler that sanitizes responses in production
    return handleApiError(error, "contact form submission");
  }
}
