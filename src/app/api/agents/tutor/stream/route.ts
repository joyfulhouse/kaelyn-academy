import { NextRequest } from "next/server";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { getModel, type AIProvider } from "@/lib/ai/providers";
import { checkAiRateLimit } from "@/lib/rate-limit";

interface StreamRequest {
  learnerName: string;
  gradeLevel: number;
  subject: string;
  conceptName: string;
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  provider?: AIProvider;
}

function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten (age 5-6)";
  if (grade <= 2) return `${grade}${grade === 1 ? "st" : "nd"} grade (age ${grade + 5}-${grade + 6})`;
  if (grade === 3) return "3rd grade (age 8-9)";
  return `${grade}th grade (age ${grade + 5}-${grade + 6})`;
}

function buildSystemPrompt(gradeLevel: number, subject: string): string {
  const gradeDesc = getGradeLevelDescription(gradeLevel);

  return `You are a friendly, encouraging AI tutor helping a ${gradeDesc} student learn ${subject}.

Your teaching approach:
- Use age-appropriate language and explanations
- Be patient, supportive, and encouraging
- Break down complex concepts into simpler parts
- Use analogies and examples the student can relate to
- Guide with questions rather than giving direct answers when appropriate
- Celebrate small wins and progress
- If the student is struggling, try a different approach

Response guidelines:
- Keep responses concise but thorough
- Use simple vocabulary appropriate for the grade level
- Include practical examples when helpful
- End with encouragement or a follow-up question to keep them engaged
- Format your response with clear structure (use bullet points, numbered lists where helpful)`;
}

// POST /api/agents/tutor/stream - Stream tutoring response
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
    const body: StreamRequest = await request.json();
    const {
      learnerName,
      gradeLevel,
      subject,
      conceptName,
      message,
      conversationHistory = [],
      provider = "anthropic",
    } = body;

    // Build messages array
    const systemMessage = buildSystemPrompt(gradeLevel, subject);

    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      { role: "system", content: systemMessage },
      // Include conversation history
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      // Add current message with context
      {
        role: "user" as const,
        content: `Student: ${learnerName}
Topic: ${conceptName}

${message}`,
      },
    ];

    // Get the model
    const model = getModel(provider, "balanced");

    // Stream the response
    const result = streamText({
      model,
      messages,
      maxOutputTokens: 1500,
      temperature: 0.7,
    });

    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Streaming tutor error:", error);
    return new Response(JSON.stringify({ error: "Failed to stream response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
