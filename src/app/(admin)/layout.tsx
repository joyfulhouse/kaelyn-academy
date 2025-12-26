import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated and has admin role
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/admin/agents"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  AI Agents
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Users
                </Link>
                <Link
                  href="/admin/curriculum"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Curriculum
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <Link
                href="/"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Back to Site
              </Link>
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
