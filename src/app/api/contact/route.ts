import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { headers } from "next/headers";

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

    // TODO: Send email notification to support team
    // TODO: Send confirmation email to submitter

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
        id: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit contact form. Please try again later.",
      },
      { status: 500 }
    );
  }
}
