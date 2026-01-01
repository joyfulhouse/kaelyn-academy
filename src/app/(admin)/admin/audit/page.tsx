import { redirect } from "next/navigation";

/**
 * Audit page redirects to the audit-logs page.
 * This maintains backwards compatibility with any existing links to /admin/audit.
 */
export default function AuditPage() {
  redirect("/admin/audit-logs");
}
