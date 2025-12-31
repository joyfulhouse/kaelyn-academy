import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignmentTemplates } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Template types
const TEMPLATE_TYPES = ["homework", "quiz", "project", "exam", "practice", "worksheet"] as const;

// Helper to verify teacher role and get organization
async function verifyTeacherWithOrg(userId: string) {
  const [user] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId));

  if (user?.role !== "teacher") {
    return null;
  }
  return user;
}

// GET /api/teacher/templates - Get all templates accessible by the teacher
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyTeacherWithOrg(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const sharedOnly = searchParams.get("shared") === "true";
    const myOnly = searchParams.get("my") === "true";

    // Build query conditions
    const conditions = [isNull(assignmentTemplates.deletedAt)];

    // Access control: own templates OR shared templates in org OR public templates
    if (myOnly) {
      conditions.push(eq(assignmentTemplates.teacherId, session.user.id));
    } else if (sharedOnly && user.organizationId) {
      conditions.push(
        and(
          eq(assignmentTemplates.organizationId, user.organizationId),
          eq(assignmentTemplates.isShared, true)
        )!
      );
    } else if (user.organizationId) {
      // Default: show own + shared in org + public
      conditions.push(
        or(
          eq(assignmentTemplates.teacherId, session.user.id),
          and(
            eq(assignmentTemplates.organizationId, user.organizationId),
            eq(assignmentTemplates.isShared, true)
          ),
          eq(assignmentTemplates.isPublic, true)
        )!
      );
    } else {
      // No org: only own templates + public
      conditions.push(
        or(
          eq(assignmentTemplates.teacherId, session.user.id),
          eq(assignmentTemplates.isPublic, true)
        )!
      );
    }

    // Filter by type if provided
    if (type && TEMPLATE_TYPES.includes(type as typeof TEMPLATE_TYPES[number])) {
      conditions.push(eq(assignmentTemplates.templateType, type));
    }

    const templates = await db
      .select()
      .from(assignmentTemplates)
      .where(and(...conditions))
      .orderBy(desc(assignmentTemplates.updatedAt));

    // Add ownership indicator
    const templatesWithOwnership = templates.map((template) => ({
      ...template,
      isOwn: template.teacherId === session.user.id,
    }));

    // Get summary stats
    const myTemplates = templatesWithOwnership.filter((t) => t.isOwn);
    const sharedTemplates = templatesWithOwnership.filter((t) => !t.isOwn && t.isShared);
    const publicTemplates = templatesWithOwnership.filter((t) => !t.isOwn && t.isPublic);

    return NextResponse.json({
      templates: templatesWithOwnership,
      summary: {
        total: templatesWithOwnership.length,
        my: myTemplates.length,
        shared: sharedTemplates.length,
        public: publicTemplates.length,
        byType: TEMPLATE_TYPES.reduce((acc, type) => {
          acc[type] = templatesWithOwnership.filter((t) => t.templateType === type).length;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// Schema for creating a template
const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  templateType: z.enum(TEMPLATE_TYPES).default("homework"),
  instructions: z.string().optional(),
  questions: z.string().optional(), // JSON string
  attachments: z.string().optional(), // JSON string
  defaultTimeLimit: z.number().int().min(1).max(600).optional().nullable(),
  defaultTotalPoints: z.number().int().min(0).max(10000).optional().default(100),
  defaultPassingScore: z.number().int().min(0).max(100).optional().default(70),
  defaultAllowLateSubmissions: z.boolean().optional().default(true),
  defaultMaxAttempts: z.number().int().min(1).max(10).optional().default(1),
  lessonIds: z.array(z.string().uuid()).optional(),
  activityIds: z.array(z.string().uuid()).optional(),
  isShared: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string().max(50)).optional(),
  gradeLevel: z.number().int().min(0).max(12).optional().nullable(),
  subjectId: z.string().uuid().optional().nullable(),
});

// POST /api/teacher/templates - Create a new template
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyTeacherWithOrg(session.user.id);
  if (!user || !user.organizationId) {
    return NextResponse.json({ error: "Forbidden - teacher with organization required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    const [newTemplate] = await db
      .insert(assignmentTemplates)
      .values({
        organizationId: user.organizationId,
        teacherId: session.user.id,
        name: data.name,
        description: data.description,
        templateType: data.templateType,
        instructions: data.instructions,
        questions: data.questions,
        attachments: data.attachments,
        defaultTimeLimit: data.defaultTimeLimit,
        defaultTotalPoints: data.defaultTotalPoints,
        defaultPassingScore: data.defaultPassingScore,
        defaultAllowLateSubmissions: data.defaultAllowLateSubmissions,
        defaultMaxAttempts: data.defaultMaxAttempts,
        lessonIds: data.lessonIds,
        activityIds: data.activityIds,
        isShared: data.isShared,
        isPublic: data.isPublic,
        tags: data.tags,
        gradeLevel: data.gradeLevel,
        subjectId: data.subjectId,
      })
      .returning();

    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
