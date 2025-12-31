/**
 * Teacher Gradebook Types
 * Types for the spreadsheet-style gradebook view
 */

/**
 * Grade category types
 */
export type GradeCategory =
  | "assignment"
  | "homework"
  | "quiz"
  | "test"
  | "project"
  | "participation"
  | "extra_credit";

/**
 * Grade entry from the database
 */
export interface GradeEntry {
  id: string;
  classId: string;
  learnerId: string;
  teacherId: string;
  category: string;
  name: string;
  description: string | null;
  pointsEarned: number | null;
  pointsPossible: number;
  percentage: number | null;
  letterGrade: string | null;
  weight: number;
  feedback: string | null;
  dueDate: Date | null;
  assignmentId: string | null;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Student with enrollment info
 */
export interface EnrolledStudent {
  enrollmentId: string;
  classId: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string | null;
  gradeLevel: number;
}

/**
 * Student with calculated stats for gradebook view
 */
export interface StudentWithStats extends EnrolledStudent {
  averageScore: number | null;
  letterGrade: string | null;
  totalGrades: number;
  gradedCount: number;
}

/**
 * Assignment info for gradebook columns
 */
export interface AssignmentColumn {
  id: string;
  classId: string;
  title: string;
  dueDate: Date | null;
  totalPoints: number | null;
}

/**
 * Class info for gradebook
 */
export interface GradebookClass {
  id: string;
  name: string;
  gradeLevel: number;
}

/**
 * Summary statistics for the gradebook
 */
export interface GradebookSummary {
  totalGrades: number;
  averageScore: number | null;
  totalStudents: number;
  gradedCount: number;
}

/**
 * Full gradebook response from API
 */
export interface GradebookResponse {
  grades: GradeEntry[];
  students: StudentWithStats[];
  assignments: AssignmentColumn[];
  classes: GradebookClass[];
  summary: GradebookSummary;
}

/**
 * Cell data for spreadsheet view
 */
export interface GradebookCell {
  gradeId: string | null;
  learnerId: string;
  assignmentId: string | null;
  gradeName: string;
  pointsEarned: number | null;
  pointsPossible: number;
  percentage: number | null;
  letterGrade: string | null;
  feedback: string | null;
  isEditing: boolean;
}

/**
 * Row data for spreadsheet view (one per student)
 */
export interface GradebookRow {
  student: StudentWithStats;
  cells: Map<string, GradebookCell>; // Keyed by grade name or assignment ID
  overallGrade: number | null;
  overallLetterGrade: string | null;
}

/**
 * Column definition for spreadsheet
 */
export interface GradebookColumn {
  id: string; // Grade name or assignment ID
  name: string;
  type: "grade" | "assignment";
  pointsPossible: number;
  category: string;
  dueDate: Date | null;
  weight: number;
}

/**
 * Data for creating a new grade item
 */
export interface CreateGradeData {
  classId: string;
  learnerId: string;
  category?: string;
  name: string;
  description?: string;
  pointsEarned?: number | null;
  pointsPossible?: number;
  weight?: number;
  feedback?: string;
  dueDate?: string;
  assignmentId?: string;
}

/**
 * Data for updating a grade
 */
export interface UpdateGradeData {
  id: string;
  pointsEarned?: number | null;
  pointsPossible?: number;
  feedback?: string;
  changeReason?: string;
}

/**
 * Data for bulk grade updates
 */
export interface BulkUpdateGradeData {
  updates: Array<{
    id: string;
    pointsEarned: number | null;
    feedback?: string;
  }>;
  changeReason?: string;
}

/**
 * Data for bulk grade creation
 */
export interface BulkCreateGradeData {
  classId: string;
  category?: string;
  name: string;
  description?: string;
  pointsPossible?: number;
  weight?: number;
  dueDate?: string;
  assignmentId?: string;
  initialGrades?: Array<{
    learnerId: string;
    pointsEarned: number | null;
    feedback?: string;
  }>;
}

/**
 * Grade history entry
 */
export interface GradeHistoryEntry {
  id: string;
  gradeId: string;
  changedBy: string;
  changedByName: string | null;
  previousPointsEarned: number | null;
  previousLetterGrade: string | null;
  previousFeedback: string | null;
  newPointsEarned: number | null;
  newLetterGrade: string | null;
  newFeedback: string | null;
  changeReason: string | null;
  changedAt: Date;
}

/**
 * Response for grade history API
 */
export interface GradeHistoryResponse {
  grade: {
    id: string;
    name: string;
    category: string;
    pointsEarned: number | null;
    pointsPossible: number | null;
    letterGrade: string | null;
  };
  history: GradeHistoryEntry[];
}
