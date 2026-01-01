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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  BarChart3,
  Users,
  BookOpen,
  Shield,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: "attendance" | "progress" | "assessment" | "compliance" | "custom";
  format: "pdf" | "csv" | "xlsx";
  status: "ready" | "generating" | "scheduled";
  generatedAt?: string;
  scheduledFor?: string;
  size?: string;
}

export default function StateReportsPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "Annual Progress Report 2025",
      type: "progress",
      format: "pdf",
      status: "ready",
      generatedAt: "2025-12-30",
      size: "2.4 MB",
    },
    {
      id: "2",
      name: "Student Attendance Q4",
      type: "attendance",
      format: "xlsx",
      status: "ready",
      generatedAt: "2025-12-28",
      size: "1.2 MB",
    },
    {
      id: "3",
      name: "FERPA Compliance Audit",
      type: "compliance",
      format: "pdf",
      status: "ready",
      generatedAt: "2025-12-15",
      size: "856 KB",
    },
    {
      id: "4",
      name: "Assessment Results - Math",
      type: "assessment",
      format: "csv",
      status: "generating",
    },
    {
      id: "5",
      name: "Monthly Enrollment Report",
      type: "custom",
      format: "pdf",
      status: "scheduled",
      scheduledFor: "2026-01-01",
    },
  ]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const reportTemplates = [
    {
      id: "attendance",
      name: "Attendance Report",
      description: "Student attendance records and patterns",
      icon: Users,
    },
    {
      id: "progress",
      name: "Progress Report",
      description: "Academic progress and curriculum completion",
      icon: BarChart3,
    },
    {
      id: "assessment",
      name: "Assessment Report",
      description: "Test scores and assessment results",
      icon: BookOpen,
    },
    {
      id: "compliance",
      name: "Compliance Report",
      description: "FERPA, COPPA, and regulatory compliance",
      icon: Shield,
    },
  ];

  const handleGenerateReport = async (templateId: string) => {
    setGenerating(templateId);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerating(null);
    // Add new report to list
    setReports([
      {
        id: Date.now().toString(),
        name: `${reportTemplates.find((t) => t.id === templateId)?.name} - ${new Date().toLocaleDateString()}`,
        type: templateId as Report["type"],
        format: "pdf",
        status: "ready",
        generatedAt: new Date().toISOString(),
        size: "1.5 MB",
      },
      ...reports,
    ]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case "generating":
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Generating</Badge>;
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      attendance: "bg-purple-100 text-purple-800",
      progress: "bg-blue-100 text-blue-800",
      assessment: "bg-green-100 text-green-800",
      compliance: "bg-red-100 text-red-800",
      custom: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[type] || colors.custom}>{type}</Badge>;
  };

  const filteredReports = selectedType === "all"
    ? reports
    : reports.filter((r) => r.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">State & Compliance Reports</h1>
          <p className="text-muted-foreground">
            Generate reports for state requirements and compliance audits.
          </p>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid gap-4 md:grid-cols-4">
        {reportTemplates.map((template) => (
          <Card key={template.id} className="hover:border-primary cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <template.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={generating === template.id}
                  >
                    {generating === template.id ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-3 w-3" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report</CardTitle>
          <CardDescription>
            Generate a custom report for a specific date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="enrollment">Enrollment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Download previously generated reports
              </CardDescription>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{getTypeBadge(report.type)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">{report.format}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {report.generatedAt
                      ? new Date(report.generatedAt).toLocaleDateString()
                      : report.scheduledFor
                      ? `Scheduled: ${new Date(report.scheduledFor).toLocaleDateString()}`
                      : "-"}
                  </TableCell>
                  <TableCell>{report.size || "-"}</TableCell>
                  <TableCell className="text-right">
                    {report.status === "ready" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>
            Configure automatic report generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Weekly Attendance</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Every Monday at 6:00 AM
              </p>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Monthly Progress</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                1st of each month
              </p>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-red-500" />
                <h4 className="font-medium">Quarterly Compliance</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                End of each quarter
              </p>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
