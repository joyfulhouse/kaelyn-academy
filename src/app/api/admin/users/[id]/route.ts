import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, learners } from "@/lib/db/schema/users";
import { organizations } from "@/lib/db/schema/organizations";
import { learnerSubjectProgress } from "@/lib/db/schema/progress";
import { eq, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] - Get a single user with details
export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || (currentUser.role !== "platform_admin" && currentUser.role !== "school_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    // Get user with organization
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        organizationId: users.organizationId,
        organizationName: organizations.name,
        isAdult: users.isAdult,
        dateOfBirth: users.dateOfBirth,
        parentalConsentGiven: users.parentalConsentGiven,
        preferences: users.preferences,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .leftJoin(organizations, eq(users.organizationId, organizations.id))
      .where(eq(users.id, id));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get learners for this user if they are a parent
    let userLearners: Array<{
      id: string;
      name: string;
      gradeLevel: number;
      lastActivityAt: string | null;
    }> = [];

    if (user.role === "parent") {
      const learnerData = await db
        .select({
          id: learners.id,
          name: learners.name,
          gradeLevel: learners.gradeLevel,
          lastActivityAt: sql<string>`max(${learnerSubjectProgress.lastActivityAt})`,
        })
        .from(learners)
        .leftJoin(learnerSubjectProgress, eq(learners.id, learnerSubjectProgress.learnerId))
        .where(eq(learners.userId, user.id))
        .groupBy(learners.id, learners.name, learners.gradeLevel);

      userLearners = learnerData;
    }

    return NextResponse.json({
      user: {
        ...user,
        isActive: !user.deletedAt,
      },
      learners: userLearners,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Schema for updating a user
const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(["parent", "teacher", "school_admin", "platform_admin"]).optional(),
  organizationId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/users/[id] - Update a user
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json({ error: "Forbidden - only platform admins can update users" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    // Verify user exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (id === session.user.id) {
      const body = await request.json();
      if (body.isActive === false) {
        return NextResponse.json(
          { error: "Cannot deactivate your own account" },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Check if email already exists (if changing email)
    if (data.email) {
      const [emailExists] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, data.email), sql`${users.id} != ${id}`));

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.organizationId !== undefined) updateData.organizationId = data.organizationId;
    if (data.isActive !== undefined) {
      updateData.deletedAt = data.isActive ? null : new Date();
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Soft delete a user
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "platform_admin") {
    return NextResponse.json({ error: "Forbidden - only platform admins can delete users" }, { status: 403 });
  }

  const { id } = await context.params;

  // Prevent admin from deleting themselves
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    // Verify user exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete the user
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // Also soft delete their learners
    await db
      .update(learners)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(learners.userId, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
