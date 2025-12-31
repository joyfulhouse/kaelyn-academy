import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  conversations,
  conversationParticipants,
  messages,
} from "@/lib/db/schema/messaging";
import { users, learners } from "@/lib/db/schema/users";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { ValidationError, validateBody } from "@/lib/validation";

// Schema for creating a new conversation
const createConversationSchema = z.object({
  subject: z.string().min(1).max(255),
  recipientId: z.string().uuid(),
  learnerId: z.string().uuid().optional(),
  type: z.enum(["general", "progress_report", "behavior", "scheduling", "assignment", "other"]).default("general"),
  initialMessage: z.string().min(1).max(5000),
});

// GET /api/messaging/conversations - List user's conversations
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "open";

  try {
    // Get conversations where user is a participant
    const userConversations = await db
      .select({
        conversation: conversations,
        participant: conversationParticipants,
        lastMessage: messages,
        unreadCount: sql<number>`(
          SELECT COUNT(*)::int FROM messages m
          WHERE m.conversation_id = ${conversations.id}
          AND m.created_at > COALESCE(${conversationParticipants.lastReadAt}, '1970-01-01')
          AND m.sender_id != ${session.user.id}
          AND m.deleted_at IS NULL
        )`,
      })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        and(
          eq(conversationParticipants.conversationId, conversations.id),
          eq(conversationParticipants.userId, session.user.id),
          isNull(conversationParticipants.leftAt)
        )
      )
      .leftJoin(
        messages,
        and(
          eq(messages.conversationId, conversations.id),
          eq(
            messages.createdAt,
            sql`(SELECT MAX(created_at) FROM messages WHERE conversation_id = ${conversations.id} AND deleted_at IS NULL)`
          )
        )
      )
      .where(
        and(
          eq(conversations.status, status),
          isNull(conversations.closedAt)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // Get participant details for each conversation
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conv) => {
        // Get other participants
        const participants = await db
          .select({
            participant: conversationParticipants,
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
              image: users.image,
            },
          })
          .from(conversationParticipants)
          .innerJoin(users, eq(users.id, conversationParticipants.userId))
          .where(
            and(
              eq(conversationParticipants.conversationId, conv.conversation.id),
              isNull(conversationParticipants.leftAt)
            )
          );

        // Get learner if present
        let learner = null;
        if (conv.conversation.learnerId) {
          const learnerData = await db
            .select({ id: learners.id, name: learners.name })
            .from(learners)
            .where(eq(learners.id, conv.conversation.learnerId))
            .limit(1);
          learner = learnerData[0] || null;
        }

        return {
          id: conv.conversation.id,
          subject: conv.conversation.subject,
          type: conv.conversation.type,
          status: conv.conversation.status,
          createdAt: conv.conversation.createdAt,
          lastMessageAt: conv.conversation.lastMessageAt,
          lastMessage: conv.lastMessage
            ? {
                content:
                  conv.lastMessage.content.length > 100
                    ? conv.lastMessage.content.slice(0, 100) + "..."
                    : conv.lastMessage.content,
                senderId: conv.lastMessage.senderId,
                createdAt: conv.lastMessage.createdAt,
              }
            : null,
          unreadCount: conv.unreadCount,
          participants: participants.map((p) => ({
            id: p.user.id,
            name: p.user.name,
            email: p.user.email,
            image: p.user.image,
            role: p.participant.role,
          })),
          learner,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/messaging/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await validateBody(request, createConversationSchema);

    // Verify recipient exists
    const recipient = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, body.recipientId))
      .limit(1);

    if (!recipient[0]) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Determine sender's role
    const senderRole = session.user.role === "teacher" ? "teacher" : "parent";
    const recipientRole = senderRole === "teacher" ? "parent" : "teacher";

    // Create conversation
    const [conversation] = await db
      .insert(conversations)
      .values({
        organizationId: session.user.organizationId,
        subject: body.subject,
        learnerId: body.learnerId,
        type: body.type,
        lastMessageAt: new Date(),
      })
      .returning();

    // Add participants
    await db.insert(conversationParticipants).values([
      {
        conversationId: conversation.id,
        userId: session.user.id,
        role: senderRole,
      },
      {
        conversationId: conversation.id,
        userId: body.recipientId,
        role: recipientRole,
      },
    ]);

    // Add initial message
    await db.insert(messages).values({
      conversationId: conversation.id,
      senderId: session.user.id,
      content: body.initialMessage,
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        type: conversation.type,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
