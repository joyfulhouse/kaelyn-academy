import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { tutoringConversations, tutoringMessages } from "@/lib/db/schema/ai";
import { eq, and, isNull, asc } from "drizzle-orm";
import { z } from "zod";
import type {
  TutorConversation,
  TutorMessage,
  TutorConversationWithMessages,
  EndConversationRequest,
  EndConversationResponse,
  ConversationStatus,
  MessageRole,
} from "@/types/tutor";

const endConversationSchema = z.object({
  summary: z.string().max(2000).optional(),
});

// GET /api/learner/tutor/conversations/[conversationId] - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Get learner for this user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    if (!learner) {
      return NextResponse.json({ error: "Learner profile not found" }, { status: 404 });
    }

    // Fetch conversation with ownership check
    const conversationData = await db
      .select()
      .from(tutoringConversations)
      .where(
        and(
          eq(tutoringConversations.id, conversationId),
          eq(tutoringConversations.learnerId, learner.id)
        )
      )
      .limit(1);

    if (conversationData.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const conv = conversationData[0];

    // Fetch messages
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

    const conversation: TutorConversationWithMessages = {
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
      messages,
    };

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/learner/tutor/conversations/[conversationId] - End/update conversation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Get learner for this user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    if (!learner) {
      return NextResponse.json({ error: "Learner profile not found" }, { status: 404 });
    }

    // Verify ownership
    const existingConv = await db
      .select()
      .from(tutoringConversations)
      .where(
        and(
          eq(tutoringConversations.id, conversationId),
          eq(tutoringConversations.learnerId, learner.id)
        )
      )
      .limit(1);

    if (existingConv.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const body: EndConversationRequest = await request.json();
    const data = endConversationSchema.parse(body);

    // Update conversation
    const [updated] = await db
      .update(tutoringConversations)
      .set({
        status: "completed",
        summary: data.summary ?? null,
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tutoringConversations.id, conversationId))
      .returning();

    const conversation: TutorConversation = {
      id: updated.id,
      learnerId: updated.learnerId,
      organizationId: updated.organizationId,
      lessonId: updated.lessonId,
      conceptId: updated.conceptId,
      topic: updated.topic,
      status: updated.status as ConversationStatus,
      provider: updated.provider,
      model: updated.model,
      summary: updated.summary,
      startedAt: updated.startedAt,
      endedAt: updated.endedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    const response: EndConversationResponse = { conversation };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
