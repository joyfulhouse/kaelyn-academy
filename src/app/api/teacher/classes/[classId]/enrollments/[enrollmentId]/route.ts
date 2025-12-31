import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { classes, classEnrollments } from "@/lib/db/schema/classroom";
import { eq, and, isNull } from "drizzle-orm";
import type { UnenrollStudentResponse } from "@/types/enrollment";

async function verifyClassOwnership(classId: string, teacherId: string) {
  const classData = await db
    .select()
    .from(classes)
    .where(
      and(
        eq(classes.id, classId),
        eq(classes.teacherId, teacherId),
        isNull(classes.deletedAt)
      )
    )
    .limit(1);

  return classData.length > 0 ? classData[0] : null;
}

// DELETE /api/teacher/classes/[classId]/enrollments/[enrollmentId] - Remove student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; enrollmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { classId, enrollmentId } = await params;

    // Verify class ownership
    const classData = await verifyClassOwnership(classId, session.user.id);
    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Verify enrollment exists and belongs to this class
    const enrollment = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.id, enrollmentId),
          eq(classEnrollments.classId, classId)
        )
      )
      .limit(1);

    if (enrollment.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Update status to withdrawn (soft delete)
    await db
      .update(classEnrollments)
      .set({ status: "withdrawn" })
      .where(eq(classEnrollments.id, enrollmentId));

    const response: UnenrollStudentResponse = {
      success: true,
      message: "Student removed from class",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error removing student:", error);
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    );
  }
}
