/**
 * Teacher Report PDF Generator
 * Generates formatted PDF reports for teacher class analytics
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface WeeklyProgress {
  week: string;
  progress: number;
  mastery: number;
}

interface SubjectPerformance {
  name: string;
  value: number;
  color: string;
}

interface StudentPerformance {
  name: string;
  progress: number;
  mastery: number;
  trend: "up" | "down" | "stable";
  status: "excelling" | "on-track" | "needs-attention" | "struggling";
}

interface AssignmentCompletion {
  completed: number;
  inProgress: number;
  notStarted: number;
}

export interface TeacherReportData {
  summary: {
    avgProgress: number;
    avgMastery: number;
    totalStudents: number;
    activeToday: number;
  };
  weeklyProgress: WeeklyProgress[];
  subjectPerformance: SubjectPerformance[];
  studentPerformance: StudentPerformance[];
  assignmentCompletion: AssignmentCompletion;
  className?: string;
  dateRange?: string;
}

interface ReportOptions {
  title?: string;
  subtitle?: string;
  teacherName?: string;
}

export function generateTeacherReportPDF(
  data: TeacherReportData,
  options: ReportOptions = {}
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(options.title || "Class Analytics Report", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    options.subtitle || `${data.className || "All Classes"} - ${data.dateRange || "Last 30 Days"}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  yPosition += 8;
  doc.setFontSize(10);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );

  if (options.teacherName) {
    yPosition += 6;
    doc.text(`Teacher: ${options.teacherName}`, pageWidth / 2, yPosition, { align: "center" });
  }

  // Summary Section
  yPosition += 15;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", 14, yPosition);

  yPosition += 8;
  const summaryData = [
    ["Total Students", data.summary.totalStudents.toString()],
    ["Active Today", data.summary.activeToday.toString()],
    ["Average Progress", `${data.summary.avgProgress}%`],
    ["Average Mastery", `${data.summary.avgMastery}%`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
    },
    tableWidth: 120,
    margin: { left: 14 },
  });

  // Subject Performance Table
  yPosition = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPosition + 50;
  yPosition += 15;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Subject Performance", 14, yPosition);

  if (data.subjectPerformance.length > 0) {
    yPosition += 5;
    const subjectData = data.subjectPerformance.map((subject) => [
      subject.name,
      `${subject.value}%`,
      getMasteryLabel(subject.value),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Subject", "Avg Mastery", "Level"]],
      body: subjectData,
      theme: "striped",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244],
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "center" },
        2: { halign: "center" },
      },
    });
  }

  // Assignment Status
  yPosition = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPosition + 50;
  yPosition += 15;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Assignment Status", 14, yPosition);

  const total = data.assignmentCompletion.completed +
    data.assignmentCompletion.inProgress +
    data.assignmentCompletion.notStarted;

  if (total > 0) {
    yPosition += 5;
    const assignmentData = [
      ["Completed", data.assignmentCompletion.completed.toString(), getPercentage(data.assignmentCompletion.completed, total)],
      ["In Progress", data.assignmentCompletion.inProgress.toString(), getPercentage(data.assignmentCompletion.inProgress, total)],
      ["Not Started", data.assignmentCompletion.notStarted.toString(), getPercentage(data.assignmentCompletion.notStarted, total)],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Status", "Count", "Percentage"]],
      body: assignmentData,
      theme: "striped",
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [255, 251, 235],
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "center" },
        2: { halign: "center" },
      },
      tableWidth: 120,
      margin: { left: 14 },
    });
  }

  // Check if we need a new page for student performance
  yPosition = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPosition + 50;
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  } else {
    yPosition += 15;
  }

  // Student Performance Table
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Student Performance", 14, yPosition);

  if (data.studentPerformance.length > 0) {
    yPosition += 5;
    const studentData = data.studentPerformance.map((student) => [
      student.name,
      `${student.progress}%`,
      `${student.mastery}%`,
      getTrendLabel(student.trend),
      getStatusLabel(student.status),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Student", "Progress", "Mastery", "Trend", "Status"]],
      body: studentData,
      theme: "striped",
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 243, 255],
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
      },
      didParseCell: function (hookData) {
        // Color code status column
        if (hookData.column.index === 4 && hookData.section === "body") {
          const status = hookData.cell.raw as string;
          if (status === "Excelling") {
            hookData.cell.styles.textColor = [16, 185, 129];
          } else if (status === "Struggling") {
            hookData.cell.styles.textColor = [239, 68, 68];
          } else if (status === "Needs Attention") {
            hookData.cell.styles.textColor = [245, 158, 11];
          }
        }
      },
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by Kaelyn's Academy | www.kaelyns.academy`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Download
  const className = data.className?.toLowerCase().replace(/\s+/g, "-") || "all-classes";
  const fileName = `teacher-report-${className}-${Date.now()}.pdf`;
  doc.save(fileName);
}

function getMasteryLabel(mastery: number): string {
  if (mastery >= 90) return "Excellent";
  if (mastery >= 75) return "Proficient";
  if (mastery >= 60) return "Developing";
  return "Needs Practice";
}

function getTrendLabel(trend: "up" | "down" | "stable"): string {
  switch (trend) {
    case "up":
      return "↑ Improving";
    case "down":
      return "↓ Declining";
    default:
      return "— Stable";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "excelling":
      return "Excelling";
    case "struggling":
      return "Struggling";
    case "needs-attention":
      return "Needs Attention";
    default:
      return "On Track";
  }
}

function getPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Export report data to CSV format
 */
