import { redirect } from "next/navigation";

/**
 * /learn route - redirects to /dashboard (the actual learner dashboard)
 * This provides a more intuitive URL while maintaining the existing route structure
 */
export default function LearnPage() {
  redirect("/dashboard");
}
