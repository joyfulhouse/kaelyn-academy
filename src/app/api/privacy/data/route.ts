import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  learners,
  parentalConsentRecords,
} from "@/lib/db/schema";
import {
  lessonProgress,
  learnerAchievements,
  activityAttempts,
  conceptMastery,
  learnerSubjectProgress,
  unitProgress,
} from "@/lib/db/schema/progress";
import {
  tutoringConversations,
  tutoringMessages,
  contentRecommendations,
  adaptiveDifficulty,
  generatedProblems,
} from "@/lib/db/schema/ai";
import { eq, and, inArray } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * GDPR/COPPA Data Privacy API
 *
 * Implements data subject rights:
 * - GET /api/privacy/data - Export all personal data (GDPR Art. 20)
 * - DELETE /api/privacy/data - Request data deletion (GDPR Art. 17, COPPA)
 *
 * For children's data (COPPA), parents can exercise these rights.
 */

/**
 * GET /api/privacy/data - Export personal data
 *
 * Returns all personal data in a portable format (JSON).
 * For parents, includes their children's data.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get("learnerId");

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Collect all data for export
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      exportType: "full",
      userId: session.user.id,
    };

    // User profile data
    exportData.userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified?.toISOString(),
      role: user.role,
      isAdult: user.isAdult,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      preferences: user.preferences,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // Get learner profiles (children for parents)
    const learnerProfiles = await db.query.learners.findMany({
      where: eq(learners.userId, session.user.id),
    });

    // If specific learner requested, filter
    const targetLearners = learnerId
      ? learnerProfiles.filter((l) => l.id === learnerId)
      : learnerProfiles;

    // Export learner data
    exportData.learnerProfiles = await Promise.all(
      targetLearners.map(async (learner) => {
        // Get progress data
        const progress = await db
          .select()
          .from(lessonProgress)
          .where(eq(lessonProgress.learnerId, learner.id));

        // Get unit progress
        const units = await db
          .select()
          .from(unitProgress)
          .where(eq(unitProgress.learnerId, learner.id));

        // Get subject progress
        const subjects = await db
          .select()
          .from(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, learner.id));

        // Get concept mastery
        const concepts = await db
          .select()
          .from(conceptMastery)
          .where(eq(conceptMastery.learnerId, learner.id));

        // Get activity attempts
        const attempts = await db
          .select()
          .from(activityAttempts)
          .where(eq(activityAttempts.learnerId, learner.id));

        // Get achievements
        const achievements = await db
          .select()
          .from(learnerAchievements)
          .where(eq(learnerAchievements.learnerId, learner.id));

        // Get tutoring conversations
        const conversations = await db
          .select()
          .from(tutoringConversations)
          .where(eq(tutoringConversations.learnerId, learner.id));

        // Get tutoring messages for those conversations
        const conversationIds = conversations.map((c) => c.id);
        const messages =
          conversationIds.length > 0
            ? await db
                .select()
                .from(tutoringMessages)
                .where(inArray(tutoringMessages.conversationId, conversationIds))
            : [];

        // Get content recommendations
        const recommendations = await db
          .select()
          .from(contentRecommendations)
          .where(eq(contentRecommendations.learnerId, learner.id));

        // Get adaptive difficulty settings
        const difficulty = await db
          .select()
          .from(adaptiveDifficulty)
          .where(eq(adaptiveDifficulty.learnerId, learner.id));

        // Get generated problems
        const problems = await db
          .select()
          .from(generatedProblems)
          .where(eq(generatedProblems.learnerId, learner.id));

        return {
          profile: {
            id: learner.id,
            name: learner.name,
            dateOfBirth: learner.dateOfBirth?.toISOString(),
            gradeLevel: learner.gradeLevel,
            avatarUrl: learner.avatarUrl,
            preferences: learner.preferences,
            parentalControls: learner.parentalControls,
            isActive: learner.isActive,
            lastActiveAt: learner.lastActiveAt?.toISOString(),
            createdAt: learner.createdAt.toISOString(),
            updatedAt: learner.updatedAt.toISOString(),
          },
          subjectProgress: subjects.map((s) => ({
            subjectId: s.subjectId,
            completedLessons: s.completedLessons,
            totalLessons: s.totalLessons,
            masteryLevel: s.masteryLevel,
            currentStreak: s.currentStreak,
            totalTimeSpent: s.totalTimeSpent,
          })),
          unitProgress: units.map((u) => ({
            unitId: u.unitId,
            status: u.status,
            progressPercent: u.progressPercent,
            timeSpent: u.timeSpent,
          })),
          lessonProgress: progress.map((p) => ({
            lessonId: p.lessonId,
            status: p.status,
            progressPercent: p.progressPercent,
            activitiesCompleted: p.activitiesCompleted,
            timeSpent: p.timeSpent,
            lastPosition: p.lastPosition,
            startedAt: p.startedAt?.toISOString(),
            completedAt: p.completedAt?.toISOString(),
          })),
          conceptMastery: concepts.map((c) => ({
            conceptId: c.conceptId,
            masteryLevel: c.masteryLevel,
            attempts: c.attempts,
            correctAttempts: c.correctAttempts,
            timeSpent: c.timeSpent,
          })),
          activityAttempts: attempts.map((a) => ({
            activityId: a.activityId,
            attemptNumber: a.attemptNumber,
            score: a.score,
            passed: a.passed,
            timeSpent: a.timeSpent,
            startedAt: a.startedAt.toISOString(),
            completedAt: a.completedAt?.toISOString(),
          })),
          achievements: achievements.map((a) => ({
            achievementId: a.achievementId,
            earnedAt: a.earnedAt.toISOString(),
          })),
          tutoringConversations: conversations.map((c) => ({
            id: c.id,
            topic: c.topic,
            status: c.status,
            provider: c.provider,
            startedAt: c.startedAt.toISOString(),
            endedAt: c.endedAt?.toISOString(),
            summary: c.summary,
          })),
          tutoringMessages: messages.map((m) => ({
            conversationId: m.conversationId,
            role: m.role,
            content: m.content, // Note: May contain PII - user consented
            createdAt: m.createdAt.toISOString(),
          })),
          contentRecommendations: recommendations.map((r) => ({
            recommendationType: r.recommendationType,
            lessonId: r.lessonId,
            conceptId: r.conceptId,
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
          })),
          adaptiveDifficulty: difficulty.map((d) => ({
            subjectDifficulties: d.subjectDifficulties,
            learningProfile: d.learningProfile,
          })),
          generatedProblems: problems.map((p) => ({
            problem: p.problem,
            provider: p.provider,
            createdAt: p.createdAt.toISOString(),
          })),
        };
      })
    );

    // Get consent records
    const consents = await db.query.parentalConsentRecords.findMany({
      where: eq(parentalConsentRecords.parentUserId, session.user.id),
    });

    exportData.consentRecords = consents.map((c) => ({
      id: c.id,
      childName: c.childName,
      verificationMethod: c.verificationMethod,
      status: c.status,
      relationship: c.relationship,
      agreements: c.agreements,
      signatureText: c.signatureText,
      signatureTimestamp: c.signatureTimestamp.toISOString(),
      consentedAt: c.consentedAt?.toISOString(),
      revokedAt: c.revokedAt?.toISOString(),
      revocationReason: c.revocationReason,
      createdAt: c.createdAt.toISOString(),
    }));

    // Set response headers for file download
    const filename = `kaelyn-academy-data-export-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/privacy/data - Request data deletion
 *
 * GDPR Right to Erasure (Art. 17) / COPPA Deletion Request
 *
 * For learners, this:
 * 1. Deletes all learning progress
 * 2. Deletes all activity attempts
 * 3. Deletes all tutoring conversations and messages
 * 4. Anonymizes the learner profile
 * 5. Records the deletion request for audit
 *
 * For users, this handles the full account deletion.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get("learnerId");
    const deleteAccount = searchParams.get("deleteAccount") === "true";

    // Get request metadata for audit
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Verify the learner belongs to this user
    if (learnerId) {
      const learner = await db.query.learners.findFirst({
        where: and(
          eq(learners.id, learnerId),
          eq(learners.userId, session.user.id)
        ),
      });

      if (!learner) {
        return NextResponse.json(
          { error: "Learner not found or access denied" },
          { status: 404 }
        );
      }

      // Delete learner's data in transaction
      await db.transaction(async (tx) => {
        // Get tutoring conversations first to delete messages
        const conversations = await tx
          .select({ id: tutoringConversations.id })
          .from(tutoringConversations)
          .where(eq(tutoringConversations.learnerId, learnerId));

        const conversationIds = conversations.map((c) => c.id);

        // Delete tutoring messages
        if (conversationIds.length > 0) {
          await tx
            .delete(tutoringMessages)
            .where(inArray(tutoringMessages.conversationId, conversationIds));
        }

        // Delete tutoring conversations
        await tx
          .delete(tutoringConversations)
          .where(eq(tutoringConversations.learnerId, learnerId));

        // Delete content recommendations
        await tx
          .delete(contentRecommendations)
          .where(eq(contentRecommendations.learnerId, learnerId));

        // Delete adaptive difficulty
        await tx
          .delete(adaptiveDifficulty)
          .where(eq(adaptiveDifficulty.learnerId, learnerId));

        // Delete generated problems
        await tx
          .delete(generatedProblems)
          .where(eq(generatedProblems.learnerId, learnerId));

        // Delete activity attempts
        await tx
          .delete(activityAttempts)
          .where(eq(activityAttempts.learnerId, learnerId));

        // Delete concept mastery
        await tx
          .delete(conceptMastery)
          .where(eq(conceptMastery.learnerId, learnerId));

        // Delete achievements
        await tx
          .delete(learnerAchievements)
          .where(eq(learnerAchievements.learnerId, learnerId));

        // Delete lesson progress
        await tx
          .delete(lessonProgress)
          .where(eq(lessonProgress.learnerId, learnerId));

        // Delete unit progress
        await tx
          .delete(unitProgress)
          .where(eq(unitProgress.learnerId, learnerId));

        // Delete subject progress
        await tx
          .delete(learnerSubjectProgress)
          .where(eq(learnerSubjectProgress.learnerId, learnerId));

        // Anonymize (soft-delete) the learner profile
        await tx
          .update(learners)
          .set({
            name: "[Deleted]",
            avatarUrl: null,
            dateOfBirth: null,
            preferences: null,
            parentalControls: null,
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(learners.id, learnerId));

        // Update related consent records
        await tx
          .update(parentalConsentRecords)
          .set({
            status: "revoked",
            revokedAt: new Date(),
            revocationReason: `Data deletion requested from ${ipAddress}`,
            childName: "[Deleted]",
            updatedAt: new Date(),
          })
          .where(eq(parentalConsentRecords.learnerId, learnerId));
      });

      console.log(
        `Deleted learner data: ${learnerId} by user: ${session.user.id} from IP: ${ipAddress}`
      );

      return NextResponse.json({
        success: true,
        message: "Learner data has been deleted",
        learnerId,
      });
    }

    // Full account deletion
    if (deleteAccount) {
      // Get all learners for this user
      const userLearners = await db.query.learners.findMany({
        where: eq(learners.userId, session.user.id),
        columns: { id: true },
      });

      await db.transaction(async (tx) => {
        // Delete data for all learners
        for (const learner of userLearners) {
          // Get tutoring conversations
          const conversations = await tx
            .select({ id: tutoringConversations.id })
            .from(tutoringConversations)
            .where(eq(tutoringConversations.learnerId, learner.id));

          const conversationIds = conversations.map((c) => c.id);

          // Delete tutoring messages
          if (conversationIds.length > 0) {
            await tx
              .delete(tutoringMessages)
              .where(inArray(tutoringMessages.conversationId, conversationIds));
          }

          // Delete tutoring conversations
          await tx
            .delete(tutoringConversations)
            .where(eq(tutoringConversations.learnerId, learner.id));

          // Delete content recommendations
          await tx
            .delete(contentRecommendations)
            .where(eq(contentRecommendations.learnerId, learner.id));

          // Delete adaptive difficulty
          await tx
            .delete(adaptiveDifficulty)
            .where(eq(adaptiveDifficulty.learnerId, learner.id));

          // Delete generated problems
          await tx
            .delete(generatedProblems)
            .where(eq(generatedProblems.learnerId, learner.id));

          // Delete activity attempts
          await tx
            .delete(activityAttempts)
            .where(eq(activityAttempts.learnerId, learner.id));

          // Delete concept mastery
          await tx
            .delete(conceptMastery)
            .where(eq(conceptMastery.learnerId, learner.id));

          // Delete achievements
          await tx
            .delete(learnerAchievements)
            .where(eq(learnerAchievements.learnerId, learner.id));

          // Delete lesson progress
          await tx
            .delete(lessonProgress)
            .where(eq(lessonProgress.learnerId, learner.id));

          // Delete unit progress
          await tx
            .delete(unitProgress)
            .where(eq(unitProgress.learnerId, learner.id));

          // Delete subject progress
          await tx
            .delete(learnerSubjectProgress)
            .where(eq(learnerSubjectProgress.learnerId, learner.id));
        }

        // Delete all learner profiles
        await tx.delete(learners).where(eq(learners.userId, session.user.id));

        // Delete consent records
        await tx
          .delete(parentalConsentRecords)
          .where(eq(parentalConsentRecords.parentUserId, session.user.id));

        // Anonymize the user account (keep for audit, but remove PII)
        await tx
          .update(users)
          .set({
            name: "[Deleted]",
            email: `deleted-${session.user.id}@deleted.local`,
            image: null,
            preferences: null,
            dateOfBirth: null,
            parentalConsentGiven: false,
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, session.user.id));
      });

      console.log(
        `Deleted account: ${session.user.id} from IP: ${ipAddress}`
      );

      return NextResponse.json({
        success: true,
        message: "Account and all associated data have been deleted",
      });
    }

    return NextResponse.json(
      { error: "Specify learnerId or deleteAccount=true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
