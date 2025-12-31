import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignmentTemplates } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, or, isNull } from "drizzle-orm";
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

// Helper to check if user can access template
async function canAccessTemplate(
  templateId: string,
  userId: string,
  organizationId: string | null,
  requireOwnership = false
) {
  const conditions = [
    eq(assignmentTemplates.id, templateId),
    isNull(assignmentTemplates.deletedAt),
  ];

  if (requireOwnership) {
    // Only owner can modify
    conditions.push(eq(assignmentTemplates.teacherId, userId));
  } else if (organizationId) {
    // Can view if: own, shared in org, or public
    conditions.push(
      or(
        eq(assignmentTemplates.teacherId, userId),
        and(
          eq(assignmentTemplates.organizationId, organizationId),
          eq(assignmentTemplates.isShared, true)
        ),
        eq(assignmentTemplates.isPublic, true)
      )!
    );
  } else {
    // No org: only own or public
    conditions.push(
      or(
        eq(assignmentTemplates.teacherId, userId),
        eq(assignmentTemplates.isPublic, true)
      )!
    );
  }

  const [template] = await db
    .select()
    .from(assignmentTemplates)
    .where(and(...conditions));

  return template || null;
}

// GET /api/teacher/templates/[id] - Get a specific template
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyTeacherWithOrg(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const template = await canAccessTemplate(id, session.user.id, user.organizationId);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      template: {
        ...template,
        isOwn: template.teacherId === session.user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// Schema for updating a template
const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  templateType: z.enum(TEMPLATE_TYPES).optional(),
  instructions: z.string().optional().nullable(),
  questions: z.string().optional().nullable(),
  attachments: z.string().optional().nullable(),
  defaultTimeLimit: z.number().int().min(1).max(600).optional().nullable(),
  defaultTotalPoints: z.number().int().min(0).max(10000).optional(),
  defaultPassingScore: z.number().int().min(0).max(100).optional(),
  defaultAllowLateSubmissions: z.boolean().optional(),
  defaultMaxAttempts: z.number().int().min(1).max(10).optional(),
  lessonIds: z.array(z.string().uuid()).optional().nullable(),
  activityIds: z.array(z.string().uuid()).optional().nullable(),
  isShared: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().max(50)).optional().nullable(),
  gradeLevel: z.number().int().min(0).max(12).optional().nullable(),
  subjectId: z.string().uuid().optional().nullable(),
});

// PUT /api/teacher/templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyTeacherWithOrg(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Check ownership (only owner can edit)
    const template = await canAccessTemplate(id, session.user.id, user.organizationId, true);

    if (!template) {
      return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    const [updatedTemplate] = await db
      .update(assignmentTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(assignmentTemplates.id, id))
      .returning();

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/templates/[id] - Soft delete a template
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyTeacherWithOrg(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Check ownership (only owner can delete)
    const template = await canAccessTemplate(id, session.user.id, user.organizationId, true);

    if (!template) {
      return NextResponse.json({ error: "Template not found or unauthorized" }, { status: 404 });
    }

    // Soft delete
    await db
      .update(assignmentTemplates)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assignmentTemplates.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
