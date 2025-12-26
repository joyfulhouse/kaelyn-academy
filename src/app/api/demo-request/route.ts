import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { demoRequests } from "@/lib/db/schema";

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

    // TODO: Send email notification to sales team
    // TODO: Send confirmation email to requester
    // TODO: Create CRM lead entry

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
