"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  X,
  FileDown,
  FileUp,
} from "lucide-react";
import type { ImportResult } from "@/lib/import/types";

type ImportStep = "upload" | "preview" | "importing" | "complete";

interface PreviewData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; field?: string; message: string }>;
  preview: PreviewData;
}

interface ClassInfo {
  id: string;
  name: string;
}

interface StudentBulkActionsProps {
  classes: ClassInfo[];
  onImportComplete?: () => void;
}

export function StudentBulkActions({ classes, onImportComplete }: StudentBulkActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Bulk Actions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Student Actions
          </DialogTitle>
          <DialogDescription>
            Import students from CSV or export your student roster
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "import" | "export")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="gap-2">
              <FileUp className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-4">
            <StudentImportTab
              classes={classes}
              onComplete={() => {
                setDialogOpen(false);
                onImportComplete?.();
              }}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <StudentExportTab
              classes={classes}
              onClose={() => setDialogOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Import Tab Component
 */
function StudentImportTab({
  classes,
  onComplete,
}: {
  classes: ClassInfo[];
  onComplete: () => void;
}) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [sendInvitations, setSendInvitations] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      handleFileSelect(droppedFile);
    } else {
      setError("Please upload a CSV file");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setValidating(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim());

      if (lines.length === 0) {
        setError("File is empty");
        setValidating(false);
        return;
      }

      const headers = parseCSVLine(lines[0]);
      const rows: Record<string, string>[] = [];
      const errors: Array<{ row: number; field?: string; message: string }> = [];

      // Parse data rows (show first 10 in preview)
      for (let i = 1; i < lines.length && i <= 10; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || "";
        });
        rows.push(row);
      }

      // Basic validation
      const requiredHeaders = ["first name", "last name", "grade"];
      const lowerHeaders = headers.map((h) => h.toLowerCase());
      const missingRequired = requiredHeaders.filter(
        (req) => !lowerHeaders.some((h) => h.includes(req.split(" ")[0]))
      );

      if (missingRequired.length > 0) {
        errors.push({
          row: 1,
          message: "Missing required columns. Expected: First Name, Last Name, Grade Level",
        });
      }

      setValidation({
        valid: errors.length === 0,
        errors,
        preview: {
          headers,
          rows,
          totalRows: lines.length - 1,
        },
      });

      setStep("preview");
    } catch {
      setError("Failed to read file");
    } finally {
      setValidating(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    values.push(current.trim());
    return values;
  };

  const handleImport = async () => {
    if (!file) return;

    setStep("importing");
    setImporting(true);
    setImportProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedClass) {
        formData.append("classId", selectedClass);
      }
      formData.append("sendInvitations", sendInvitations.toString());

      setImportProgress(30);

      const response = await fetch("/api/teacher/students/import", {
        method: "POST",
        body: formData,
      });

      setImportProgress(70);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      setImportProgress(100);
      setImportResult(result);
      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/teacher/students/import");
      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student-import-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download template");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setValidation(null);
    setImportResult(null);
    setError(null);
    setSelectedClass("");
    setSendInvitations(false);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Step */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
              id="csv-upload"
            />
            <div className="flex flex-col items-center gap-4">
              {validating ? (
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
              ) : (
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              )}
              <div>
                <p className="text-lg font-medium text-foreground">
                  {validating ? "Processing file..." : "Drop your CSV file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={validating}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Need a template?</span>
            <Button variant="link" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-1" />
              Download CSV Template
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Required Columns</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- <strong>First Name</strong> - Student&apos;s first name</li>
              <li>- <strong>Last Name</strong> - Student&apos;s last name</li>
              <li>- <strong>Grade Level</strong> - 0 for Kindergarten, 1-12 for grades</li>
            </ul>
            <h4 className="font-medium text-sm mt-4">Optional Columns</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- <strong>Email</strong> - Student email (for older students)</li>
              <li>- <strong>Date of Birth</strong> - Format: YYYY-MM-DD</li>
              <li>- <strong>Parent Email</strong> - Parent/guardian email</li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === "preview" && validation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {validation.preview.totalRows} student{validation.preview.totalRows !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>

          {validation.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {validation.errors.map((err, idx) => (
                    <li key={idx}>
                      Row {err.row}: {err.message}
                      {err.field && ` (${err.field})`}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validation.valid && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle>Ready to Import</AlertTitle>
              <AlertDescription>
                All {validation.preview.totalRows} records passed validation
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 text-sm font-medium">
              Preview (first 10 rows)
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {validation.preview.headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validation.preview.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground">{idx + 2}</TableCell>
                      {validation.preview.headers.map((header) => (
                        <TableCell key={header}>{row[header] || "---"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Class selection */}
          {classes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="class-select">Assign to class (optional)</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No class</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="sendInvitations"
              checked={sendInvitations}
              onCheckedChange={(checked) => setSendInvitations(checked === true)}
            />
            <Label htmlFor="sendInvitations" className="text-sm">
              Send invitation emails to parents after import
            </Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!validation.valid || importing}
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {validation.preview.totalRows} Students
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Importing Step */}
      {step === "importing" && (
        <div className="space-y-4 py-8 text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
          <div>
            <p className="text-lg font-medium">Importing Students</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your file...
            </p>
          </div>
          <Progress value={importProgress} className="w-full max-w-md mx-auto" />
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && importResult && (
        <div className="space-y-6">
          <div className="text-center py-4">
            {importResult.failedRows === 0 ? (
              <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
            ) : (
              <AlertCircle className="h-16 w-16 mx-auto text-warning" />
            )}
            <h3 className="text-xl font-semibold mt-4">Import Complete</h3>
            <p className="text-muted-foreground">
              {importResult.successfulRows} of {importResult.totalRows} students imported successfully
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{importResult.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{importResult.successfulRows}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{importResult.failedRows}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
          </div>

          {importResult.errors.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
                Failed Records
              </div>
              <div className="max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell>{err.field || "---"}</TableCell>
                        <TableCell className="text-destructive">{err.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleReset}>
              Import More
            </Button>
            <Button onClick={onComplete}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Export Tab Component
 */
function StudentExportTab({
  classes,
  onClose,
}: {
  classes: ClassInfo[];
  onClose: () => void;
}) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [includeProgress, setIncludeProgress] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedClass) {
        params.append("classId", selectedClass);
      }
      params.append("includeProgress", includeProgress.toString());

      const response = await fetch(`/api/teacher/students/export?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Export failed");
      }

      // Get the filename from the Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      let filename = "students.csv";
      if (disposition) {
        const filenameMatch = disposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Export Options</CardTitle>
          <CardDescription>
            Choose what data to include in your export
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {/* Class filter */}
          <div className="space-y-2">
            <Label htmlFor="export-class">Filter by class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="export-class">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include progress checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeProgress"
              checked={includeProgress}
              onCheckedChange={(checked) => setIncludeProgress(checked === true)}
            />
            <Label htmlFor="includeProgress" className="text-sm">
              Include progress data (mastery, streak, time spent)
            </Label>
          </div>

          {/* Export preview info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Export will include:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Student name, grade level, date of birth</li>
              <li>- Class assignment and enrollment date</li>
              <li>- Active/inactive status</li>
              {includeProgress && (
                <>
                  <li>- Progress and mastery percentages</li>
                  <li>- Current streak and total time spent</li>
                  <li>- Recent activity count (last 7 days)</li>
                  <li>- Last active date</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
