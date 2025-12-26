import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/teacher");
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-violet-50">
      {/* Teacher Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/teacher" className="flex items-center gap-2">
                <span className="text-2xl">👩‍🏫</span>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </span>
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link
                  href="/teacher"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/teacher/classes"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  My Classes
                </Link>
                <Link
                  href="/teacher/students"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Students
                </Link>
                <Link
                  href="/teacher/assignments"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Assignments
                </Link>
                <Link
                  href="/teacher/reports"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Reports
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {session.user.name}
                </span>
                <span className="text-xs text-gray-500">Teacher</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-indigo-200">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
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
