import { redirect } from "next/navigation";

/**
 * School audit page redirects to the main audit-logs page
 * with the school filter pre-applied.
 */
export default function SchoolAuditPage() {
  redirect("/admin/audit-logs?scope=school");
}
