import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  rubrics,
  rubricCriteria,
  rubricPerformanceLevels,
} from "@/lib/db/schema/classroom";
import { users } from "@/lib/db/schema/users";
import { eq, and, isNull, desc } from "drizzle-orm";
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
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  points: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  sortOrder: z.number().int().min(0).optional(),
});

// Schema for criterion
const criterionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  maxPoints: z.number().int().min(1).max(1000).optional().default(25),
  weight: z.number().min(0.1).max(10).optional().default(1.0),
  sortOrder: z.number().int().min(0).optional(),
  performanceLevels: z.array(performanceLevelSchema).min(2),
});

// Schema for creating a rubric
const createRubricSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  totalPoints: z.number().int().min(1).max(10000).optional().default(100),
  isTemplate: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
  criteria: z.array(criterionSchema).min(1),
});

// GET /api/teacher/rubrics - Get all rubrics for the teacher
export async function GET() {
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
    // Get all rubrics for this teacher (and public templates in their org)
    const allRubrics = await db
      .select({
        id: rubrics.id,
        name: rubrics.name,
        description: rubrics.description,
        totalPoints: rubrics.totalPoints,
        isTemplate: rubrics.isTemplate,
        isPublic: rubrics.isPublic,
        teacherId: rubrics.teacherId,
        createdAt: rubrics.createdAt,
        updatedAt: rubrics.updatedAt,
      })
      .from(rubrics)
      .where(
        and(
          isNull(rubrics.deletedAt),
          eq(rubrics.teacherId, session.user.id)
        )
      )
      .orderBy(desc(rubrics.createdAt));

    // Get criteria counts for each rubric
    const rubricIds = allRubrics.map((r) => r.id);
    const criteriaCounts = rubricIds.length > 0
      ? await db
          .select({
            rubricId: rubricCriteria.rubricId,
          })
          .from(rubricCriteria)
          .where(
            rubricIds.length === 1
              ? eq(rubricCriteria.rubricId, rubricIds[0])
              : undefined
          )
      : [];

    // Count criteria per rubric
    const criteriaCountMap = new Map<string, number>();
    for (const c of criteriaCounts) {
      criteriaCountMap.set(c.rubricId, (criteriaCountMap.get(c.rubricId) || 0) + 1);
    }

    const rubricsWithCounts = allRubrics.map((rubric) => ({
      ...rubric,
      criteriaCount: criteriaCountMap.get(rubric.id) || 0,
    }));

    return NextResponse.json({
      rubrics: rubricsWithCounts,
      summary: {
        total: allRubrics.length,
        templates: allRubrics.filter((r) => r.isTemplate).length,
      },
    });
  } catch (error) {
    console.error("Error fetching rubrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubrics" },
      { status: 500 }
    );
  }
}

// POST /api/teacher/rubrics - Create a new rubric with criteria and performance levels
export async function POST(request: NextRequest) {
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

  if (!teacherInfo.organizationId) {
    return NextResponse.json(
      { error: "Teacher must belong to an organization" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = createRubricSchema.parse(body);

    // Calculate total points from criteria if not explicitly set
    const calculatedTotalPoints = data.criteria.reduce(
      (sum, c) => sum + (c.maxPoints || 25),
      0
    );

    // Create rubric
    const [newRubric] = await db
      .insert(rubrics)
      .values({
        organizationId: teacherInfo.organizationId,
        teacherId: session.user.id,
        name: data.name,
        description: data.description,
        totalPoints: data.totalPoints || calculatedTotalPoints,
        isTemplate: data.isTemplate,
        isPublic: data.isPublic,
      })
      .returning();

    // Create criteria and their performance levels
    for (let i = 0; i < data.criteria.length; i++) {
      const criterion = data.criteria[i];

      const [newCriterion] = await db
        .insert(rubricCriteria)
        .values({
          rubricId: newRubric.id,
          name: criterion.name,
          description: criterion.description,
          maxPoints: criterion.maxPoints,
          weight: criterion.weight,
          sortOrder: criterion.sortOrder ?? i,
        })
        .returning();

      // Create performance levels for this criterion
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

    return NextResponse.json({ rubric: newRubric }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating rubric:", error);
    return NextResponse.json(
      { error: "Failed to create rubric" },
      { status: 500 }
    );
  }
}
