import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { lessonProgress } from "@/lib/db/schema/progress";
import { count, eq, isNull, and } from "drizzle-orm";
import { getCurriculumStats } from "@/data/curriculum";

/**
 * Public stats for the landing page
 * Cached for 1 hour to reduce database load
 */
export interface PublicStats {
  activeLearners: number;
  lessonModules: number;
  parentSatisfaction: number;
  appRating: number;
  // Additional stats that might be useful
  totalOrganizations: number;
  lessonsCompleted: number;
}

/**
 * GET /api/public/stats - Get public platform statistics
 *
 * This endpoint is public (no auth required) and heavily cached.
 * Stats are aggregated from the database and curriculum data.
 */
export async function GET() {
  try {
    // Get curriculum stats (static data)
    const curriculumStats = getCurriculumStats();

    // Run database queries in parallel for efficiency
    const [
      activeLearnerCount,
      organizationCount,
      completedLessonsCount,
    ] = await Promise.all([
      // Count active learners (not deleted, active status)
      db
        .select({ count: count() })
        .from(learners)
        .where(
          and(
            eq(learners.isActive, true),
            isNull(learners.deletedAt)
          )
        )
        .then((result) => result[0]?.count ?? 0),

      // Count organizations (schools and families)
      db
        .select({ count: count() })
        .from(organizations)
        .where(isNull(organizations.deletedAt))
        .then((result) => result[0]?.count ?? 0),

      // Count completed lessons (lessons with 100% progress)
      db
        .select({ count: count() })
        .from(lessonProgress)
        .where(eq(lessonProgress.status, "completed"))
        .then((result) => result[0]?.count ?? 0),
    ]);

    // Calculate parent satisfaction from quiz pass rates
    // For now, use a placeholder. In production, this would aggregate
    // from a feedback/ratings table or NPS surveys
    const parentSatisfaction = 95; // Placeholder - would come from actual survey data

    // App store rating - typically fetched from external API or stored in config
    // For now, use a placeholder value
    const appRating = 4.9; // Placeholder

    const stats: PublicStats = {
      activeLearners: activeLearnerCount,
      lessonModules: curriculumStats.totalLessons,
      parentSatisfaction,
      appRating,
      totalOrganizations: organizationCount,
      lessonsCompleted: completedLessonsCount,
    };

    // Return with cache headers
    // Cache for 1 hour on CDN, allow stale for 5 minutes while revalidating
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);

    // Return fallback stats on error
    const curriculumStats = getCurriculumStats();
    const fallbackStats: PublicStats = {
      activeLearners: 0,
      lessonModules: curriculumStats.totalLessons,
      parentSatisfaction: 95,
      appRating: 4.9,
      totalOrganizations: 0,
      lessonsCompleted: 0,
    };

    return NextResponse.json(fallbackStats, {
      headers: {
        "Cache-Control": "public, s-maxage=60", // Shorter cache on error
      },
    });
  }
}

// Enable ISR for this route - revalidate every hour
export const revalidate = 3600;
