import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners, users } from "@/lib/db/schema";
import { learnerSubjectProgress, lessonProgress } from "@/lib/db/schema/progress";
import { subjects } from "@/lib/db/schema/curriculum";
import { eq, and, isNull, gte, sql } from "drizzle-orm";
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

    // Generate slugs and fetch progress for each child
    const allNames = children.map(c => c.name);

    // Get weekly activity for all children at once
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const childrenWithData = await Promise.all(children.map(async (child) => {
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

      // Fetch subject progress
      const subjectProgressData = await db
        .select({
          subjectName: subjects.name,
          masteryLevel: learnerSubjectProgress.masteryLevel,
          completedLessons: learnerSubjectProgress.completedLessons,
          totalLessons: learnerSubjectProgress.totalLessons,
        })
        .from(learnerSubjectProgress)
        .innerJoin(subjects, eq(subjects.id, learnerSubjectProgress.subjectId))
        .where(eq(learnerSubjectProgress.learnerId, child.id));

      // Calculate overall progress
      const overallProgress = subjectProgressData.length > 0
        ? Math.round(subjectProgressData.reduce((sum, sp) => sum + (sp.masteryLevel ?? 0), 0) / subjectProgressData.length)
        : 0;

      // Fetch weekly lessons for this child
      const weeklyLessons = await db
        .select({
          completedAt: lessonProgress.completedAt,
          timeSpent: lessonProgress.timeSpent,
        })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.learnerId, child.id),
            eq(lessonProgress.status, "completed"),
            gte(lessonProgress.completedAt, sevenDaysAgo)
          )
        );

      // Group weekly lessons by day
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyProgressMap = new Map<string, { minutes: number; lessons: number }>();

      // Initialize all days starting from 6 days ago
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weeklyProgressMap.set(dayNames[d.getDay()], { minutes: 0, lessons: 0 });
      }

      // Aggregate lesson data
      for (const lesson of weeklyLessons) {
        if (lesson.completedAt) {
          const dayName = dayNames[lesson.completedAt.getDay()];
          const existing = weeklyProgressMap.get(dayName) || { minutes: 0, lessons: 0 };
          existing.lessons += 1;
          existing.minutes += Math.round((lesson.timeSpent ?? 0) / 60);
          weeklyProgressMap.set(dayName, existing);
        }
      }

      // Convert to ordered array
      const weeklyActivity = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = dayNames[d.getDay()];
        const data = weeklyProgressMap.get(dayName) || { minutes: 0, lessons: 0 };
        weeklyActivity.push({ day: dayName, ...data });
      }

      return {
        ...child,
        slug,
        age: child.dateOfBirth
          ? Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        progress: {
          overallProgress,
          subjects: subjectProgressData.map(sp => ({
            subjectName: sp.subjectName,
            masteryLevel: Math.round(sp.masteryLevel ?? 0),
            completedLessons: sp.completedLessons ?? 0,
            totalLessons: sp.totalLessons ?? 0,
          })),
        },
        weeklyActivity,
        lastActive: child.lastActiveAt?.toISOString() || null,
      };
    }));

    return NextResponse.json({ children: childrenWithData });
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
