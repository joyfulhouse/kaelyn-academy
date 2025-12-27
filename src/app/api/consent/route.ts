import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, learners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for COPPA consent submission
const consentSchema = z.object({
  parentName: z.string().min(1),
  parentEmail: z.string().email(),
  childName: z.string().min(1),
  childBirthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  relationship: z.enum(["parent", "legal_guardian", "foster_parent"]),
  agreements: z.object({
    dataCollection: z.literal(true),
    dataUse: z.literal(true),
    communication: z.literal(true),
    termsOfService: z.literal(true),
    privacyPolicy: z.literal(true),
  }),
  signature: z.string().min(1),
  signatureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  token: z.string().optional(),
});

// POST /api/consent - Submit COPPA consent
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = consentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate child's age to verify COPPA applies
    const birthDate = new Date(data.childBirthdate);
    const today = new Date();
    const age = Math.floor(
      (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    // Get user's organization
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate grade level from birthdate (approximate)
    const gradeLevel = calculateGradeLevel(birthDate);

    // Start transaction to update consent and create learner
    await db.transaction(async (tx) => {
      // Update user's consent status
      await tx
        .update(users)
        .set({
          parentalConsentGiven: true,
          parentalConsentDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      // Create or update learner profile
      const existingLearner = await tx.query.learners.findFirst({
        where: eq(learners.userId, session.user.id),
      });

      if (!existingLearner) {
        // Create new learner profile for the child
        await tx.insert(learners).values({
          userId: session.user.id,
          organizationId: user.organizationId ?? generateDefaultOrgId(),
          name: data.childName,
          dateOfBirth: birthDate,
          gradeLevel,
          preferences: {
            learningStyle: "visual",
          },
          parentalControls: {
            screenTimeLimit: 60,
            allowedSubjects: ["math", "reading", "science", "history"],
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Consent recorded successfully",
      childAge: age,
      gradeLevel,
    });
  } catch (error) {
    console.error("Error processing consent:", error);
    return NextResponse.json(
      { error: "Failed to process consent" },
      { status: 500 }
    );
  }
}

// GET /api/consent - Check if user has given consent
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        parentalConsentGiven: true,
        parentalConsentDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      consentGiven: user.parentalConsentGiven ?? false,
      consentDate: user.parentalConsentDate?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Error checking consent:", error);
    return NextResponse.json(
      { error: "Failed to check consent status" },
      { status: 500 }
    );
  }
}

// Helper to calculate grade level from birthdate
function calculateGradeLevel(birthDate: Date): number {
  const today = new Date();
  const age = Math.floor(
    (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  // Approximate grade level based on age
  // Age 5 = K (0), Age 6 = 1st, etc.
  if (age < 5) return 0; // Pre-K, default to K
  if (age > 17) return 12; // Cap at 12th grade
  return Math.min(12, Math.max(0, age - 5));
}

// Generate a default organization ID for individual users
function generateDefaultOrgId(): string {
  // This should ideally be a configured default org for individuals
  // For now, return a placeholder that will be handled elsewhere
  return "00000000-0000-0000-0000-000000000001";
}
