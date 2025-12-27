import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { demoRequests } from "@/lib/db/schema";
import { Resend } from "resend";

// Initialize Resend client if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const demoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  schoolName: z.string().min(2),
  schoolDistrict: z.string().optional(),
  schoolType: z.string(),
  state: z.string(),
  jobTitle: z.string().optional(),
  estimatedStudents: z.string(),
  gradeRange: z.string(),
  timeline: z.string(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = demoSchema.parse(body);

    // Insert demo request
    const [submission] = await db
      .insert(demoRequests)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        schoolName: data.schoolName,
        schoolDistrict: data.schoolDistrict || null,
        schoolType: data.schoolType,
        state: data.state,
        country: "United States",
        jobTitle: data.jobTitle || null,
        estimatedStudents: data.estimatedStudents,
        gradeRange: data.gradeRange,
        timeline: data.timeline,
        message: data.message || null,
        status: "new",
      })
      .returning({ id: demoRequests.id });

    // Send email notification to sales team if Resend is configured
    if (resend) {
      const fullName = `${data.firstName} ${data.lastName}`;
      try {
        // Notification to sales team
        await resend.emails.send({
          from: "Kaelyn's Academy <noreply@kaelyns.academy>",
          to: ["schools@kaelyns.academy"],
          replyTo: data.email,
          subject: `[DEMO REQUEST] ${data.schoolName} - ${data.estimatedStudents} students`,
          html: `
            <h2>New Demo Request</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr style="background: #f5f5f5;"><td colspan="2" style="padding: 12px; font-weight: bold;">Contact Information</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee; width: 150px;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${fullName}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
              ${data.phone ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>` : ""}
              ${data.jobTitle ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Job Title:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.jobTitle}</td></tr>` : ""}

              <tr style="background: #f5f5f5;"><td colspan="2" style="padding: 12px; font-weight: bold;">School Information</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>School:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.schoolName}</td></tr>
              ${data.schoolDistrict ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>District:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.schoolDistrict}</td></tr>` : ""}
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.schoolType}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>State:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.state}</td></tr>

              <tr style="background: #f5f5f5;"><td colspan="2" style="padding: 12px; font-weight: bold;">Requirements</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Students:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.estimatedStudents}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Grades:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.gradeRange}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Timeline:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.timeline}</td></tr>
            </table>
            ${data.message ? `
              <h3 style="margin-top: 24px;">Additional Notes:</h3>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.message}</div>
            ` : ""}
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              Request ID: ${submission.id}<br />
              Submitted at: ${new Date().toISOString()}
            </p>
          `,
        });

        // Confirmation email to requester
        await resend.emails.send({
          from: "Kaelyn's Academy <noreply@kaelyns.academy>",
          to: [data.email],
          subject: "Demo Request Received - Kaelyn's Academy",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Thank you for your interest!</h1>
              <p>Hi ${data.firstName},</p>
              <p>We've received your demo request for <strong>${data.schoolName}</strong>.</p>
              <p>A member of our team will contact you within one business day to schedule your personalized demonstration of Kaelyn's Academy.</p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0;"><strong>What to expect:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>A walkthrough of our K-12 curriculum</li>
                  <li>Live demonstration of our 3D interactive lessons</li>
                  <li>Discussion of your specific needs for ${data.gradeRange}</li>
                  <li>Pricing and implementation options</li>
                </ul>
              </div>
              <p>In the meantime, feel free to explore our <a href="https://kaelyns.academy/schools">school solutions</a>.</p>
              <p>Best regards,<br />The Kaelyn's Academy Team</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #666; font-size: 12px;">
                This is an automated response. If you have urgent questions, please reply to this email.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send demo request emails:", emailError);
        // Don't fail the request if email fails - submission is already saved
      }
    } else {
      console.log("Resend not configured - skipping email notification");
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your demo request has been received. We'll contact you within one business day!",
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

    console.error("Demo request error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit demo request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
