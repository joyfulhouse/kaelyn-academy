/**
 * TypeScript types for class enrollment management
 */

export type EnrollmentStatus = "active" | "completed" | "withdrawn";

export interface ClassEnrollment {
  id: string;
  classId: string;
  learnerId: string;
  enrolledAt: Date;
  completedAt: Date | null;
  status: EnrollmentStatus;
}

export interface EnrolledStudent {
  id: string;
  enrollmentId: string;
  name: string;
  gradeLevel: number;
  avatarUrl: string | null;
  enrolledAt: Date;
  status: EnrollmentStatus;
  progress: {
    overallProgress: number;
    masteryLevel: number;
  };
}

export interface AvailableStudent {
  id: string;
  name: string;
  gradeLevel: number;
  avatarUrl: string | null;
  parentName: string;
}

// API Request/Response types

export interface EnrollStudentRequest {
  learnerIds: string[];
}

export interface EnrollStudentResponse {
  enrollments: ClassEnrollment[];
  enrolled: number;
  alreadyEnrolled: number;
}

export interface UnenrollStudentResponse {
  success: boolean;
  message: string;
}

export interface AvailableStudentsResponse {
  students: AvailableStudent[];
  total: number;
}

export interface EnrolledStudentsResponse {
  students: EnrolledStudent[];
  total: number;
}
