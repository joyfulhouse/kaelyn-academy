/**
 * Report Types
 * Defines types for exportable reports
 */

export type ReportFormat = "pdf" | "csv" | "json" | "xlsx";

export type ReportType =
  | "progress"
  | "grades"
  | "attendance"
  | "activity"
  | "performance"
  | "curriculum";

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: ReportFilters;
  includeCharts?: boolean;
  includeDetails?: boolean;
}

export interface ReportFilters {
  studentIds?: string[];
  subjectIds?: string[];
  gradeLevel?: number;
  status?: "all" | "completed" | "in-progress" | "not-started";
}

export interface ReportMetadata {
  id: string;
  title: string;
  description: string;
  generatedAt: Date;
  generatedBy: string;
  type: ReportType;
  format: ReportFormat;
  recordCount: number;
  fileSize?: number;
}

// Progress Report Data
export interface ProgressReportData {
  student: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  subjects: SubjectProgress[];
  overallProgress: number;
  totalTimeSpent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  streak: number;
  lastActivity: Date;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  progress: number;
  grade: string;
  gradePoints: number;
  unitsCompleted: number;
  unitsTotal: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  timeSpent: number;
  averageScore: number;
  lastActivity: Date;
}

// Grades Report Data
export interface GradesReportData {
  student: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  reportingPeriod: {
    start: Date;
    end: Date;
    name: string;
  };
  subjects: SubjectGrade[];
  gpa: number;
  rank?: number;
  totalStudents?: number;
  comments?: string;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  letterGrade: string;
  percentageGrade: number;
  gradePoints: number;
  assessments: Assessment[];
  trend: "improving" | "stable" | "declining";
}

export interface Assessment {
  id: string;
  name: string;
  type: "quiz" | "test" | "project" | "homework" | "participation";
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
  date: Date;
  feedback?: string;
}

// Activity Report Data
export interface ActivityReportData {
  student: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  activities: ActivityEntry[];
  summary: ActivitySummary;
}

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  type: "lesson" | "quiz" | "practice" | "review" | "achievement";
  subjectId: string;
  subjectName: string;
  title: string;
  duration: number;
  score?: number;
  completed: boolean;
}

export interface ActivitySummary {
  totalActivities: number;
  totalDuration: number;
  averageDuration: number;
  activeDays: number;
  bySubject: Record<string, number>;
  byType: Record<string, number>;
  peakHours: number[];
}

// Performance Report Data
export interface PerformanceReportData {
  student: {
    id: string;
    name: string;
    gradeLevel: number;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: PerformanceMetrics;
  trends: PerformanceTrend[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  accuracy: number;
  consistency: number;
  speed: number;
  improvement: number;
  engagement: number;
  mastery: number;
}

export interface PerformanceTrend {
  date: Date;
  accuracy: number;
  speed: number;
  questionsAttempted: number;
}

// Curriculum Report Data
export interface CurriculumReportData {
  subject: {
    id: string;
    name: string;
  };
  gradeLevel: number;
  units: UnitCoverage[];
  totalLessons: number;
  totalDuration: number;
  standardsAlignment: StandardCoverage[];
}

export interface UnitCoverage {
  unitId: string;
  unitName: string;
  lessons: LessonCoverage[];
  totalDuration: number;
  standards: string[];
}

export interface LessonCoverage {
  lessonId: string;
  lessonName: string;
  duration: number;
  objectives: string[];
  assessmentType: string;
}

export interface StandardCoverage {
  standardId: string;
  standardName: string;
  lessons: string[];
  coverage: number;
}

// Report Result
export interface ReportResult {
  metadata: ReportMetadata;
  data: unknown;
  downloadUrl?: string;
  expiresAt?: Date;
}
