import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { seedAchievements } from "@/lib/db/seeds/achievements";

/**
 * POST /api/admin/seed/achievements - Seed default achievements
 * Admin only endpoint to populate the achievements table
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is an admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
  }

  try {
    const result = await seedAchievements();

    return NextResponse.json({
      success: true,
      message: `Seeded achievements: ${result.created} created, ${result.skipped} skipped`,
      ...result,
    });
  } catch (error) {
    console.error("Error seeding achievements:", error);
    return NextResponse.json(
      { error: "Failed to seed achievements" },
      { status: 500 }
    );
  }
}
