import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

// Schema for creating a child
const createChildSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  birthYear: z.string().min(1, "Birth year is required"),
});

// GET - List all children for the current parent
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check role and organization
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch all children for this parent
    const children = await db.query.learners.findMany({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      orderBy: (learners, { asc }) => [asc(learners.name)],
    });

    // Generate slugs for each child
    const allNames = children.map(c => c.name);
    const childrenWithSlugs = children.map(child => {
      const parts = child.name.toLowerCase().split(" ");
      const firstName = parts[0];
      const middleInitial = parts.length > 2 ? parts[1][0] : null;

      // Check for duplicate first names
      const sameFirstName = allNames.filter(n =>
        n.toLowerCase().startsWith(firstName + " ") && n !== child.name
      );

      const slug = sameFirstName.length > 0 && middleInitial
        ? `${firstName}-${middleInitial}`
        : firstName;

      return {
        ...child,
        slug,
        age: child.dateOfBirth
          ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
      };
    });

    return NextResponse.json({ children: childrenWithSlugs });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

// POST - Create a new child
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check role and organization
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "User not associated with an organization" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = createChildSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { firstName, middleName, lastName, gradeLevel, birthYear } = parsed.data;

    // Build full name
    const fullName = middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;

    // Check for duplicate names under this parent
    const existingChildren = await db.query.learners.findMany({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    const duplicateName = existingChildren.find(
      c => c.name.toLowerCase() === fullName.toLowerCase()
    );

    if (duplicateName) {
      return NextResponse.json(
        { error: "A child with this name already exists" },
        { status: 400 }
      );
    }

    // Check if duplicate first name requires middle name
    const duplicateFirstName = existingChildren.find(
      c => c.name.toLowerCase().split(" ")[0] === firstName.toLowerCase()
    );

    if (duplicateFirstName && !middleName) {
      return NextResponse.json(
        { error: "Another child has this first name. Please add a middle name." },
        { status: 400 }
      );
    }

    // Convert grade level
    const grade = gradeLevel === "K" ? 0 : parseInt(gradeLevel, 10);

    // Calculate birth date from year
    const birthDate = new Date(`${birthYear}-06-01`); // Approximate mid-year

    // Create the learner
    const [newChild] = await db
      .insert(learners)
      .values({
        userId: session.user.id,
        organizationId: user.organizationId,
        name: fullName,
        gradeLevel: grade,
        dateOfBirth: birthDate,
        isActive: true,
        parentalControls: {
          screenTimeLimit: 60, // Default 60 minutes
          allowedSubjects: ["math", "reading", "science", "history"],
          blockedContent: [],
          requireParentApproval: false,
        },
      })
      .returning();

    // Generate slug
    const allNames = existingChildren.map(c => c.name);
    allNames.push(fullName);
    const parts = fullName.toLowerCase().split(" ");
    const firstNameLower = parts[0];
    const middleInitialLower = parts.length > 2 ? parts[1][0] : null;

    const sameFirstName = allNames.filter(n =>
      n.toLowerCase().startsWith(firstNameLower + " ") && n !== fullName
    );

    const slug = sameFirstName.length > 0 && middleInitialLower
      ? `${firstNameLower}-${middleInitialLower}`
      : firstNameLower;

    return NextResponse.json({
      child: {
        ...newChild,
        slug,
      },
    });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}
