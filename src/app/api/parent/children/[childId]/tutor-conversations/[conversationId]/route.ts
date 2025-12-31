import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema/users";
import { tutoringConversations, tutoringMessages } from "@/lib/db/schema/ai";
import { eq, and, isNull, asc } from "drizzle-orm";
import type {
  TutorMessage,
  TutorConversationWithLearner,
  ParentConversationDetailResponse,
  ConversationStatus,
  MessageRole,
} from "@/types/tutor";

// GET /api/parent/children/[childId]/tutor-conversations/[conversationId] - Get conversation detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string; conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId, conversationId } = await params;

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

    // Fetch conversation with ownership verification
    const conversationData = await db
      .select()
      .from(tutoringConversations)
      .where(
        and(
          eq(tutoringConversations.id, conversationId),
          eq(tutoringConversations.learnerId, childId)
        )
      )
      .limit(1);

    if (conversationData.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const conv = conversationData[0];

    // Fetch all messages
    const messagesData = await db
      .select()
      .from(tutoringMessages)
      .where(eq(tutoringMessages.conversationId, conversationId))
      .orderBy(asc(tutoringMessages.createdAt));

    const messages: TutorMessage[] = messagesData.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role as MessageRole,
      content: m.content,
      inputTokens: m.inputTokens,
      outputTokens: m.outputTokens,
      metadata: m.metadata,
      createdAt: m.createdAt,
    }));

    const conversation: TutorConversationWithLearner = {
      id: conv.id,
      learnerId: conv.learnerId,
      organizationId: conv.organizationId,
      lessonId: conv.lessonId,
      conceptId: conv.conceptId,
      topic: conv.topic,
      status: conv.status as ConversationStatus,
      provider: conv.provider,
      model: conv.model,
      summary: conv.summary,
      startedAt: conv.startedAt,
      endedAt: conv.endedAt,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      learner: {
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevel,
        avatarUrl: child.avatarUrl,
      },
      messageCount: messages.length,
    };

    const response: ParentConversationDetailResponse = {
      conversation,
      messages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching conversation detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}
