/**
 * Teacher Grading System Types
 * Types for assignment grading workflow
 */

/**
 * Submission status values matching database schema
 */
export type SubmissionStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded"
  | "late";

/**
 * Submission with learner information for display
 */
export interface SubmissionWithLearner {
  id: string;
  assignmentId: string;
  learner: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  submittedAt: Date | null;
  attemptNumber: number;
  score: number | null;
  percentageScore: number | null;
  feedback: string | null;
  gradedAt: Date | null;
  gradedBy: string | null;
  status: SubmissionStatus;
}

/**
 * Assignment details for grading context
 */
export interface AssignmentForGrading {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  totalPoints: number;
  passingScore: number | null;
  classId: string;
  className: string;
  dueDate: Date | null;
}

/**
 * Statistics for grading progress
 */
export interface GradingStats {
  total: number;
  submitted: number;
  graded: number;
  notStarted: number;
  late: number;
  avgScore: number | null;
  highScore: number | null;
  lowScore: number | null;
}

/**
 * Data for grading a single submission
 */
export interface GradeSubmissionData {
  score: number;
  feedback?: string;
  markAsGraded: boolean;
}

/**
 * Data for bulk grading multiple submissions
 */
export interface BulkGradeData {
  submissionIds: string[];
  score: number;
  feedback?: string;
}

/**
 * API response for submissions list
 */
export interface SubmissionsListResponse {
  assignment: AssignmentForGrading;
  submissions: SubmissionWithLearner[];
  stats: GradingStats;
}

/**
 * API response for single submission update
 */
export interface GradeSubmissionResponse {
  submission: SubmissionWithLearner;
}

/**
 * API response for bulk grading
 */
export interface BulkGradeResponse {
  updated: number;
  submissions: SubmissionWithLearner[];
}
