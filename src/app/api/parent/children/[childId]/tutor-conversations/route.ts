import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema/users";
import { tutoringConversations } from "@/lib/db/schema/ai";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import type {
  TutorConversationWithLearner,
  ParentConversationListResponse,
  ConversationStatus,
} from "@/types/tutor";

// GET /api/parent/children/[childId]/tutor-conversations - List child's tutor conversations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId } = await params;

    // Verify parent role
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify child belongs to this parent
    const child = await db.query.learners.findFirst({
      where: and(
        eq(learners.id, childId),
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Parse pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
    const offset = (page - 1) * pageSize;

    // Fetch conversations with message count
    const conversationsData = await db
      .select({
        id: tutoringConversations.id,
        learnerId: tutoringConversations.learnerId,
        organizationId: tutoringConversations.organizationId,
        lessonId: tutoringConversations.lessonId,
        conceptId: tutoringConversations.conceptId,
        topic: tutoringConversations.topic,
        status: tutoringConversations.status,
        provider: tutoringConversations.provider,
        model: tutoringConversations.model,
        summary: tutoringConversations.summary,
        startedAt: tutoringConversations.startedAt,
        endedAt: tutoringConversations.endedAt,
        createdAt: tutoringConversations.createdAt,
        updatedAt: tutoringConversations.updatedAt,
        messageCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM tutoring_messages
          WHERE tutoring_messages.conversation_id = tutoring_conversations.id
        )`,
      })
      .from(tutoringConversations)
      .where(eq(tutoringConversations.learnerId, childId))
      .orderBy(desc(tutoringConversations.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tutoringConversations)
      .where(eq(tutoringConversations.learnerId, childId));

    const conversations: TutorConversationWithLearner[] = conversationsData.map((c) => ({
      id: c.id,
      learnerId: c.learnerId,
      organizationId: c.organizationId,
      lessonId: c.lessonId,
      conceptId: c.conceptId,
      topic: c.topic,
      status: c.status as ConversationStatus,
      provider: c.provider,
      model: c.model,
      summary: c.summary,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      learner: {
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevel,
        avatarUrl: child.avatarUrl,
      },
      messageCount: c.messageCount ?? 0,
    }));

    const response: ParentConversationListResponse = {
      conversations,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching child tutor conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
