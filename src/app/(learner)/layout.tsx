import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LearnerSidebar } from "@/components/layouts/learner-sidebar";
import { LearnerHeader } from "@/components/layouts/learner-header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { learnerSubjectProgress, learnerAchievements } from "@/lib/db/schema/progress";
import { eq, and, isNull, sql } from "drizzle-orm";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/auth/redirect");
  }

  const role = session.user.role;

  // Learners, parents (viewing child's dashboard), and admins can access
  const allowedRoles = ["learner", "parent", "admin", "platform_admin", "school_admin"];
  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  // Fetch grade level and streak data from learner profile
  const learner = await db.query.learners.findFirst({
    where: and(
      eq(learners.userId, session.user.id),
      isNull(learners.deletedAt)
    ),
    columns: {
      id: true,
      gradeLevel: true,
    },
  });

  // Default to grade 5 if no learner profile exists yet
  const gradeLevel = learner?.gradeLevel ?? 5;

  // Fetch streak and achievements data
  let currentStreak = 0;
  let totalStars = 0;

  if (learner?.id) {
    // Get highest current streak across subjects
    const streakData = await db
      .select({
        maxStreak: sql<number>`COALESCE(MAX(${learnerSubjectProgress.currentStreak}), 0)::int`,
      })
      .from(learnerSubjectProgress)
      .where(eq(learnerSubjectProgress.learnerId, learner.id));

    currentStreak = streakData[0]?.maxStreak ?? 0;

    // Get total achievement points as "stars"
    const [starData] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(learnerAchievements)
      .where(eq(learnerAchievements.learnerId, learner.id));

    // Each achievement = 100 stars (simplified gamification)
    totalStars = (starData?.count ?? 0) * 100;
  }

  return (
    <ThemeProvider defaultGradeLevel={gradeLevel}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <LearnerSidebar user={session.user} />
          <SidebarInset className="flex flex-col flex-1">
            <LearnerHeader
              user={session.user}
              currentStreak={currentStreak}
              totalStars={totalStars}
            />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto px-4 py-6 lg:px-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
