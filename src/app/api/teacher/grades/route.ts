import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  grades,
  gradeHistory,
  classes,
  classEnrollments,
  assignments,
} from "@/lib/db/schema/classroom";
import { users, learners } from "@/lib/db/schema/users";
import { eq, and, inArray, isNull, desc, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper to verify teacher role
async function verifyTeacher(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return user?.role === "teacher" || user?.role === "admin";
}

// Letter grade conversion
function calculateLetterGrade(percentage: number | null): string | null {
  if (percentage === null) return null;
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
}

// Schema for getting grades (query parameters)
const getGradesQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  learnerId: z.string().uuid().optional(),
  category: z.string().optional(),
  assignmentId: z.string().uuid().optional(),
});

// GET /api/teacher/grades - Get grades for teacher's classes (spreadsheet view)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = getGradesQuerySchema.parse({
      classId: searchParams.get("classId") ?? undefined,
      learnerId: searchParams.get("learnerId") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      assignmentId: searchParams.get("assignmentId") ?? undefined,
    });

    // Get all classes this teacher owns
    const teacherClasses = await db
      .select({ id: classes.id, name: classes.name, gradeLevel: classes.gradeLevel })
      .from(classes)
      .where(
        and(eq(classes.teacherId, session.user.id), isNull(classes.deletedAt))
      );

    // If a specific class is requested, filter to just that class
    let targetClassIds = teacherClasses.map((c) => c.id);
    if (query.classId) {
      if (!targetClassIds.includes(query.classId)) {
        return NextResponse.json(
          { error: "Class not found or unauthorized" },
          { status: 404 }
        );
      }
      targetClassIds = [query.classId];
    }

    if (targetClassIds.length === 0) {
      return NextResponse.json({
        grades: [],
        students: [],
        assignments: [],
        classes: [],
        summary: {
          totalGrades: 0,
          averageScore: null,
          totalStudents: 0,
        },
      });
    }

    // Get enrolled students for these classes
    const enrolledStudents = await db
      .select({
        enrollmentId: classEnrollments.id,
        classId: classEnrollments.classId,
        learnerId: classEnrollments.learnerId,
        learnerName: learners.name,
        learnerAvatar: learners.avatarUrl,
        gradeLevel: learners.gradeLevel,
      })
      .from(classEnrollments)
      .innerJoin(learners, eq(classEnrollments.learnerId, learners.id))
      .where(
        and(
          inArray(classEnrollments.classId, targetClassIds),
          eq(classEnrollments.status, "active"),
          isNull(learners.deletedAt)
        )
      )
      .orderBy(asc(learners.name));

    // If a specific learner is requested, filter
    let targetLearnerIds = enrolledStudents.map((s) => s.learnerId);
    if (query.learnerId) {
      if (!targetLearnerIds.includes(query.learnerId)) {
        return NextResponse.json(
          { error: "Student not found or not enrolled" },
          { status: 404 }
        );
      }
      targetLearnerIds = [query.learnerId];
    }

    // Get assignments for these classes
    const classAssignments = await db
      .select({
        id: assignments.id,
        classId: assignments.classId,
        title: assignments.title,
        dueDate: assignments.dueDate,
        totalPoints: assignments.totalPoints,
      })
      .from(assignments)
      .where(inArray(assignments.classId, targetClassIds))
      .orderBy(desc(assignments.dueDate));

    // Build query conditions for grades
    const gradeConditions = [inArray(grades.classId, targetClassIds)];
    if (query.learnerId) {
      gradeConditions.push(eq(grades.learnerId, query.learnerId));
    }
    if (query.category) {
      gradeConditions.push(eq(grades.category, query.category));
    }
    if (query.assignmentId) {
      gradeConditions.push(eq(grades.assignmentId, query.assignmentId));
    }

    // Get all grades for these classes/students
    const allGrades = await db
      .select({
        id: grades.id,
        classId: grades.classId,
        learnerId: grades.learnerId,
        teacherId: grades.teacherId,
        category: grades.category,
        name: grades.name,
        description: grades.description,
        pointsEarned: grades.pointsEarned,
        pointsPossible: grades.pointsPossible,
        percentage: grades.percentage,
        letterGrade: grades.letterGrade,
        weight: grades.weight,
        feedback: grades.feedback,
        dueDate: grades.dueDate,
        assignmentId: grades.assignmentId,
        gradedAt: grades.gradedAt,
        createdAt: grades.createdAt,
        updatedAt: grades.updatedAt,
      })
      .from(grades)
      .where(and(...gradeConditions))
      .orderBy(desc(grades.gradedAt));

    // Calculate summary stats
    const gradedItems = allGrades.filter((g) => g.pointsEarned !== null);
    const totalPercentages = gradedItems
      .map((g) => g.percentage)
      .filter((p): p is number => p !== null);
    const averageScore =
      totalPercentages.length > 0
        ? Math.round(
            totalPercentages.reduce((a, b) => a + b, 0) / totalPercentages.length
          )
        : null;

    // Group grades by student for spreadsheet view
    const gradesByStudent = new Map<
      string,
      { learner: (typeof enrolledStudents)[0]; grades: (typeof allGrades)[0][] }
    >();
    for (const student of enrolledStudents) {
      gradesByStudent.set(student.learnerId, {
        learner: student,
        grades: [],
      });
    }
    for (const grade of allGrades) {
      const studentData = gradesByStudent.get(grade.learnerId);
      if (studentData) {
        studentData.grades.push(grade);
      }
    }

    // Calculate per-student averages
    const studentsWithStats = enrolledStudents.map((student) => {
      const studentGrades = gradesByStudent.get(student.learnerId)?.grades ?? [];
      const studentPercentages = studentGrades
        .map((g) => g.percentage)
        .filter((p): p is number => p !== null);
      const studentAvg =
        studentPercentages.length > 0
          ? Math.round(
              studentPercentages.reduce((a, b) => a + b, 0) /
                studentPercentages.length
            )
          : null;
      return {
        ...student,
        averageScore: studentAvg,
        letterGrade: calculateLetterGrade(studentAvg),
        totalGrades: studentGrades.length,
        gradedCount: studentGrades.filter((g) => g.pointsEarned !== null).length,
      };
    });

    return NextResponse.json({
      grades: allGrades,
      students: studentsWithStats,
      assignments: classAssignments,
      classes: teacherClasses.filter((c) => targetClassIds.includes(c.id)),
      summary: {
        totalGrades: allGrades.length,
        averageScore,
        totalStudents: enrolledStudents.length,
        gradedCount: gradedItems.length,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

// Schema for creating a grade
const createGradeSchema = z.object({
  classId: z.string().uuid(),
  learnerId: z.string().uuid(),
  category: z.string().max(50).default("assignment"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  pointsEarned: z.number().min(0).nullable().optional(),
  pointsPossible: z.number().min(0).default(100),
  weight: z.number().min(0).default(1.0),
  feedback: z.string().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  assignmentId: z.string().uuid().optional(),
});

// POST /api/teacher/grades - Create a new grade entry
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = createGradeSchema.parse(body);

    // Verify teacher owns this class
    const [cls] = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.id, data.classId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify student is enrolled in the class
    const [enrollment] = await db
      .select()
      .from(classEnrollments)
      .where(
        and(
          eq(classEnrollments.classId, data.classId),
          eq(classEnrollments.learnerId, data.learnerId),
          eq(classEnrollments.status, "active")
        )
      );

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this class" },
        { status: 400 }
      );
    }

    // Calculate percentage and letter grade
    let percentage: number | null = null;
    let letterGrade: string | null = null;
    if (data.pointsEarned !== null && data.pointsEarned !== undefined) {
      percentage =
        data.pointsPossible > 0
          ? Math.round((data.pointsEarned / data.pointsPossible) * 100 * 100) /
            100
          : 0;
      letterGrade = calculateLetterGrade(percentage);
    }

    const [newGrade] = await db
      .insert(grades)
      .values({
        classId: data.classId,
        learnerId: data.learnerId,
        teacherId: session.user.id,
        category: data.category,
        name: data.name,
        description: data.description,
        pointsEarned: data.pointsEarned ?? null,
        pointsPossible: data.pointsPossible,
        percentage,
        letterGrade,
        weight: data.weight,
        feedback: data.feedback,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignmentId: data.assignmentId,
      })
      .returning();

    return NextResponse.json({ grade: newGrade }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "Failed to create grade" },
      { status: 500 }
    );
  }
}

