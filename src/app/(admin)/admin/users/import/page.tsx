"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Users,
  ArrowRight,
} from "lucide-react";

interface ImportPreview {
  valid: number;
  invalid: number;
  total: number;
  rows: {
    row: number;
    email: string;
    name: string;
    role: string;
    status: "valid" | "invalid" | "duplicate";
    error?: string;
  }[];
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStep("preview");

    // Mock preview data - in real implementation, parse the CSV
    setPreview({
      valid: 45,
      invalid: 3,
      total: 48,
      rows: [
        { row: 1, email: "student1@school.edu", name: "John Smith", role: "learner", status: "valid" },
        { row: 2, email: "student2@school.edu", name: "Jane Doe", role: "learner", status: "valid" },
        { row: 3, email: "invalid-email", name: "Bad Entry", role: "learner", status: "invalid", error: "Invalid email format" },
        { row: 4, email: "teacher1@school.edu", name: "Mr. Johnson", role: "teacher", status: "valid" },
        { row: 5, email: "student1@school.edu", name: "Duplicate", role: "learner", status: "duplicate", error: "Email already exists" },
      ],
    });
  };

  const handleImport = async () => {
    setStep("importing");
    setImporting(true);
    setProgress(0);

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate import completion
    setTimeout(() => {
      setImporting(false);
      setStep("complete");
      setImportResult({
        success: 45,
        failed: 3,
        errors: [
          "Row 3: Invalid email format",
          "Row 5: Email already exists",
          "Row 12: Missing required field 'name'",
        ],
      });
    }, 5000);
  };

  const handleDownloadTemplate = () => {
    // Generate CSV template
    const headers = "email,name,role,organization_id";
    const example = "student@school.edu,John Smith,learner,org-uuid-here";
    const csvContent = `${headers}\n${example}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setProgress(0);
    setStep("upload");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk User Import</h1>
          <p className="text-muted-foreground">
            Import multiple users via CSV file. Upload, validate, and create accounts in bulk.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-primary text-white" : "bg-green-500 text-white"}`}>
            {step !== "upload" ? <CheckCircle className="h-4 w-4" /> : "1"}
          </div>
          <span className="font-medium">Upload</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step === "preview" ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === "preview" ? "bg-primary text-white" : step === "importing" || step === "complete" ? "bg-green-500 text-white" : "bg-muted"}`}>
            {step === "importing" || step === "complete" ? <CheckCircle className="h-4 w-4" /> : "2"}
          </div>
          <span className="font-medium">Preview</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${step === "importing" || step === "complete" ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === "complete" ? "bg-green-500 text-white" : step === "importing" ? "bg-primary text-white" : "bg-muted"}`}>
            {step === "complete" ? <CheckCircle className="h-4 w-4" /> : "3"}
          </div>
          <span className="font-medium">Import</span>
        </div>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing user data to import
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your CSV file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .csv files up to 10MB
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              </label>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">CSV Format Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• First row must contain column headers</li>
                <li>• Required columns: email, name, role</li>
                <li>• Optional columns: organization_id, grade_level</li>
                <li>• Valid roles: learner, parent, teacher</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {step === "preview" && preview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview Import</CardTitle>
                <CardDescription>
                  Review the data before importing
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={resetImport}>
                  Cancel
                </Button>
                <Button onClick={handleImport}>
                  <Users className="mr-2 h-4 w-4" />
                  Import {preview.valid} Users
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{preview.valid}</p>
                      <p className="text-sm text-muted-foreground">Valid entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{preview.invalid}</p>
                      <p className="text-sm text-muted-foreground">Invalid entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{preview.total}</p>
                      <p className="text-sm text-muted-foreground">Total rows</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>{row.row}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {row.status === "valid" && (
                        <Badge className="bg-green-100 text-green-800">Valid</Badge>
                      )}
                      {row.status === "invalid" && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Invalid</Badge>
                          <span className="text-sm text-muted-foreground">{row.error}</span>
                        </div>
                      )}
                      {row.status === "duplicate" && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Duplicate</Badge>
                          <span className="text-sm text-muted-foreground">{row.error}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Importing Step */}
      {step === "importing" && (
        <Card>
          <CardContent className="py-12">
            <div className="max-w-md mx-auto text-center">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Importing Users...</h3>
              <p className="text-muted-foreground mb-4">
                Please wait while we create the user accounts
              </p>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === "complete" && importResult && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{importResult.success}</p>
                      <p className="text-sm text-muted-foreground">Users created</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{importResult.failed}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResult.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={resetImport}>Import More Users</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
