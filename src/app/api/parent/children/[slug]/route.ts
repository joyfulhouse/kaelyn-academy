import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// GET - Get a specific child by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const { slug } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to check role
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch all children to find by slug
    const children = await db.query.learners.findMany({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
    });

    // Generate slugs and find matching child
    const allNames = children.map(c => c.name);

    for (const child of children) {
      const parts = child.name.toLowerCase().split(" ");
      const firstName = parts[0];
      const middleInitial = parts.length > 2 ? parts[1][0] : null;

      // Check for duplicate first names
      const sameFirstName = allNames.filter(n =>
        n.toLowerCase().startsWith(firstName + " ") && n !== child.name
      );

      const childSlug = sameFirstName.length > 0 && middleInitial
        ? `${firstName}-${middleInitial}`
        : firstName;

      if (childSlug === slug) {
        const age = child.dateOfBirth
          ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        return NextResponse.json({
          child: {
            ...child,
            slug: childSlug,
            age,
          },
        });
      }
    }

    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching child:", error);
    return NextResponse.json(
      { error: "Failed to fetch child" },
      { status: 500 }
    );
  }
}
