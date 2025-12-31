import { redirect } from "next/navigation";

/**
 * /learn/subjects route - redirects to /subjects (the actual subjects page)
 */
export default function LearnSubjectsPage() {
  redirect("/subjects");
}
