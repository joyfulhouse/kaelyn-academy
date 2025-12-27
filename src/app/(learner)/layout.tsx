import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LearnerSidebar } from "@/components/layouts/learner-sidebar";
import { LearnerHeader } from "@/components/layouts/learner-header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { eq, and, isNull } from "drizzle-orm";

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

  // Only learners and parents (viewing child's dashboard) can access
  if (!["learner", "parent"].includes(role)) {
    redirect("/");
  }

  // Fetch grade level from learner profile
  const learner = await db.query.learners.findFirst({
    where: and(
      eq(learners.userId, session.user.id),
      isNull(learners.deletedAt)
    ),
    columns: {
      gradeLevel: true,
    },
  });

  // Default to grade 5 if no learner profile exists yet
  const gradeLevel = learner?.gradeLevel ?? 5;

  return (
    <ThemeProvider defaultGradeLevel={gradeLevel}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <LearnerSidebar user={session.user} />
          <SidebarInset className="flex flex-col flex-1">
            <LearnerHeader user={session.user} />
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
