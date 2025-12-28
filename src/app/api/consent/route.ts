import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, learners, parentalConsentRecords } from "@/lib/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils";
import { checkConsentRateLimit, checkFormRateLimit } from "@/lib/rate-limit";

// Initialize Resend if configured
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// SECURITY: Constants for verification
const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_CODE_EXPIRY_MINUTES = 30;
const MAX_VERIFICATION_ATTEMPTS = 5;

// Security questions for knowledge-based verification (email_plus method)
const SECURITY_QUESTIONS = [
  "What city was your first child born in?",
  "What was the name of your child's first school?",
  "What is your mother's maiden name?",
  "What was the make of your first car?",
  "What street did you live on in third grade?",
] as const;

/**
 * Generate a cryptographically secure verification code
 */
function generateVerificationCode(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(VERIFICATION_CODE_LENGTH, "0");
}

/**
 * Hash a security answer for storage (case-insensitive)
 */
function hashSecurityAnswer(answer: string): string {
  const normalized = answer.toLowerCase().trim();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Verify a security answer against stored hash
 */
function verifySecurityAnswer(answer: string, hash: string): boolean {
  const answerHash = hashSecurityAnswer(answer);
  // Timing-safe comparison
  if (answerHash.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < answerHash.length; i++) {
    result |= answerHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

// Schema for initial consent submission (Step 1)
const initiateConsentSchema = z.object({
  parentName: z.string().min(2).max(255),
  parentEmail: z.string().email().max(255),
  childName: z.string().min(1).max(255),
  childBirthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  relationship: z.enum(["parent", "legal_guardian", "foster_parent"]),
  agreements: z.object({
    dataCollection: z.literal(true),
    dataUse: z.literal(true),
    communication: z.literal(true),
    termsOfService: z.literal(true),
    privacyPolicy: z.literal(true),
  }),
  signature: z.string().min(2).max(255),
  securityQuestion: z.string().min(1),
  securityAnswer: z.string().min(1).max(255),
});

// Schema for verification (Step 2)
const verifyConsentSchema = z.object({
  token: z.string().min(1),
  verificationCode: z.string().length(VERIFICATION_CODE_LENGTH),
  securityAnswer: z.string().min(1).max(255),
});

/**
 * POST /api/consent - Initiate COPPA consent (Step 1)
 *
 * This implements the "email_plus" verification method:
 * 1. Parent submits consent form with agreements
 * 2. System sends verification code to parent's email
 * 3. Parent must verify via /api/consent/verify
 */
export async function POST(request: NextRequest) {
  // SECURITY: Rate limit consent initiation requests
  const rateLimitResult = await checkFormRateLimit(request);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = initiateConsentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get request metadata for audit trail
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Validate child's age (COPPA applies to under 13)
    const birthDate = new Date(data.childBirthdate);
    const today = new Date();
    const age = Math.floor(
      (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    if (age >= 13) {
      return NextResponse.json(
        { error: "COPPA consent is only required for children under 13" },
        { status: 400 }
      );
    }

    // Generate verification token and code
    const verificationToken = randomBytes(32).toString("hex");
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
    );

    // Hash the security answer before storing
    const securityAnswerHash = hashSecurityAnswer(data.securityAnswer);

    // Create consent record in pending state
    const [consentRecord] = await db
      .insert(parentalConsentRecords)
      .values({
        parentUserId: session.user.id,
        verificationMethod: "email_plus",
        status: "pending",
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        relationship: data.relationship,
        childName: data.childName,
        childBirthdate: birthDate,
        verificationToken,
        verificationCode,
        verificationCodeExpires: codeExpires,
        verificationAttempts: [],
        securityQuestion: data.securityQuestion,
        securityAnswerHash,
        agreements: {
          ...data.agreements,
          timestamp: new Date().toISOString(),
        },
        signatureText: data.signature,
        signatureTimestamp: new Date(),
        signatureIpAddress: ipAddress,
        signatureUserAgent: userAgent,
      })
      .returning({ id: parentalConsentRecords.id });

    // Send verification email
    if (resend) {
      try {
        await resend.emails.send({
          from: "Kaelyn's Academy <noreply@kaelyns.academy>",
          to: [data.parentEmail],
          subject: "Verify Your Parental Consent - Kaelyn's Academy",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #10b981;">Verify Your Parental Consent</h1>
              <p>Hi ${escapeHtml(data.parentName)},</p>
              <p>You've submitted a parental consent form for <strong>${escapeHtml(data.childName)}</strong> on Kaelyn's Academy.</p>

              <div style="background: #f5f5f5; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #10b981;">${verificationCode}</p>
                <p style="margin: 16px 0 0 0; font-size: 12px; color: #999;">This code expires in ${VERIFICATION_CODE_EXPIRY_MINUTES} minutes</p>
              </div>

              <p>To complete the verification process:</p>
              <ol style="color: #666;">
                <li>Return to the consent verification page</li>
                <li>Enter the verification code above</li>
                <li>Answer your security question</li>
              </ol>

              <p>Or click the button below to verify directly:</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/consent/verify?token=${verificationToken}"
                   style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Verify Consent
                </a>
              </div>

              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Important:</strong> If you did not request this consent, please ignore this email.
                  Someone may have entered your email address by mistake.
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #666; font-size: 12px;">
                This email was sent as part of COPPA compliance. Under the Children's Online Privacy Protection Act,
                we require verifiable parental consent before collecting information from children under 13.
              </p>
              <p style="color: #666; font-size: 12px;">
                Consent Record ID: ${consentRecord.id}
              </p>
            </div>
          `,
        });

        // Update status to email_sent
        await db
          .update(parentalConsentRecords)
          .set({ status: "email_sent", updatedAt: new Date() })
          .where(eq(parentalConsentRecords.id, consentRecord.id));
      } catch (emailError) {
        console.error("Failed to send consent verification email:", emailError);
        // Don't fail the request, but inform the user
        return NextResponse.json({
          success: true,
          requiresVerification: true,
          token: verificationToken,
          message: "Consent recorded. Please check your email for verification code.",
          emailError: "Failed to send verification email. Please try again.",
        });
      }
    } else {
      // Development mode without email
      console.log("Verification code (dev mode):", verificationCode);
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      token: verificationToken,
      message: "Verification email sent. Please check your inbox.",
      // Only include code in development for testing
      ...(process.env.NODE_ENV === "development" && {
        devVerificationCode: verificationCode,
      }),
    });
  } catch (error) {
    console.error("Error initiating consent:", error);
    return NextResponse.json(
      { error: "Failed to process consent" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/consent - Verify consent (Step 2 - Email Plus verification)
 *
 * Parent must provide:
 * 1. Verification code from email
 * 2. Answer to security question
 */
export async function PUT(request: NextRequest) {
  // SECURITY: Strict rate limiting for verification attempts to prevent brute force
  const rateLimitResult = await checkConsentRateLimit(request);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifyConsentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { token, verificationCode, securityAnswer } = parsed.data;

    // Get request metadata
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Find pending consent record
    const consentRecord = await db.query.parentalConsentRecords.findFirst({
      where: and(
        eq(parentalConsentRecords.verificationToken, token),
        eq(parentalConsentRecords.parentUserId, session.user.id)
      ),
    });

    if (!consentRecord) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (consentRecord.status === "active") {
      return NextResponse.json(
        { error: "Consent already verified" },
        { status: 400 }
      );
    }

    // Check if revoked
    if (consentRecord.status === "revoked") {
      return NextResponse.json(
        { error: "Consent has been revoked" },
        { status: 400 }
      );
    }

    // Check verification attempts
    const attempts = consentRecord.verificationAttempts || [];
    if (attempts.length >= MAX_VERIFICATION_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please request a new consent." },
        { status: 429 }
      );
    }

    // Check code expiration
    if (
      consentRecord.verificationCodeExpires &&
      new Date() > consentRecord.verificationCodeExpires
    ) {
      // Record failed attempt
      await db
        .update(parentalConsentRecords)
        .set({
          verificationAttempts: [
            ...attempts,
            {
              timestamp: new Date().toISOString(),
              success: false,
              method: "code_expired",
              ipAddress,
              userAgent,
            },
          ],
          updatedAt: new Date(),
        })
        .where(eq(parentalConsentRecords.id, consentRecord.id));

      return NextResponse.json(
        { error: "Verification code has expired. Please request a new consent." },
        { status: 400 }
      );
    }

    // Verify the code
    if (consentRecord.verificationCode !== verificationCode) {
      // Record failed attempt
      await db
        .update(parentalConsentRecords)
        .set({
          verificationAttempts: [
            ...attempts,
            {
              timestamp: new Date().toISOString(),
              success: false,
              method: "invalid_code",
              ipAddress,
              userAgent,
            },
          ],
          updatedAt: new Date(),
        })
        .where(eq(parentalConsentRecords.id, consentRecord.id));

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - attempts.length - 1;
      return NextResponse.json(
        {
          error: "Invalid verification code",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Verify the security answer
    if (
      !consentRecord.securityAnswerHash ||
      !verifySecurityAnswer(securityAnswer, consentRecord.securityAnswerHash)
    ) {
      // Record failed attempt
      await db
        .update(parentalConsentRecords)
        .set({
          verificationAttempts: [
            ...attempts,
            {
              timestamp: new Date().toISOString(),
              success: false,
              method: "invalid_security_answer",
              ipAddress,
              userAgent,
            },
          ],
          updatedAt: new Date(),
        })
        .where(eq(parentalConsentRecords.id, consentRecord.id));

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - attempts.length - 1;
      return NextResponse.json(
        {
          error: "Incorrect security answer",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // SUCCESS: Mark consent as verified and active
    const now = new Date();

    // Get user for organization ID
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate grade level
    const birthDate = consentRecord.childBirthdate;
    const age = Math.floor(
      (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const gradeLevel = Math.min(12, Math.max(0, age - 5));

    // Transaction to update consent and create learner
    await db.transaction(async (tx) => {
      // Update consent record
      await tx
        .update(parentalConsentRecords)
        .set({
          status: "active",
          consentedAt: now,
          verificationAttempts: [
            ...attempts,
            {
              timestamp: now.toISOString(),
              success: true,
              method: "email_plus",
              ipAddress,
              userAgent,
            },
          ],
          // Clear sensitive verification data
          verificationCode: null,
          verificationCodeExpires: null,
          securityAnswerHash: null,
          updatedAt: now,
        })
        .where(eq(parentalConsentRecords.id, consentRecord.id));

      // Update user's consent status
      await tx
        .update(users)
        .set({
          parentalConsentGiven: true,
          parentalConsentDate: now,
          updatedAt: now,
        })
        .where(eq(users.id, session.user.id));

      // Check for existing learner
      const existingLearner = await tx.query.learners.findFirst({
        where: and(
          eq(learners.userId, session.user.id),
          isNull(learners.deletedAt)
        ),
      });

      let learnerId: string;

      if (!existingLearner) {
        // Create new learner profile
        const [newLearner] = await tx
          .insert(learners)
          .values({
            userId: session.user.id,
            organizationId: user.organizationId ?? "00000000-0000-0000-0000-000000000001",
            name: consentRecord.childName,
            dateOfBirth: birthDate,
            gradeLevel,
            preferences: {
              learningStyle: "visual",
            },
            parentalControls: {
              screenTimeLimit: 60,
              allowedSubjects: ["math", "reading", "science", "history"],
            },
          })
          .returning({ id: learners.id });

        learnerId = newLearner.id;
      } else {
        learnerId = existingLearner.id;
      }

      // Link consent record to learner
      await tx
        .update(parentalConsentRecords)
        .set({ learnerId })
        .where(eq(parentalConsentRecords.id, consentRecord.id));
    });

    return NextResponse.json({
      success: true,
      message: "Consent verified successfully",
      childName: consentRecord.childName,
      gradeLevel,
    });
  } catch (error) {
    console.error("Error verifying consent:", error);
    return NextResponse.json(
      { error: "Failed to verify consent" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/consent - Get consent status
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's consent status
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

    // Get most recent consent record
    const consentRecord = await db.query.parentalConsentRecords.findFirst({
      where: eq(parentalConsentRecords.parentUserId, session.user.id),
      orderBy: [desc(parentalConsentRecords.createdAt)],
    });

    return NextResponse.json({
      consentGiven: user.parentalConsentGiven ?? false,
      consentDate: user.parentalConsentDate?.toISOString() ?? null,
      verificationMethod: consentRecord?.verificationMethod ?? null,
      status: consentRecord?.status ?? null,
      childName: consentRecord?.childName ?? null,
    });
  } catch (error) {
    console.error("Error checking consent:", error);
    return NextResponse.json(
      { error: "Failed to check consent status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/consent - Revoke consent (COPPA requirement)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consentId = searchParams.get("id");

    if (!consentId) {
      return NextResponse.json(
        { error: "Consent ID required" },
        { status: 400 }
      );
    }

    // Find the consent record
    const consentRecord = await db.query.parentalConsentRecords.findFirst({
      where: and(
        eq(parentalConsentRecords.id, consentId),
        eq(parentalConsentRecords.parentUserId, session.user.id)
      ),
    });

    if (!consentRecord) {
      return NextResponse.json(
        { error: "Consent record not found" },
        { status: 404 }
      );
    }

    if (consentRecord.status === "revoked") {
      return NextResponse.json(
        { error: "Consent already revoked" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Parent requested revocation";

    // Revoke consent
    await db.transaction(async (tx) => {
      // Update consent record
      await tx
        .update(parentalConsentRecords)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          revocationReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(parentalConsentRecords.id, consentId));

      // Update user consent status
      await tx
        .update(users)
        .set({
          parentalConsentGiven: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      // Soft-delete the associated learner profile
      if (consentRecord.learnerId) {
        await tx
          .update(learners)
          .set({
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(learners.id, consentRecord.learnerId));
      }
    });

    return NextResponse.json({
      success: true,
      message: "Consent revoked. Child's account has been deactivated.",
    });
  } catch (error) {
    console.error("Error revoking consent:", error);
    return NextResponse.json(
      { error: "Failed to revoke consent" },
      { status: 500 }
    );
  }
}

// Export security questions for the frontend
export const securityQuestions = SECURITY_QUESTIONS;
