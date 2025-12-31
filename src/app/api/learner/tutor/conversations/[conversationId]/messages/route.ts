import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { tutoringConversations, tutoringMessages } from "@/lib/db/schema/ai";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import type {
  TutorMessage,
  AddMessageRequest,
  AddMessageResponse,
  MessageRole,
} from "@/types/tutor";

const addMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(50000),
  inputTokens: z.number().int().min(0).optional(),
  outputTokens: z.number().int().min(0).optional(),
  metadata: z.object({
    processingTime: z.number().optional(),
    model: z.string().optional(),
    feedback: z.enum(["helpful", "not_helpful"]).nullable().optional(),
  }).optional(),
});

// POST /api/learner/tutor/conversations/[conversationId]/messages - Add a message
export async function POST(
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

    // Verify conversation ownership
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

    const conversation = conversationData[0];

    // Don't allow adding messages to completed/archived conversations
    if (conversation.status !== "active") {
      return NextResponse.json(
        { error: "Cannot add messages to a closed conversation" },
        { status: 400 }
      );
    }

    const body: AddMessageRequest = await request.json();
    const data = addMessageSchema.parse(body);

    // Create message
    const [created] = await db
      .insert(tutoringMessages)
      .values({
        conversationId,
        role: data.role,
        content: data.content,
        inputTokens: data.inputTokens ?? null,
        outputTokens: data.outputTokens ?? null,
        metadata: data.metadata ?? null,
      })
      .returning();

    // Update conversation's updatedAt
    await db
      .update(tutoringConversations)
      .set({ updatedAt: new Date() })
      .where(eq(tutoringConversations.id, conversationId));

    const message: TutorMessage = {
      id: created.id,
      conversationId: created.conversationId,
      role: created.role as MessageRole,
      content: created.content,
      inputTokens: created.inputTokens,
      outputTokens: created.outputTokens,
      metadata: created.metadata,
      createdAt: created.createdAt,
    };

    const response: AddMessageResponse = { message };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
