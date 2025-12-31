import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  conversations,
  conversationParticipants,
  messages,
  readReceipts,
} from "@/lib/db/schema/messaging";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull, asc } from "drizzle-orm";
import { z } from "zod";
import { ValidationError, validateBody } from "@/lib/validation";

// Schema for sending a message
const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// Verify user is participant in conversation
async function verifyParticipant(conversationId: string, userId: string) {
  const participant = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
        isNull(conversationParticipants.leftAt)
      )
    )
    .limit(1);

  return participant[0] || null;
}

// GET /api/messaging/conversations/[id] - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify user is participant
    const participant = await verifyParticipant(id, session.user.id);
    if (!participant) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get conversation details
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conversation[0]) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get messages
    const conversationMessages = await db
      .select({
        message: messages,
        sender: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
      })
      .from(messages)
      .innerJoin(users, eq(users.id, messages.senderId))
      .where(
        and(eq(messages.conversationId, id), isNull(messages.deletedAt))
      )
      .orderBy(asc(messages.createdAt));

    // Get participants
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
          eq(conversationParticipants.conversationId, id),
          isNull(conversationParticipants.leftAt)
        )
      );

    // Get read receipts for each message
    const messagesWithReceipts = await Promise.all(
      conversationMessages.map(async (m) => {
        const receipts = await db
          .select({
            userId: readReceipts.userId,
            readAt: readReceipts.readAt,
          })
          .from(readReceipts)
          .where(eq(readReceipts.messageId, m.message.id));

        return {
          id: m.message.id,
          content: m.message.content,
          type: m.message.type,
          createdAt: m.message.createdAt,
          isEdited: m.message.isEdited,
          sender: m.sender,
          readBy: receipts,
        };
      })
    );

    // Update last read time
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, id),
          eq(conversationParticipants.userId, session.user.id)
        )
      );

    // Mark messages as read
    for (const msg of conversationMessages) {
      if (msg.message.senderId !== session.user.id) {
        // Check if already marked as read
        const existingReceipt = await db
          .select()
          .from(readReceipts)
          .where(
            and(
              eq(readReceipts.messageId, msg.message.id),
              eq(readReceipts.userId, session.user.id)
            )
          )
          .limit(1);

        if (!existingReceipt[0]) {
          await db.insert(readReceipts).values({
            messageId: msg.message.id,
            userId: session.user.id,
          });
        }
      }
    }

    return NextResponse.json({
      conversation: {
        id: conversation[0].id,
        subject: conversation[0].subject,
        type: conversation[0].type,
        status: conversation[0].status,
        createdAt: conversation[0].createdAt,
      },
      messages: messagesWithReceipts,
      participants: participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        image: p.user.image,
        role: p.participant.role,
      })),
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// POST /api/messaging/conversations/[id] - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify user is participant
    const participant = await verifyParticipant(id, session.user.id);
    if (!participant) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Verify conversation is open
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.status, "open")
        )
      )
      .limit(1);

    if (!conversation[0]) {
      return NextResponse.json(
        { error: "Conversation is closed" },
        { status: 400 }
      );
    }

    const body = await validateBody(request, sendMessageSchema);

    // Create message
    const [message] = await db
      .insert(messages)
      .values({
        conversationId: id,
        senderId: session.user.id,
        content: body.content,
      })
      .returning();

    // Update conversation last message time
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, id));

    // Get sender info
    const sender = await db
      .select({ id: users.id, name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        sender: sender[0],
        readBy: [],
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PATCH /api/messaging/conversations/[id] - Update conversation (close/archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify user is participant
    const participant = await verifyParticipant(id, session.user.id);
    if (!participant) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["open", "closed", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update conversation
    await db
      .update(conversations)
      .set({
        status,
        closedAt: status === "closed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
