import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users, learningSessions, sessionEvents } from "@/lib/db/schema";
import { lessons, activities, subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, desc, gte, sql } from "drizzle-orm";
import { z } from "zod";

// Schema for query params validation
const querySchema = z.object({
  status: z.enum(["active", "paused", "completed", "abandoned", "all"]).optional().default("all"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  since: z.string().datetime().optional(), // ISO date string for filtering recent sessions
});

// Helper to find child by slug
async function findChildBySlug(userId: string, slug: string) {
  const children = await db.query.learners.findMany({
    where: and(
      eq(learners.userId, userId),
      isNull(learners.deletedAt)
    ),
  });

  const allNames = children.map(c => c.name);

  for (const child of children) {
    const parts = child.name.toLowerCase().split(" ");
    const firstName = parts[0];
    const middleInitial = parts.length > 2 ? parts[1][0] : null;

    const sameFirstName = allNames.filter(n =>
      n.toLowerCase().startsWith(firstName + " ") && n !== child.name
    );

    const childSlug = sameFirstName.length > 0 && middleInitial
      ? `${firstName}-${middleInitial}`
      : firstName;

    if (childSlug === slug) {
      return child;
    }
  }

  return null;
}

// GET - Get learning sessions for a specific child
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    const { childId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const child = await findChildBySlug(session.user.id, childId);

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
      since: url.searchParams.get("since") ?? undefined,
    };

    const parsed = querySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status, limit, offset, since } = parsed.data;

    // Build conditions
    const conditions = [eq(learningSessions.learnerId, child.id)];

    if (status !== "all") {
      conditions.push(eq(learningSessions.status, status));
    }

    if (since) {
      conditions.push(gte(learningSessions.startedAt, new Date(since)));
    }

    // Fetch learning sessions with related data
    const sessionsData = await db
      .select({
        id: learningSessions.id,
        status: learningSessions.status,
        startedAt: learningSessions.startedAt,
        endedAt: learningSessions.endedAt,
        lastHeartbeatAt: learningSessions.lastHeartbeatAt,
        currentActivityType: learningSessions.currentActivityType,
        totalActiveTime: learningSessions.totalActiveTime,
        totalPausedTime: learningSessions.totalPausedTime,
        activitiesCompleted: learningSessions.activitiesCompleted,
        lessonsViewed: learningSessions.lessonsViewed,
        progressSnapshot: learningSessions.progressSnapshot,
        deviceType: learningSessions.deviceType,
        // Current lesson info
        currentLessonId: learningSessions.currentLessonId,
        currentLessonTitle: lessons.title,
        // Current activity info
        currentActivityId: learningSessions.currentActivityId,
        currentActivityTitle: activities.title,
        // Current subject info
        currentSubjectId: learningSessions.currentSubjectId,
        currentSubjectName: subjects.name,
        currentSubjectColor: subjects.color,
      })
      .from(learningSessions)
      .leftJoin(lessons, eq(learningSessions.currentLessonId, lessons.id))
      .leftJoin(activities, eq(learningSessions.currentActivityId, activities.id))
      .leftJoin(subjects, eq(learningSessions.currentSubjectId, subjects.id))
      .where(and(...conditions))
      .orderBy(desc(learningSessions.startedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learningSessions)
      .where(and(...conditions));

    // Get active session if exists (session with status 'active')
    const activeSession = sessionsData.find(s => s.status === "active");

    // If there's an active session, get recent events for it
    let activeSessionEvents: Array<{
      id: string;
      eventType: string;
      occurredAt: Date;
      eventData: {
        score?: number;
        duration?: number;
        reason?: string;
        activityName?: string;
        lessonName?: string;
        subjectName?: string;
      } | null;
      lessonTitle: string | null;
      activityTitle: string | null;
      subjectName: string | null;
    }> = [];

    if (activeSession) {
      activeSessionEvents = await db
        .select({
          id: sessionEvents.id,
          eventType: sessionEvents.eventType,
          occurredAt: sessionEvents.occurredAt,
          eventData: sessionEvents.eventData,
          lessonTitle: lessons.title,
          activityTitle: activities.title,
          subjectName: subjects.name,
        })
        .from(sessionEvents)
        .leftJoin(lessons, eq(sessionEvents.lessonId, lessons.id))
        .leftJoin(activities, eq(sessionEvents.activityId, activities.id))
        .leftJoin(subjects, eq(sessionEvents.subjectId, subjects.id))
        .where(eq(sessionEvents.sessionId, activeSession.id))
        .orderBy(desc(sessionEvents.occurredAt))
        .limit(20);
    }

    // Calculate session stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayStats] = await db
      .select({
        totalSessions: sql<number>`count(*)::int`,
        totalActiveTime: sql<number>`COALESCE(SUM(${learningSessions.totalActiveTime}), 0)::int`,
        totalActivitiesCompleted: sql<number>`COALESCE(SUM(${learningSessions.activitiesCompleted}), 0)::int`,
        totalLessonsViewed: sql<number>`COALESCE(SUM(${learningSessions.lessonsViewed}), 0)::int`,
      })
      .from(learningSessions)
      .where(and(
        eq(learningSessions.learnerId, child.id),
        gte(learningSessions.startedAt, today)
      ));

    // Format sessions for response
    const formattedSessions = sessionsData.map(s => ({
      id: s.id,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      lastHeartbeatAt: s.lastHeartbeatAt,
      currentActivityType: s.currentActivityType,
      totalActiveTime: s.totalActiveTime,
      totalPausedTime: s.totalPausedTime,
      activitiesCompleted: s.activitiesCompleted,
      lessonsViewed: s.lessonsViewed,
      progressSnapshot: s.progressSnapshot,
      deviceType: s.deviceType,
      currentLesson: s.currentLessonId ? {
        id: s.currentLessonId,
        title: s.currentLessonTitle,
      } : null,
      currentActivity: s.currentActivityId ? {
        id: s.currentActivityId,
        title: s.currentActivityTitle,
      } : null,
      currentSubject: s.currentSubjectId ? {
        id: s.currentSubjectId,
        name: s.currentSubjectName,
        color: s.currentSubjectColor,
      } : null,
      // Calculate duration
      duration: s.endedAt
        ? Math.floor((s.endedAt.getTime() - s.startedAt.getTime()) / 1000)
        : Math.floor((Date.now() - s.startedAt.getTime()) / 1000),
    }));

    return NextResponse.json({
      childName: child.name,
      childId: child.id,
      sessions: formattedSessions,
      activeSession: activeSession ? {
        ...formattedSessions.find(s => s.id === activeSession.id),
        recentEvents: activeSessionEvents.map(e => ({
          id: e.id,
          eventType: e.eventType,
          occurredAt: e.occurredAt,
          eventData: e.eventData,
          lessonTitle: e.lessonTitle,
          activityTitle: e.activityTitle,
          subjectName: e.subjectName,
        })),
      } : null,
      todayStats: {
        totalSessions: todayStats?.totalSessions ?? 0,
        totalActiveTime: todayStats?.totalActiveTime ?? 0,
        totalActivitiesCompleted: todayStats?.totalActivitiesCompleted ?? 0,
        totalLessonsViewed: todayStats?.totalLessonsViewed ?? 0,
      },
      pagination: {
        total: countResult?.count ?? 0,
        limit,
        offset,
        hasMore: (countResult?.count ?? 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
