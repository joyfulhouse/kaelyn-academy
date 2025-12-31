import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Auth Redirect Page - Routes users to their role-specific dashboard
 * This page is used as the post-login callback URL
 */
export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  // Redirect to role-specific dashboard
  // Note: "platform_admin" and "school_admin" are the database roles for admin users
  switch (role) {
    case "learner":
      redirect("/dashboard");
    case "parent":
      redirect("/parent");
    case "teacher":
      redirect("/teacher");
    case "admin":
    case "platform_admin":
    case "school_admin":
      redirect("/admin");
    default:
      // Default to dashboard for unknown roles
      redirect("/dashboard");
  }
}
