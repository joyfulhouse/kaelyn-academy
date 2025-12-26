import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requireLearnerAccess, AuthorizationError, type Role } from "@/lib/auth/rbac";
import {
  validateBody,
  validateQuery,
  ValidationError,
  learnerIdSchema,
  createLearnerSchema,
  paginationSchema,
} from "@/lib/validation";
import { z } from "zod";

// Query schema for GET
const getLearnerQuerySchema = z.object({
  id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Update schema for PATCH
const updateLearnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim().optional(),
  gradeLevel: z.number().int().min(0).max(12).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  preferences: z.object({
    favoriteSubjects: z.array(z.string()).optional(),
    learningStyle: z.enum(["visual", "auditory", "kinesthetic"]).optional(),
    readingLevel: z.string().optional(),
    mathLevel: z.string().optional(),
  }).optional(),
});

// GET /api/learners - Get learners (for parents/teachers)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = getLearnerQuerySchema.parse(params);

    const userId = session.user.id;
    const userRole = (session.user as { role?: Role }).role ?? "parent";
    const organizationId = (session.user as { organizationId?: string }).organizationId;

    if (query.id) {
      // Single learner request - verify access
      try {
        await requireLearnerAccess(query.id);
      } catch (error) {
        if (error instanceof AuthorizationError) {
          return error.toResponse();
        }
        throw error;
      }

      const learner = await db.query.learners.findFirst({
        where: eq(learners.id, query.id),
      });

      if (!learner) {
        return NextResponse.json({ error: "Learner not found" }, { status: 404 });
      }

      // Get their subject progress
      const progress = await db.query.learnerSubjectProgress.findMany({
        where: eq(learnerSubjectProgress.learnerId, query.id),
        with: {
          subject: true,
        },
      });

      return NextResponse.json({
        learner: {
          ...learner,
          progress,
        },
      });
    }

    // List learners - scoped by role
    let conditions = [];

    if (userRole === "admin") {
      // Admins can see all learners in their organization
      if (organizationId) {
        conditions.push(eq(learners.organizationId, organizationId));
      }
    } else if (userRole === "teacher") {
      // Teachers see learners in their organization
      if (organizationId) {
        conditions.push(eq(learners.organizationId, organizationId));
      } else {
        // No organization = no access
        return NextResponse.json({ learners: [] });
      }
    } else {
      // Parents see only their own children
      conditions.push(eq(learners.userId, userId));
    }

    const learnerList = await db.query.learners.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (learners, { desc }) => [desc(learners.createdAt)],
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
    });

    return NextResponse.json({ learners: learnerList });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError("Validation failed", error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }))).toResponse();
    }
    console.error("Error fetching learners:", error);
    return NextResponse.json(
      { error: "Failed to fetch learners" },
      { status: 500 }
    );
  }
}

// POST /api/learners - Create a new learner
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate request body
    const body = await validateBody(request, createLearnerSchema);

    const userId = session.user.id;
    const organizationId = (session.user as { organizationId?: string }).organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization required to create learner" },
        { status: 400 }
      );
    }

    // Parents can only create learners under their own userId
    // Admins can create learners under any userId
    const userRole = (session.user as { role?: Role }).role ?? "parent";
    if (userRole !== "admin" && body.userId !== userId) {
      return NextResponse.json(
        { error: "You can only create learners for yourself" },
        { status: 403 }
      );
    }

    const [newLearner] = await db
      .insert(learners)
      .values({
        userId: body.userId,
        organizationId,
        name: body.name,
        gradeLevel: body.gradeLevel,
        preferences: body.preferences,
      })
      .returning();

    return NextResponse.json({ learner: newLearner }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Error creating learner:", error);
    return NextResponse.json(
      { error: "Failed to create learner" },
      { status: 500 }
    );
  }
}

// PATCH /api/learners - Update learner
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Validate request body
    const body = await validateBody(request, updateLearnerSchema);

    // Verify access to this learner
    try {
      await requireLearnerAccess(body.id);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return error.toResponse();
      }
      throw error;
    }

    // Verify learner exists
    const existingLearner = await db.query.learners.findFirst({
      where: eq(learners.id, body.id),
    });

    if (!existingLearner) {
      return NextResponse.json({ error: "Learner not found" }, { status: 404 });
    }

    const [updatedLearner] = await db
      .update(learners)
      .set({
        name: body.name ?? existingLearner.name,
        gradeLevel: body.gradeLevel ?? existingLearner.gradeLevel,
        avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : existingLearner.avatarUrl,
        preferences: body.preferences ?? existingLearner.preferences,
        updatedAt: new Date(),
      })
      .where(eq(learners.id, body.id))
      .returning();

    return NextResponse.json({ learner: updatedLearner });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Error updating learner:", error);
    return NextResponse.json(
      { error: "Failed to update learner" },
      { status: 500 }
    );
  }
}
