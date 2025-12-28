import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/auth/redirect");
  }

  const role = session.user.role;

  if (!["teacher", "admin"].includes(role)) {
    redirect("/");
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Teacher Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/teacher" className="flex items-center gap-3">
                <Image
                  src="/icons/icon.svg"
                  alt="Kaelyn's Academy"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-role-teacher">
                  Teacher Dashboard
                </span>
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link
                  href="/teacher"
                  className="text-sm font-medium text-muted-foreground hover:text-role-teacher transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/teacher/classes"
                  className="text-sm font-medium text-muted-foreground hover:text-role-teacher transition-colors"
                >
                  My Classes
                </Link>
                <Link
                  href="/teacher/students"
                  className="text-sm font-medium text-muted-foreground hover:text-role-teacher transition-colors"
                >
                  Students
                </Link>
                <Link
                  href="/teacher/assignments"
                  className="text-sm font-medium text-muted-foreground hover:text-role-teacher transition-colors"
                >
                  Assignments
                </Link>
                <Link
                  href="/teacher/reports"
                  className="text-sm font-medium text-muted-foreground hover:text-role-teacher transition-colors"
                >
                  Reports
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
                  {session.user.name}
                </span>
                <span className="text-xs text-muted-foreground">Teacher</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-role-teacher/30">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-role-teacher text-role-teacher-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
