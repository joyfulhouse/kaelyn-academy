import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teacherStudentNotes } from "@/lib/db/schema/classroom";
import { users, learners } from "@/lib/db/schema/users";
import { eq, and, isNull, desc, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const noteSchema = z.object({
  learnerId: z.string().uuid(),
  title: z.string().max(255).optional(),
  content: z.string().min(1, "Note content is required"),
  category: z.enum(["general", "academic", "behavioral", "communication", "goals"]).default("general"),
  isPinned: z.boolean().default(false),
  isPrivate: z.boolean().default(true),
});

const updateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(255).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(["general", "academic", "behavioral", "communication", "goals"]).optional(),
  isPinned: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
});

/**
 * GET /api/teacher/notes - Get notes for a student
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is a teacher
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const learnerId = searchParams.get("learnerId");

    if (!learnerId) {
      return NextResponse.json({ error: "learnerId is required" }, { status: 400 });
    }

    // Get notes - either teacher's own notes or shared notes from other teachers
    const notes = await db
      .select({
        id: teacherStudentNotes.id,
        title: teacherStudentNotes.title,
        content: teacherStudentNotes.content,
        category: teacherStudentNotes.category,
        isPinned: teacherStudentNotes.isPinned,
        isPrivate: teacherStudentNotes.isPrivate,
        createdAt: teacherStudentNotes.createdAt,
        updatedAt: teacherStudentNotes.updatedAt,
        teacherId: teacherStudentNotes.teacherId,
        teacherName: users.name,
      })
      .from(teacherStudentNotes)
      .leftJoin(users, eq(teacherStudentNotes.teacherId, users.id))
      .where(
        and(
          eq(teacherStudentNotes.learnerId, learnerId),
          isNull(teacherStudentNotes.deletedAt),
          or(
            eq(teacherStudentNotes.teacherId, session.user.id),
            eq(teacherStudentNotes.isPrivate, false)
          )
        )
      )
      .orderBy(desc(teacherStudentNotes.isPinned), desc(teacherStudentNotes.createdAt));

    // Get learner info
    const [learner] = await db
      .select({ id: learners.id, name: learners.name })
      .from(learners)
      .where(eq(learners.id, learnerId));

    return NextResponse.json({
      notes: notes.map((note) => ({
        ...note,
        isOwner: note.teacherId === session.user.id,
      })),
      learner,
    });
  } catch (error) {
    console.error("Error fetching teacher notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/notes - Create a new note
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is a teacher
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || currentUser.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden - teacher access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = noteSchema.parse(body);

    // Verify learner exists
    const [learner] = await db
      .select({ id: learners.id })
      .from(learners)
      .where(and(eq(learners.id, data.learnerId), isNull(learners.deletedAt)));

    if (!learner) {
      return NextResponse.json({ error: "Learner not found" }, { status: 404 });
    }

    const [newNote] = await db
      .insert(teacherStudentNotes)
      .values({
        teacherId: session.user.id,
        learnerId: data.learnerId,
        title: data.title,
        content: data.content,
        category: data.category,
        isPinned: data.isPinned,
        isPrivate: data.isPrivate,
      })
      .returning();

    return NextResponse.json({ note: newNote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Error creating teacher note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teacher/notes - Update a note
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = updateNoteSchema.parse(body);

    // Verify note exists and belongs to the teacher
    const [existingNote] = await db
      .select({ id: teacherStudentNotes.id, teacherId: teacherStudentNotes.teacherId })
      .from(teacherStudentNotes)
      .where(
        and(
          eq(teacherStudentNotes.id, data.id),
          isNull(teacherStudentNotes.deletedAt)
        )
      );

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existingNote.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to edit this note" }, { status: 403 });
    }

    const updateData: Partial<{
      title: string | null;
      content: string;
      category: string;
      isPinned: boolean;
      isPrivate: boolean;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title || null;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

    const [updatedNote] = await db
      .update(teacherStudentNotes)
      .set(updateData)
      .where(eq(teacherStudentNotes.id, data.id))
      .returning();

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Error updating teacher note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/notes - Soft delete a note
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // Verify note exists and belongs to the teacher
    const [existingNote] = await db
      .select({ id: teacherStudentNotes.id, teacherId: teacherStudentNotes.teacherId })
      .from(teacherStudentNotes)
      .where(
        and(
          eq(teacherStudentNotes.id, noteId),
          isNull(teacherStudentNotes.deletedAt)
        )
      );

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existingNote.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this note" }, { status: 403 });
    }

    await db
      .update(teacherStudentNotes)
      .set({ deletedAt: new Date() })
      .where(eq(teacherStudentNotes.id, noteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting teacher note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
