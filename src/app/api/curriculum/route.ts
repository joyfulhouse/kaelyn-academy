import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjects, units, lessons, concepts } from "@/lib/db/schema/curriculum";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/auth/rbac";
import { ValidationError, validateBody } from "@/lib/validation";
import { z } from "zod";

// Query schema for GET
const curriculumQuerySchema = z.object({
  gradeLevel: z.coerce.number().int().min(0).max(12).optional(),
  subject: z.string().min(1).max(50).optional(),
  includeUnpublished: z.enum(["true", "false"]).optional(),
});

// GET /api/curriculum - Get curriculum structure
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
    const query = curriculumQuerySchema.parse(params);

    const gradeLevel = query.gradeLevel?.toString();
    const subjectSlug = query.subject;

    // Check permission to view unpublished content
    const userRole = (session.user as { role?: Role }).role ?? "learner";
    const canViewUnpublished = hasPermission(userRole, "write:class_content");
    const includeUnpublished = query.includeUnpublished === "true" && canViewUnpublished;
    // Get subjects
    const subjectList = await db.query.subjects.findMany({
      where: subjectSlug ? eq(subjects.slug, subjectSlug) : undefined,
      orderBy: [subjects.order],
    });

    if (subjectList.length === 0) {
      return NextResponse.json({ subjects: [] });
    }

    // Get units for each subject
    const curriculum = await Promise.all(
      subjectList.map(async (subject) => {
        const unitConditions = [eq(units.subjectId, subject.id)];

        if (gradeLevel) {
          unitConditions.push(eq(units.gradeLevel, parseInt(gradeLevel)));
        }
        if (!includeUnpublished) {
          unitConditions.push(eq(units.isPublished, true));
        }

        const subjectUnits = await db.query.units.findMany({
          where: and(...unitConditions),
          orderBy: [units.order],
          with: {
            lessons: {
              where: includeUnpublished ? undefined : eq(lessons.isPublished, true),
              orderBy: [lessons.order],
              with: {
                concepts: {
                  orderBy: [concepts.order],
                },
              },
            },
          },
        });

        return {
          ...subject,
          units: subjectUnits,
        };
      })
    );

    return NextResponse.json({ subjects: curriculum });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ValidationError("Validation failed", error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }))).toResponse();
    }
    console.error("Error fetching curriculum:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum" },
      { status: 500 }
    );
  }
}

// Schema for creating a subject
const createSubjectSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().max(1000).optional(),
  iconName: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional(),
  order: z.number().int().min(0).optional(),
});

// POST /api/curriculum - Create a new subject (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin permission
  const userRole = (session.user as { role?: Role }).role ?? "learner";
  if (!hasPermission(userRole, "manage:curriculum")) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await validateBody(request, createSubjectSchema);
    const { name, slug, description, iconName, color, order } = body;

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name,
        slug,
        description,
        iconName,
        color,
        order: order ?? 0,
        isDefault: true,
      })
      .returning();

    return NextResponse.json({ subject: newSubject }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.toResponse();
    }
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
