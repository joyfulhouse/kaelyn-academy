/**
 * Bulk Import Types
 *
 * Type definitions for the bulk import system.
 */

/**
 * Student record from CSV import
 */
export interface ImportStudent {
  firstName: string;
  lastName: string;
  email?: string;
  gradeLevel: number;
  dateOfBirth?: string;
  classId?: string;
  parentEmail?: string;
}

/**
 * Import job status
 */
export type ImportStatus =
  | "pending"
  | "validating"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Import job record
 */
export interface ImportJob {
  id: string;
  organizationId: string;
  createdById: string;
  status: ImportStatus;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportRowError[];
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Per-row import error
 */
export interface ImportRowError {
  row: number;
  field?: string;
  message: string;
  data?: Record<string, string>;
}

/**
 * Import result summary
 */
export interface ImportResult {
  jobId: string;
  status: ImportStatus;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportRowError[];
  createdLearners: string[];
  invitationsSent: number;
}

/**
 * Field mapping configuration
 */
export interface FieldMapping {
  csvColumn: string;
  targetField: keyof ImportStudent;
  required: boolean;
}

/**
 * Default field mappings for common CSV column names
 */
export const DEFAULT_FIELD_MAPPINGS: Record<string, keyof ImportStudent> = {
  "first name": "firstName",
  "first_name": "firstName",
  firstname: "firstName",
  "last name": "lastName",
  "last_name": "lastName",
  lastname: "lastName",
  email: "email",
  "student email": "email",
  grade: "gradeLevel",
  "grade level": "gradeLevel",
  "grade_level": "gradeLevel",
  dob: "dateOfBirth",
  "date of birth": "dateOfBirth",
  "date_of_birth": "dateOfBirth",
  birthdate: "dateOfBirth",
  class: "classId",
  "class id": "classId",
  "class_id": "classId",
  "parent email": "parentEmail",
  "parent_email": "parentEmail",
  "guardian email": "parentEmail",
};

/**
 * Required fields for student import
 */
export const REQUIRED_IMPORT_FIELDS: (keyof ImportStudent)[] = [
  "firstName",
  "lastName",
  "gradeLevel",
];

/**
 * Normalize CSV column name to field name
 */
export function normalizeColumnName(column: string): keyof ImportStudent | null {
  const normalized = column.toLowerCase().trim();
  return DEFAULT_FIELD_MAPPINGS[normalized] ?? null;
}

/**
 * Build header map from CSV headers
 */
export function buildHeaderMap(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};

  for (const header of headers) {
    const field = normalizeColumnName(header);
    if (field) {
      map[header] = field;
    }
  }

  return map;
}
