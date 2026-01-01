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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Users,
  BookOpen,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface ExportJob {
  id: string;
  name: string;
  type: string;
  format: string;
  status: "completed" | "processing" | "queued";
  createdAt: string;
  size?: string;
}

export default function DataExportPage() {
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [format, setFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    { id: "1", name: "Student Roster Export", type: "students", format: "csv", status: "completed", createdAt: "2025-12-30", size: "2.4 MB" },
    { id: "2", name: "Progress Data Export", type: "progress", format: "xlsx", status: "completed", createdAt: "2025-12-28", size: "5.1 MB" },
    { id: "3", name: "Full Data Backup", type: "all", format: "json", status: "processing", createdAt: "2025-12-31" },
  ]);

  const dataTypes = [
    { id: "students", label: "Student Records", icon: Users, description: "Names, grades, contact info" },
    { id: "progress", label: "Learning Progress", icon: BookOpen, description: "Completion, scores, time spent" },
    { id: "assessments", label: "Assessment Results", icon: FileText, description: "Test scores, quiz results" },
    { id: "attendance", label: "Attendance Data", icon: Clock, description: "Login history, session data" },
    { id: "consent", label: "Consent Records", icon: Shield, description: "Parental consent forms" },
  ];

  const toggleDataType = (id: string) => {
    setSelectedData((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedData.length === 0) return;
    setExporting(true);

    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `Data Export - ${selectedData.join(", ")}`,
      type: selectedData.join(","),
      format,
      status: "completed",
      createdAt: new Date().toISOString(),
      size: "1.2 MB",
    };

    setExportJobs([newJob, ...exportJobs]);
    setSelectedData([]);
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground">
          Export student data for backup, migration, or compliance purposes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Data to Export</CardTitle>
              <CardDescription>
                Choose which data types to include in the export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {dataTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedData.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground"
                    }`}
                    onClick={() => toggleDataType(type.id)}
                  >
                    <Checkbox
                      checked={selectedData.includes(type.id)}
                      onCheckedChange={() => toggleDataType(type.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>
                Configure export format and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="year">This School Year</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Exported data may contain PII. Ensure proper handling per FERPA guidelines.
                </p>
              </div>

              <Button
                onClick={handleExport}
                disabled={selectedData.length === 0 || exporting}
                className="w-full"
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>
              Download previous exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{job.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === "completed" && (
                      <>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {job.size}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {job.status === "processing" && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
