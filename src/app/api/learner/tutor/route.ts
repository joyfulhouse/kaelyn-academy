import { NextRequest } from "next/server";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { tutoringConversations, tutoringMessages } from "@/lib/db/schema/ai";
import { eq, and, isNull, asc } from "drizzle-orm";
import { z } from "zod";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { getModel, type AIProvider } from "@/lib/ai/providers";
import { sanitizeText, sanitizeLearnerName } from "@/lib/ai/pii-sanitizer";

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(10000),
  topic: z.string().max(255).optional(),
  lessonId: z.string().uuid().optional(),
  conceptId: z.string().uuid().optional(),
  provider: z.enum(["anthropic", "openai", "google"]).optional().default("anthropic"),
});

function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten (age 5-6)";
  if (grade <= 2) return `${grade}${grade === 1 ? "st" : "nd"} grade (age ${grade + 5}-${grade + 6})`;
  if (grade === 3) return "3rd grade (age 8-9)";
  return `${grade}th grade (age ${grade + 5}-${grade + 6})`;
}

function buildSystemPrompt(learnerName: string, gradeLevel: number, topic: string | null): string {
  const gradeDesc = getGradeLevelDescription(gradeLevel);
  const displayName = sanitizeLearnerName(learnerName);

  return `You are a friendly, encouraging AI tutor for Kaelyn's Academy, helping ${displayName} learn.

STUDENT PROFILE:
- Name: ${displayName}
- Grade Level: ${gradeDesc}
${topic ? `- Current Topic: ${topic}` : ""}

TUTORING GUIDELINES:
1. Use age-appropriate language and examples for a ${gradeDesc} student
2. Be encouraging and positive - celebrate small wins
3. Break complex concepts into smaller, digestible pieces
4. Use real-world examples relevant to a student this age
5. Ask guiding questions rather than giving answers directly (Socratic method)
6. If the student is struggling, try a different explanation approach
7. For younger students (K-2): Use simple words, lots of encouragement, fun examples
8. For middle grades (3-5): Build on prior knowledge, use relatable scenarios
9. For upper grades (6-8): Introduce more abstract concepts gradually
10. For high school (9-12): Connect to real-world applications and future relevance

RESPONSE FORMAT:
- Keep responses concise and focused
- Use markdown formatting when helpful
- Include visual descriptions when explaining spatial or complex concepts
- For math: Show step-by-step work when solving problems
- End with a question or activity to keep the student engaged

SAFETY GUIDELINES:
- Never discuss inappropriate topics for children
- Redirect any off-topic conversations back to learning
- If asked personal questions, politely redirect to the lesson
- Do not provide information about real individuals

Remember: You're not just teaching facts - you're building confidence and curiosity!`;
}

// POST /api/learner/tutor - Send a message and stream the response
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Apply rate limiting
  const rateLimitResult = await checkAiRateLimit(request, session.user.id);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const data = chatRequestSchema.parse(body);

    // Get learner for this user
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    if (!learner) {
      return new Response(JSON.stringify({ error: "Learner profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let conversationId = data.conversationId;
    let conversation;

    // Get or create conversation
    if (conversationId) {
      // Fetch existing conversation with ownership check
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
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      conversation = existingConv[0];

      if (conversation.status !== "active") {
        return new Response(JSON.stringify({ error: "Conversation is closed" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      // Create new conversation
      const [newConv] = await db
        .insert(tutoringConversations)
        .values({
          learnerId: learner.id,
          organizationId: learner.organizationId,
          lessonId: data.lessonId ?? null,
          conceptId: data.conceptId ?? null,
          topic: data.topic ?? null,
          provider: data.provider,
          model: null, // Will be set based on provider
          status: "active",
          startedAt: new Date(),
        })
        .returning();

      conversation = newConv;
      conversationId = newConv.id;
    }

    // Fetch previous messages for context
    const previousMessages = await db
      .select()
      .from(tutoringMessages)
      .where(eq(tutoringMessages.conversationId, conversationId))
      .orderBy(asc(tutoringMessages.createdAt));

    // Save user message to database
    const [userMessage] = await db
      .insert(tutoringMessages)
      .values({
        conversationId,
        role: "user",
        content: data.message,
      })
      .returning();

    // Update conversation updatedAt
    await db
      .update(tutoringConversations)
      .set({ updatedAt: new Date() })
      .where(eq(tutoringConversations.id, conversationId));

    // Build messages array for AI
    const systemMessage = buildSystemPrompt(
      learner.name,
      learner.gradeLevel,
      conversation.topic
    );

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      // Include previous messages for context
      ...previousMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: sanitizeText(m.content),
      })),
      // Add current user message
      {
        role: "user" as const,
        content: sanitizeText(data.message),
      },
    ];

    // Get model
    const model = getModel(data.provider as AIProvider, "balanced");

    // Track response for saving
    let fullResponse = "";
    const startTime = Date.now();

    // Stream the response
    const result = streamText({
      model,
      system: systemMessage,
      messages,
      maxOutputTokens: 1500,
      temperature: 0.7,
      onChunk({ chunk }) {
        if (chunk.type === "text-delta") {
          fullResponse += chunk.text;
        }
      },
      async onFinish({ usage }) {
        const processingTime = Date.now() - startTime;

        // Save assistant message to database
        await db.insert(tutoringMessages).values({
          conversationId: conversationId!,
          role: "assistant",
          content: fullResponse,
          inputTokens: usage?.inputTokens ?? null,
          outputTokens: usage?.outputTokens ?? null,
          metadata: {
            processingTime,
            model: data.provider,
          },
        });

        // Update conversation
        await db
          .update(tutoringConversations)
          .set({
            updatedAt: new Date(),
            model: data.provider,
          })
          .where(eq(tutoringConversations.id, conversationId!));
      },
    });

    // Create a custom response that includes the conversation ID
    const encoder = new TextEncoder();
    const stream = result.textStream;

    // Create readable stream that prepends conversation ID
    const transformedStream = new ReadableStream({
      async start(controller) {
        // Send conversation ID as first line (JSON metadata)
        const metadata = JSON.stringify({
          conversationId,
          userMessageId: userMessage.id,
        });
        controller.enqueue(encoder.encode(`data: ${metadata}\n\n`));
      },
      async pull(controller) {
        const reader = stream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(encoder.encode(value));
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": conversationId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Tutor chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
