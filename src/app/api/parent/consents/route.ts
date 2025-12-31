import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, parentalConsentRecords } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface ConsentWithLearner {
  id: string;
  learnerId: string | null;
  childName: string;
  childBirthdate: Date;
  status: string;
  verificationMethod: string;
  consentedAt: Date | null;
  createdAt: Date;
  learner: {
    id: string;
    name: string;
    gradeLevel: number;
    avatarUrl: string | null;
    isActive: boolean;
  } | null;
}

/**
 * GET /api/parent/consents - Get all consents and learner profiles for parent
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all consent records for this parent
    const consentRecords = await db.query.parentalConsentRecords.findMany({
      where: eq(parentalConsentRecords.parentUserId, session.user.id),
      orderBy: [desc(parentalConsentRecords.createdAt)],
    });

    // Get all learner profiles for this parent (including soft-deleted)
    const learnerProfiles = await db
      .select({
        id: learners.id,
        name: learners.name,
        gradeLevel: learners.gradeLevel,
        avatarUrl: learners.avatarUrl,
        isActive: learners.isActive,
        deletedAt: learners.deletedAt,
      })
      .from(learners)
      .where(eq(learners.userId, session.user.id));

    // Map consents with learner data
    const consentsWithLearners = consentRecords.map((consent) => {
      const learner = consent.learnerId
        ? learnerProfiles.find((l) => l.id === consent.learnerId)
        : null;

      return {
        id: consent.id,
        learnerId: consent.learnerId,
        childName: consent.childName,
        childBirthdate: consent.childBirthdate,
        status: consent.status,
        verificationMethod: consent.verificationMethod,
        consentedAt: consent.consentedAt,
        revokedAt: consent.revokedAt,
        revocationReason: consent.revocationReason,
        createdAt: consent.createdAt,
        learner: learner
          ? {
              id: learner.id,
              name: learner.name,
              gradeLevel: learner.gradeLevel,
              avatarUrl: learner.avatarUrl,
              isActive: learner.isActive ?? true,
            }
          : null,
      };
    });

    // Get active learners without consent records (shouldn't happen normally)
    const learnersWithConsent = new Set(
      consentRecords
        .filter((c) => c.learnerId)
        .map((c) => c.learnerId as string)
    );
    const orphanedLearners = learnerProfiles.filter(
      (l) => !learnersWithConsent.has(l.id) && !l.deletedAt
    );

    return NextResponse.json({
      consents: consentsWithLearners,
      orphanedLearners: orphanedLearners.map((l) => ({
        id: l.id,
        name: l.name,
        gradeLevel: l.gradeLevel,
        avatarUrl: l.avatarUrl,
        isActive: l.isActive ?? true,
        hasConsent: false,
      })),
    });
  } catch (error) {
    console.error("Error fetching parent consents:", error);
    return NextResponse.json(
      { error: "Failed to fetch consent records" },
      { status: 500 }
    );
  }
}
