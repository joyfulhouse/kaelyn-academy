import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assignmentTemplates, assignments, classes } from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, or, isNull, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

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

// Schema for creating an assignment from template
const createFromTemplateSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1).max(255).optional(), // Override template name
  description: z.string().optional(), // Override template description
  instructions: z.string().optional(), // Override template instructions
  dueDate: z.string().datetime().optional(),
  totalPoints: z.number().int().min(0).max(10000).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  allowLateSubmissions: z.boolean().optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
});

// POST /api/teacher/templates/[id]/create-assignment - Create assignment from template
export async function POST(
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

  const { id: templateId } = await params;

  try {
    // Fetch the template with access check
    const conditions = [
      eq(assignmentTemplates.id, templateId),
      isNull(assignmentTemplates.deletedAt),
    ];

    if (user.organizationId) {
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
      conditions.push(
        or(
          eq(assignmentTemplates.teacherId, session.user.id),
          eq(assignmentTemplates.isPublic, true)
        )!
      );
    }

    const [template] = await db
      .select()
      .from(assignmentTemplates)
      .where(and(...conditions));

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = createFromTemplateSchema.parse(body);

    // Verify the teacher owns the class
    const [targetClass] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, data.classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!targetClass) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create the assignment from template
    const [newAssignment] = await db
      .insert(assignments)
      .values({
        classId: data.classId,
        teacherId: session.user.id,
        title: data.title || template.name,
        description: data.description ?? template.description,
        instructions: data.instructions ?? template.instructions,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        totalPoints: data.totalPoints ?? template.defaultTotalPoints ?? 100,
        passingScore: data.passingScore ?? template.defaultPassingScore ?? 70,
        allowLateSubmissions: data.allowLateSubmissions ?? template.defaultAllowLateSubmissions ?? true,
        maxAttempts: data.maxAttempts ?? template.defaultMaxAttempts ?? 1,
        lessonIds: template.lessonIds,
        activityIds: template.activityIds,
      })
      .returning();

    // Increment template usage count
    await db
      .update(assignmentTemplates)
      .set({
        usageCount: sql`${assignmentTemplates.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(assignmentTemplates.id, templateId));

    return NextResponse.json(
      {
        assignment: newAssignment,
        message: `Assignment "${newAssignment.title}" created from template "${template.name}"`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating assignment from template:", error);
    return NextResponse.json(
      { error: "Failed to create assignment from template" },
      { status: 500 }
    );
  }
}
