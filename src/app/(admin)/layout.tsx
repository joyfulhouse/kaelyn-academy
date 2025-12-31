import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated and has admin role
  if (!session?.user) {
    redirect("/login?callbackUrl=/auth/redirect");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Admin Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3 text-xl font-bold text-foreground">
                <Image
                  src="/icons/icon.svg"
                  alt="Kaelyn's Academy"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                Admin Dashboard
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/admin/agents"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  AI Agents
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/curriculum"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Curriculum
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/admin/import"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Import
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{session.user.email}</span>
              <Link
                href="/"
                className="text-sm font-medium text-role-admin hover:text-role-admin/80 transition-colors"
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
