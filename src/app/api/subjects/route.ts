import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, or, isNull, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/subjects - Get all available subjects
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the user's organization
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    // Get default subjects (isDefault = true, organizationId = null)
    // and organization-specific subjects
    const allSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        description: subjects.description,
        iconName: subjects.iconName,
        color: subjects.color,
        order: subjects.order,
        isDefault: subjects.isDefault,
      })
      .from(subjects)
      .where(
        or(
          eq(subjects.isDefault, true),
          user?.organizationId ? eq(subjects.organizationId, user.organizationId) : isNull(subjects.organizationId)
        )
      )
      .orderBy(asc(subjects.order), asc(subjects.name));

    return NextResponse.json({ subjects: allSubjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