// Schema for updating a grade
const updateGradeSchema = z.object({
  id: z.string().uuid(),
  pointsEarned: z.number().min(0).nullable().optional(),
  pointsPossible: z.number().min(0).optional(),
  feedback: z.string().max(5000).optional(),
  changeReason: z.string().max(500).optional(),
});

// PATCH /api/teacher/grades - Update an existing grade
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = updateGradeSchema.parse(body);

    // Get the existing grade and verify ownership
    const [existingGrade] = await db
      .select({
        grade: grades,
        class: classes,
      })
      .from(grades)
      .innerJoin(classes, eq(grades.classId, classes.id))
      .where(
        and(
          eq(grades.id, data.id),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!existingGrade) {
      return NextResponse.json(
        { error: "Grade not found or unauthorized" },
        { status: 404 }
      );
    }

    const pointsPossible =
      data.pointsPossible ?? existingGrade.grade.pointsPossible ?? 100;
    const pointsEarned =
      data.pointsEarned !== undefined
        ? data.pointsEarned
        : existingGrade.grade.pointsEarned;

    // Calculate new percentage and letter grade
    let percentage: number | null = null;
    let letterGrade: string | null = null;
    if (pointsEarned !== null) {
      percentage =
        pointsPossible > 0
          ? Math.round((pointsEarned / pointsPossible) * 100 * 100) / 100
          : 0;
      letterGrade = calculateLetterGrade(percentage);
    }

    // Record history if points or feedback changed
    const hasPointsChanged =
      data.pointsEarned !== undefined &&
      data.pointsEarned !== existingGrade.grade.pointsEarned;
    const hasFeedbackChanged =
      data.feedback !== undefined &&
      data.feedback !== existingGrade.grade.feedback;

    if (hasPointsChanged || hasFeedbackChanged) {
      await db.insert(gradeHistory).values({
        gradeId: data.id,
        changedBy: session.user.id,
        previousPointsEarned: existingGrade.grade.pointsEarned,
        previousLetterGrade: existingGrade.grade.letterGrade,
        previousFeedback: existingGrade.grade.feedback,
        newPointsEarned: pointsEarned,
        newLetterGrade: letterGrade,
        newFeedback: data.feedback ?? existingGrade.grade.feedback,
        changeReason: data.changeReason,
      });
    }

    // Update the grade
    const [updatedGrade] = await db
      .update(grades)
      .set({
        pointsEarned,
        pointsPossible,
        percentage,
        letterGrade,
        feedback: data.feedback ?? existingGrade.grade.feedback,
        gradedAt: pointsEarned !== null ? new Date() : existingGrade.grade.gradedAt,
        updatedAt: new Date(),
      })
      .where(eq(grades.id, data.id))
      .returning();

    return NextResponse.json({ grade: updatedGrade });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/grades - Delete a grade
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyTeacher(session.user.id))) {
    return NextResponse.json(
      { error: "Forbidden - teacher access required" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("id");

    if (!gradeId) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership via class
    const [existingGrade] = await db
      .select({
        grade: grades,
        class: classes,
      })
      .from(grades)
      .innerJoin(classes, eq(grades.classId, classes.id))
      .where(
        and(
          eq(grades.id, gradeId),
          eq(classes.teacherId, session.user.id),
          isNull(classes.deletedAt)
        )
      );

    if (!existingGrade) {
      return NextResponse.json(
        { error: "Grade not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the grade (history will cascade delete)
    await db.delete(grades).where(eq(grades.id, gradeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "Failed to delete grade" },
      { status: 500 }
    );
  }
}
