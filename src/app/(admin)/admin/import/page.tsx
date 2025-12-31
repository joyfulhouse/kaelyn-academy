"use client";

import { StudentImport } from "@/components/admin/student-import";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-muted-foreground mt-1">
          Import students from CSV files into your organization
        </p>
      </div>

      <StudentImport />
    </div>
  );
}
