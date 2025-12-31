import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { tutoringConversations } from "@/lib/db/schema/ai";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";
import type {
  TutorConversation,
  StartConversationRequest,
  StartConversationResponse,
  ConversationStatus,
} from "@/types/tutor";

const startConversationSchema = z.object({
  topic: z.string().max(255).optional(),
  lessonId: z.string().uuid().optional(),
  conceptId: z.string().uuid().optional(),
  provider: z.string().max(50).default("claude"),
  model: z.string().max(100).optional(),
});

// GET /api/learner/tutor/conversations - List learner's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Parse pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
    const offset = (page - 1) * pageSize;

    // Fetch conversations
    const conversationsData = await db
      .select()
      .from(tutoringConversations)
      .where(eq(tutoringConversations.learnerId, learner.id))
      .orderBy(desc(tutoringConversations.createdAt))
      .limit(pageSize)
      .offset(offset);

    const conversations: TutorConversation[] = conversationsData.map((c) => ({
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
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching tutor conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/learner/tutor/conversations - Start a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const body: StartConversationRequest = await request.json();
    const data = startConversationSchema.parse(body);

    // Create conversation
    const [created] = await db
      .insert(tutoringConversations)
      .values({
        learnerId: learner.id,
        organizationId: learner.organizationId,
        lessonId: data.lessonId ?? null,
        conceptId: data.conceptId ?? null,
        topic: data.topic ?? null,
        provider: data.provider,
        model: data.model ?? null,
        status: "active",
        startedAt: new Date(),
      })
      .returning();

    const conversation: TutorConversation = {
      id: created.id,
      learnerId: created.learnerId,
      organizationId: created.organizationId,
      lessonId: created.lessonId,
      conceptId: created.conceptId,
      topic: created.topic,
      status: created.status as ConversationStatus,
      provider: created.provider,
      model: created.model,
      summary: created.summary,
      startedAt: created.startedAt,
      endedAt: created.endedAt,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    const response: StartConversationResponse = { conversation };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating tutor conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