export function exportTeacherReportCSV(
  data: TeacherReportData,
  options: { className?: string; dateRange?: string } = {}
): void {
  const lines: string[] = [];

  // Header
  lines.push(`"Class Analytics Report"`);
  lines.push(`"Class:","${options.className || "All Classes"}"`);
  lines.push(`"Period:","${options.dateRange || "Last 30 Days"}"`);
  lines.push(`"Generated:","${new Date().toLocaleString()}"`);
  lines.push("");

  // Summary Section
  lines.push(`"SUMMARY"`);
  lines.push(`"Metric","Value"`);
  lines.push(`"Total Students","${data.summary.totalStudents}"`);
  lines.push(`"Active Today","${data.summary.activeToday}"`);
  lines.push(`"Average Progress","${data.summary.avgProgress}%"`);
  lines.push(`"Average Mastery","${data.summary.avgMastery}%"`);
  lines.push("");

  // Subject Performance Section
  lines.push(`"SUBJECT PERFORMANCE"`);
  lines.push(`"Subject","Average Mastery","Level"`);
  data.subjectPerformance.forEach((subject) => {
    lines.push(`"${subject.name}","${subject.value}%","${getMasteryLabel(subject.value)}"`);
  });
  lines.push("");

  // Assignment Status Section
  const total = data.assignmentCompletion.completed +
    data.assignmentCompletion.inProgress +
    data.assignmentCompletion.notStarted;

  lines.push(`"ASSIGNMENT STATUS"`);
  lines.push(`"Status","Count","Percentage"`);
  lines.push(`"Completed","${data.assignmentCompletion.completed}","${getPercentage(data.assignmentCompletion.completed, total)}"`);
  lines.push(`"In Progress","${data.assignmentCompletion.inProgress}","${getPercentage(data.assignmentCompletion.inProgress, total)}"`);
  lines.push(`"Not Started","${data.assignmentCompletion.notStarted}","${getPercentage(data.assignmentCompletion.notStarted, total)}"`);
  lines.push("");

  // Student Performance Section
  lines.push(`"STUDENT PERFORMANCE"`);
  lines.push(`"Student","Progress","Mastery","Trend","Status"`);
  data.studentPerformance.forEach((student) => {
    lines.push(`"${student.name}","${student.progress}%","${student.mastery}%","${getTrendLabel(student.trend)}","${getStatusLabel(student.status)}"`);
  });
  lines.push("");

  // Weekly Progress Section
  lines.push(`"WEEKLY PROGRESS"`);
  lines.push(`"Week","Progress","Mastery"`);
  data.weeklyProgress.forEach((week) => {
    lines.push(`"${week.week}","${week.progress}%","${week.mastery}%"`);
  });

  // Create and download CSV
  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  const className = options.className?.toLowerCase().replace(/\s+/g, "-") || "all-classes";
  link.download = `teacher-report-${className}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

export default generateTeacherReportPDF;
