import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { generateLessonContent, suggestLessonTopics } from "@/lib/ai";

const generateContentSchema = z.object({
  title: z.string().min(1).max(255),
  subject: z.string().min(1).max(100),
  gradeLevel: z.number().int().min(0).max(12),
  description: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  estimatedMinutes: z.number().int().min(1).max(180).optional(),
  difficultyLevel: z.number().int().min(1).max(5).optional(),
  includeVisualization: z.boolean().optional(),
});

const suggestTopicsSchema = z.object({
  subject: z.string().min(1).max(100),
  gradeLevel: z.number().int().min(0).max(12),
  unitTitle: z.string().optional(),
  existingTopics: z.array(z.string()).optional(),
});

// POST /api/admin/ai/generate-content - Generate AI lesson content
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === "suggest-topics") {
      const data = suggestTopicsSchema.parse(body);
      const suggestions = await suggestLessonTopics(
        data.subject,
        data.gradeLevel,
        data.unitTitle,
        data.existingTopics
      );
      return NextResponse.json({ suggestions });
    }

    // Default action: generate lesson content
    const data = generateContentSchema.parse(body);
    const content = await generateLessonContent(data);

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error generating AI content:", error);

    if (error instanceof Error && error.message.includes("No AI provider")) {
      return NextResponse.json(
        { error: "AI service not configured. Please set up an AI provider API key." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
