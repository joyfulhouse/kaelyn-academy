import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/auth/redirect");
  }

  const role = session.user.role;

  // Allow parents and admin roles access to parent dashboard
  const allowedRoles = ["parent", "admin", "platform_admin", "school_admin"];
  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Parent Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/parent" className="flex items-center gap-3">
                <Image
                  src="/icons/icon.svg"
                  alt="Kaelyn's Academy"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-role-parent">
                  Parent Portal
                </span>
              </Link>
              <nav className="hidden md:flex gap-4">
                <Link
                  href="/parent"
                  className="text-sm font-medium text-muted-foreground hover:text-role-parent transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/parent/children"
                  className="text-sm font-medium text-muted-foreground hover:text-role-parent transition-colors"
                >
                  Children
                </Link>
                <Link
                  href="/parent/reports"
                  className="text-sm font-medium text-muted-foreground hover:text-role-parent transition-colors"
                >
                  Reports
                </Link>
                <Link
                  href="/parent/messages"
                  className="text-sm font-medium text-muted-foreground hover:text-role-parent transition-colors"
                >
                  Messages
                </Link>
                <Link
                  href="/parent/approvals"
                  className="text-sm font-medium text-muted-foreground hover:text-role-parent transition-colors"
                >
                  Approvals
                </Link>
                <Link
                  href="/parent/settings"
                  className="text-sm font-medium text-muted-foreground hover:text-role-parent transition-colors"
                >
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
                  {session.user.name}
                </span>
                <span className="text-xs text-muted-foreground">Parent Account</span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-role-parent/30">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-role-parent text-role-parent-foreground">
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
