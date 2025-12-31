import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adaptiveDifficulty } from "@/lib/db/schema/ai";
import { learners } from "@/lib/db/schema/users";
import { auth } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";

interface SubjectDifficultyData {
  currentLevel: number;
  recentAccuracy: number;
  adjustedAt: string;
}

/**
 * GET /api/learner/difficulty - Get adaptive difficulty data for a learner
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const learnerId = searchParams.get("learnerId");

  if (!learnerId) {
    return NextResponse.json({ error: "learnerId is required" }, { status: 400 });
  }

  try {
    // Verify learner belongs to user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, learnerId),
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    if (!learner) {
      return NextResponse.json({ error: "Learner not found" }, { status: 404 });
    }

    // Fetch adaptive difficulty settings
    const difficultySettings = await db.query.adaptiveDifficulty.findFirst({
      where: eq(adaptiveDifficulty.learnerId, learnerId),
    });

    // Fetch all subjects for mapping
    const allSubjects = await db.query.subjects.findMany({
      columns: { id: true, name: true },
    });

    // Build subject difficulties with defaults
    const subjectDifficulties = difficultySettings?.subjectDifficulties || {};
    const subjectData = allSubjects.map((subject) => {
      const data = subjectDifficulties[subject.id] as SubjectDifficultyData | undefined;
      const currentLevel = data?.currentLevel ?? 3;
      const recentAccuracy = data?.recentAccuracy ?? 70;

      // Determine trend based on accuracy
      let trend: "up" | "down" | "stable" = "stable";
      if (recentAccuracy >= 85) trend = "up";
      else if (recentAccuracy < 60) trend = "down";

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        currentLevel,
        recentAccuracy,
        adjustedAt: data?.adjustedAt ?? new Date().toISOString(),
        trend,
      };
    });

    // Calculate overall level
    const overallLevel =
      subjectData.length > 0
        ? subjectData.reduce((sum, s) => sum + s.currentLevel, 0) / subjectData.length
        : 3;

    // Generate mock history (in production, this would come from a history table)
    const now = new Date();
    const history = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (13 - i));
      return {
        date: date.toISOString(),
        level: Math.max(1, Math.min(5, Math.round(overallLevel + (Math.random() - 0.5) * 0.5))),
        accuracy: Math.round(70 + Math.random() * 20),
      };
    });

    // Find last adjustment date
    const adjustedDates = subjectData
      .map((s) => new Date(s.adjustedAt))
      .filter((d) => !isNaN(d.getTime()));
    const lastAdjusted = adjustedDates.length > 0
      ? new Date(Math.max(...adjustedDates.map((d) => d.getTime()))).toISOString()
      : null;

    return NextResponse.json({
      subjects: subjectData,
      overallLevel,
      history,
      lastAdjusted,
    });
  } catch (error) {
    console.error("Failed to fetch difficulty data:", error);
    return NextResponse.json(
      { error: "Failed to fetch difficulty data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learner/difficulty - Request difficulty adjustment
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { learnerId, subjectId, direction } = body;

    if (!learnerId || !subjectId || !direction) {
      return NextResponse.json(
        { error: "learnerId, subjectId, and direction are required" },
        { status: 400 }
      );
    }

    if (!["easier", "harder"].includes(direction)) {
      return NextResponse.json(
        { error: "direction must be 'easier' or 'harder'" },
        { status: 400 }
      );
    }

    // Verify learner belongs to user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, learnerId),
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      columns: { id: true, organizationId: true },
    });

    if (!learner) {
      return NextResponse.json({ error: "Learner not found" }, { status: 404 });
    }

    // Fetch current settings
    const settings = await db.query.adaptiveDifficulty.findFirst({
      where: eq(adaptiveDifficulty.learnerId, learnerId),
    });

    const subjectDifficulties = (settings?.subjectDifficulties || {}) as Record<
      string,
      SubjectDifficultyData
    >;
    const current = subjectDifficulties[subjectId] || {
      currentLevel: 3,
      recentAccuracy: 70,
      adjustedAt: new Date().toISOString(),
    };

    // Adjust level
    const newLevel =
      direction === "harder"
        ? Math.min(5, current.currentLevel + 1)
        : Math.max(1, current.currentLevel - 1);

    subjectDifficulties[subjectId] = {
      currentLevel: newLevel,
      recentAccuracy: current.recentAccuracy,
      adjustedAt: new Date().toISOString(),
    };

    if (settings) {
      // Update existing settings
      await db
        .update(adaptiveDifficulty)
        .set({
          subjectDifficulties,
          updatedAt: new Date(),
        })
        .where(eq(adaptiveDifficulty.id, settings.id));
    } else {
      // Create new settings
      await db.insert(adaptiveDifficulty).values({
        learnerId,
        organizationId: learner.organizationId,
        subjectDifficulties,
      });
    }

    return NextResponse.json({
      success: true,
      subjectId,
      newLevel,
      direction,
    });
  } catch (error) {
    console.error("Failed to adjust difficulty:", error);
    return NextResponse.json(
      { error: "Failed to adjust difficulty" },
      { status: 500 }
    );
  }
}
