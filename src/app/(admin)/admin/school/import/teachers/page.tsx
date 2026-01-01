"use client";

import { useState } from "react";
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
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

interface ImportPreview {
  valid: number;
  invalid: number;
  total: number;
  rows: {
    row: number;
    teacherId: string;
    firstName: string;
    lastName: string;
    email: string;
    subjects: string;
    status: "valid" | "invalid" | "duplicate";
    error?: string;
  }[];
}

export default function TeacherImportPage() {
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

    // Mock preview data
    setPreview({
      valid: 22,
      invalid: 2,
      total: 24,
      rows: [
        { row: 1, teacherId: "T001", firstName: "Sarah", lastName: "Miller", email: "smiller@school.edu", subjects: "Math, Science", status: "valid" },
        { row: 2, teacherId: "T002", firstName: "Michael", lastName: "Chen", email: "mchen@school.edu", subjects: "English", status: "valid" },
        { row: 3, teacherId: "T003", firstName: "Jennifer", lastName: "Wilson", email: "jwilson@school.edu", subjects: "History", status: "valid" },
        { row: 4, teacherId: "", firstName: "Invalid", lastName: "Teacher", email: "", subjects: "", status: "invalid", error: "Missing teacher ID and email" },
        { row: 5, teacherId: "T001", firstName: "Duplicate", lastName: "Entry", email: "dup@school.edu", subjects: "Math", status: "duplicate", error: "Teacher ID already exists" },
      ],
    });
  };

  const handleImport = async () => {
    setStep("importing");
    setImporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setImporting(false);
      setStep("complete");
      setImportResult({
        success: 22,
        failed: 2,
        errors: [
          "Row 4: Missing required field 'teacher_id'",
          "Row 5: Teacher ID 'T001' already exists",
        ],
      });
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    const headers = "teacher_id,first_name,last_name,email,subjects,grade_levels";
    const example = "T001,Sarah,Miller,smiller@school.edu,\"Math, Science\",\"3,4,5\"";
    const csvContent = `${headers}\n${example}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teacher_roster_template.csv";
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
          <h1 className="text-3xl font-bold">Teacher Import</h1>
          <p className="text-muted-foreground">
            Bulk import teachers and staff from CSV files.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {["upload", "preview", "importing", "complete"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <div className={`flex items-center gap-2 ${step === s ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                (step === "complete" && i < 3) ||
                (step === "importing" && i < 2) ||
                (step === "preview" && i < 1)
                  ? "bg-green-500 text-white"
                  : step === s
                  ? "bg-primary text-white"
                  : "bg-muted"
              }`}>
                {(step === "complete" && i < 3) ||
                (step === "importing" && i < 2) ||
                (step === "preview" && i < 1) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span className="font-medium capitalize hidden md:inline">{s}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Teacher Roster</CardTitle>
            <CardDescription>
              Select a CSV file containing teacher data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="teacher-upload"
              />
              <label htmlFor="teacher-upload" className="cursor-pointer">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your teacher roster here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .csv and .xlsx files
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
                <li>• Required columns: teacher_id, first_name, last_name, email</li>
                <li>• Optional: subjects, grade_levels, department, hire_date</li>
                <li>• Use comma-separated lists for multiple values</li>
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
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Import {preview.valid} Teachers
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>{row.row}</TableCell>
                    <TableCell>{row.teacherId || "-"}</TableCell>
                    <TableCell>{row.firstName} {row.lastName}</TableCell>
                    <TableCell>{row.email || "-"}</TableCell>
                    <TableCell>{row.subjects || "-"}</TableCell>
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
              <h3 className="text-xl font-medium mb-2">Importing Teachers...</h3>
              <p className="text-muted-foreground mb-4">
                Creating teacher accounts and sending welcome emails
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
                      <p className="text-sm text-muted-foreground">Teachers imported</p>
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

            <div className="flex gap-4">
              <Button onClick={resetImport}>Import More Teachers</Button>
              <Button variant="outline" asChild>
                <a href="/admin/school/teachers">Manage Teachers</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
