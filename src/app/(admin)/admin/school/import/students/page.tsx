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
  GraduationCap,
} from "lucide-react";

interface ImportPreview {
  valid: number;
  invalid: number;
  total: number;
  rows: {
    row: number;
    studentId: string;
    firstName: string;
    lastName: string;
    grade: string;
    email: string;
    status: "valid" | "invalid" | "duplicate";
    error?: string;
  }[];
}

export default function StudentImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "complete">("upload");
  const [gradeMapping, setGradeMapping] = useState<string>("auto");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStep("mapping");
  };

  const handleContinueToPreview = () => {
    // Mock preview data
    setPreview({
      valid: 145,
      invalid: 5,
      total: 150,
      rows: [
        { row: 1, studentId: "S001", firstName: "Emma", lastName: "Johnson", grade: "3", email: "ejohnson@school.edu", status: "valid" },
        { row: 2, studentId: "S002", firstName: "Liam", lastName: "Williams", grade: "3", email: "lwilliams@school.edu", status: "valid" },
        { row: 3, studentId: "S003", firstName: "Olivia", lastName: "Brown", grade: "4", email: "obrown@school.edu", status: "valid" },
        { row: 4, studentId: "", firstName: "Noah", lastName: "Davis", grade: "4", email: "", status: "invalid", error: "Missing student ID and email" },
        { row: 5, studentId: "S001", firstName: "Duplicate", lastName: "Student", grade: "3", email: "duplicate@school.edu", status: "duplicate", error: "Student ID already exists" },
      ],
    });
    setStep("preview");
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
        return prev + 5;
      });
    }, 200);

    setTimeout(() => {
      setImporting(false);
      setStep("complete");
      setImportResult({
        success: 145,
        failed: 5,
        errors: [
          "Row 4: Missing required field 'student_id'",
          "Row 4: Missing required field 'email'",
          "Row 5: Student ID 'S001' already exists",
        ],
      });
    }, 4000);
  };

  const handleDownloadTemplate = () => {
    const headers = "student_id,first_name,last_name,grade,email,parent_email,date_of_birth";
    const example = "S001,Emma,Johnson,3,ejohnson@school.edu,parent@email.com,2015-05-15";
    const csvContent = `${headers}\n${example}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_roster_template.csv";
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
          <h1 className="text-3xl font-bold">Student Roster Import</h1>
          <p className="text-muted-foreground">
            Bulk import students from CSV or SIS export files.
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {["upload", "mapping", "preview", "importing", "complete"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <div className={`flex items-center gap-2 ${step === s ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                (step === "complete" && i < 4) ||
                (step === "importing" && i < 3) ||
                (step === "preview" && i < 2) ||
                (step === "mapping" && i < 1)
                  ? "bg-green-500 text-white"
                  : step === s
                  ? "bg-primary text-white"
                  : "bg-muted"
              }`}>
                {(step === "complete" && i < 4) ||
                (step === "importing" && i < 3) ||
                (step === "preview" && i < 2) ||
                (step === "mapping" && i < 1) ? (
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
            <CardTitle>Upload Student Roster</CardTitle>
            <CardDescription>
              Select a CSV file containing student data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="roster-upload"
              />
              <label htmlFor="roster-upload" className="cursor-pointer">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your student roster here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .csv and .xlsx files from most SIS systems
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              </label>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Required Fields</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>student_id</code> - Unique student identifier</li>
                  <li>• <code>first_name</code> - Student's first name</li>
                  <li>• <code>last_name</code> - Student's last name</li>
                  <li>• <code>grade</code> - Grade level (K, 1-12)</li>
                  <li>• <code>email</code> - Student email address</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optional Fields</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>parent_email</code> - Parent contact email</li>
                  <li>• <code>date_of_birth</code> - DOB (YYYY-MM-DD)</li>
                  <li>• <code>homeroom</code> - Homeroom teacher</li>
                  <li>• <code>special_ed</code> - IEP/504 status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapping Step */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map your file columns to student fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {file?.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade Level Mapping</label>
                  <Select value={gradeMapping} onValueChange={setGradeMapping}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="numeric">Numeric (1-12)</SelectItem>
                      <SelectItem value="ordinal">Ordinal (1st, 2nd, etc.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Columns detected: student_id, first_name, last_name, grade, email, parent_email
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={resetImport}>
                Cancel
              </Button>
              <Button onClick={handleContinueToPreview}>
                Continue to Preview
              </Button>
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
                  Import {preview.valid} Students
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
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>{row.row}</TableCell>
                    <TableCell>{row.studentId || "-"}</TableCell>
                    <TableCell>{row.firstName} {row.lastName}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{row.email || "-"}</TableCell>
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
              <h3 className="text-xl font-medium mb-2">Importing Students...</h3>
              <p className="text-muted-foreground mb-4">
                Creating student accounts and sending welcome emails
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
                      <p className="text-sm text-muted-foreground">Students imported</p>
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
              <Button onClick={resetImport}>Import More Students</Button>
              <Button variant="outline" asChild>
                <a href="/admin/school/import/teachers">Import Teachers</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
