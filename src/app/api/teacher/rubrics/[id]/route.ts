import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  rubrics,
  rubricCriteria,
  rubricPerformanceLevels,
} from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role, organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher" ? user : null;
}

// Schema for performance level
const performanceLevelSchema = z.object({
  id: z.string().uuid().optional(), // Existing level ID for updates
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  points: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

// Schema for criterion
const criterionSchema = z.object({
  id: z.string().uuid().optional(), // Existing criterion ID for updates
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  maxPoints: z.number().int().min(1).max(1000).optional().default(25),
  weight: z.number().min(0.1).max(10).optional().default(1.0),
  sortOrder: z.number().int().min(0).optional(),
  performanceLevels: z.array(performanceLevelSchema).min(2),
});

// Schema for updating a rubric
const updateRubricSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  totalPoints: z.number().int().min(1).max(10000).optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  criteria: z.array(criterionSchema).min(1).optional(),
});

// GET /api/teacher/rubrics/[id] - Get a single rubric with all criteria and levels
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherInfo = await verifyTeacher(session.user.id);
  if (!teacherInfo) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    // Get the rubric
    const [rubric] = await db
      .select()
      .from(rubrics)
      .where(
        and(
          eq(rubrics.id, id),
          isNull(rubrics.deletedAt),
          eq(rubrics.teacherId, session.user.id)
        )
      );

    if (!rubric) {
      return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
    }

    // Get all criteria for this rubric
    const criteria = await db
      .select()
      .from(rubricCriteria)
      .where(eq(rubricCriteria.rubricId, id))
      .orderBy(asc(rubricCriteria.sortOrder));

    // Get all performance levels for all criteria
    const criterionIds = criteria.map((c) => c.id);
    const allLevels = criterionIds.length > 0
      ? await db
          .select()
          .from(rubricPerformanceLevels)
          .orderBy(asc(rubricPerformanceLevels.sortOrder))
      : [];

    // Filter and organize levels by criterion
    const levelsByCriterion = new Map<string, typeof allLevels>();
    for (const level of allLevels) {
      if (criterionIds.includes(level.criterionId)) {
        const existing = levelsByCriterion.get(level.criterionId) || [];
        existing.push(level);
        levelsByCriterion.set(level.criterionId, existing);
      }
    }

    // Build the complete rubric response
    const criteriaWithLevels = criteria.map((criterion) => ({
      ...criterion,
      performanceLevels: levelsByCriterion.get(criterion.id) || [],
    }));

    return NextResponse.json({
      rubric: {
        ...rubric,
        criteria: criteriaWithLevels,
      },
    });
  } catch (error) {
    console.error("Error fetching rubric:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubric" },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/rubrics/[id] - Update a rubric
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherInfo = await verifyTeacher(session.user.id);
  if (!teacherInfo) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    // Verify rubric exists and belongs to this teacher
    const [existingRubric] = await db
      .select()
      .from(rubrics)
      .where(
        and(
          eq(rubrics.id, id),
          isNull(rubrics.deletedAt),
          eq(rubrics.teacherId, session.user.id)
        )
      );

    if (!existingRubric) {
      return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = updateRubricSchema.parse(body);

    // Update the rubric
    const [updatedRubric] = await db
      .update(rubrics)
      .set({
        name: data.name ?? existingRubric.name,
        description: data.description ?? existingRubric.description,
        totalPoints: data.totalPoints ?? existingRubric.totalPoints,
        isTemplate: data.isTemplate ?? existingRubric.isTemplate,
        isPublic: data.isPublic ?? existingRubric.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(rubrics.id, id))
      .returning();

    // If criteria are provided, replace them all
    if (data.criteria) {
      // Delete existing criteria (cascade deletes performance levels)
      await db.delete(rubricCriteria).where(eq(rubricCriteria.rubricId, id));

      // Create new criteria and performance levels
      for (let i = 0; i < data.criteria.length; i++) {
        const criterion = data.criteria[i];

        const [newCriterion] = await db
          .insert(rubricCriteria)
          .values({
            rubricId: id,
            name: criterion.name,
            description: criterion.description,
            maxPoints: criterion.maxPoints,
            weight: criterion.weight,
            sortOrder: criterion.sortOrder ?? i,
          })
          .returning();

        // Create performance levels
        for (let j = 0; j < criterion.performanceLevels.length; j++) {
          const level = criterion.performanceLevels[j];

          await db.insert(rubricPerformanceLevels).values({
            criterionId: newCriterion.id,
            name: level.name,
            description: level.description,
            points: level.points,
            percentage: level.percentage,
            sortOrder: level.sortOrder ?? j,
          });
        }
      }
    }

    return NextResponse.json({ rubric: updatedRubric });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating rubric:", error);
    return NextResponse.json(
      { error: "Failed to update rubric" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/rubrics/[id] - Soft delete a rubric
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherInfo = await verifyTeacher(session.user.id);
  if (!teacherInfo) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    // Verify rubric exists and belongs to this teacher
    const [existingRubric] = await db
      .select()
      .from(rubrics)
      .where(
        and(
          eq(rubrics.id, id),
          isNull(rubrics.deletedAt),
          eq(rubrics.teacherId, session.user.id)
        )
      );

    if (!existingRubric) {
      return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
    }

    // Soft delete
    await db
      .update(rubrics)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rubrics.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rubric:", error);
    return NextResponse.json(
      { error: "Failed to delete rubric" },
      { status: 500 }
    );
  }
}
