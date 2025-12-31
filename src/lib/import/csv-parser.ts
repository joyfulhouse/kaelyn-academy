/**
 * CSV Parser Utility
 *
 * Parses CSV files for bulk import operations.
 * Handles common edge cases and provides validation.
 */

export interface CSVParseResult<T> {
  success: boolean;
  data: T[];
  errors: CSVError[];
  headers: string[];
  totalRows: number;
  validRows: number;
}

export interface CSVError {
  row: number;
  column?: string;
  message: string;
  value?: string;
}

export interface CSVParseOptions {
  delimiter?: string;
  requiredHeaders?: string[];
  headerMap?: Record<string, string>; // Map CSV headers to normalized field names
  skipEmptyRows?: boolean;
  trimValues?: boolean;
  maxRows?: number;
}

const DEFAULT_OPTIONS: CSVParseOptions = {
  delimiter: ",",
  skipEmptyRows: true,
  trimValues: true,
  maxRows: 1000,
};

/**
 * Parse a CSV string into an array of objects
 */
export function parseCSV<T extends Record<string, string>>(
  content: string,
  options: CSVParseOptions = {}
): CSVParseResult<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: CSVError[] = [];
  const data: T[] = [];

  // Split into lines, handling different line endings
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  if (lines.length === 0) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, message: "File is empty" }],
      headers: [],
      totalRows: 0,
      validRows: 0,
    };
  }

  // Parse headers from first line
  const headerLine = lines[0];
  const rawHeaders = parseLine(headerLine, opts.delimiter!);
  const headers = opts.trimValues ? rawHeaders.map((h) => h.trim()) : rawHeaders;

  // Check for required headers
  if (opts.requiredHeaders) {
    const normalizedHeaders = headers.map((h) => h.toLowerCase());
    for (const required of opts.requiredHeaders) {
      if (!normalizedHeaders.includes(required.toLowerCase())) {
        errors.push({
          row: 1,
          column: required,
          message: `Missing required header: ${required}`,
        });
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      data: [],
      errors,
      headers,
      totalRows: lines.length - 1,
      validRows: 0,
    };
  }

  // Parse data rows
  let validRows = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty rows if configured
    if (opts.skipEmptyRows && line.trim() === "") {
      continue;
    }

    // Check max rows limit
    if (opts.maxRows && validRows >= opts.maxRows) {
      errors.push({
        row: i + 1,
        message: `Maximum row limit (${opts.maxRows}) exceeded`,
      });
      break;
    }

    const values = parseLine(line, opts.delimiter!);

    // Validate column count
    if (values.length !== headers.length) {
      errors.push({
        row: i + 1,
        message: `Column count mismatch: expected ${headers.length}, got ${values.length}`,
      });
      continue;
    }

    // Build row object
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const header = opts.headerMap?.[headers[j]] ?? headers[j];
      const value = opts.trimValues ? values[j].trim() : values[j];
      row[header] = value;
    }

    data.push(row as T);
    validRows++;
  }

  return {
    success: errors.length === 0,
    data,
    errors,
    headers,
    totalRows: lines.length - 1,
    validRows,
  };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // End of quoted value
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  // Push last value
  result.push(current);

  return result;
}

/**
 * Validate a parsed row against a schema
 */
export function validateRow<T extends Record<string, string>>(
  row: T,
  rowNumber: number,
  validators: Record<string, (value: string) => string | null>
): CSVError[] {
  const errors: CSVError[] = [];

  for (const [field, validate] of Object.entries(validators)) {
    const value = row[field] ?? "";
    const error = validate(value);
    if (error) {
      errors.push({
        row: rowNumber,
        column: field,
        message: error,
        value,
      });
    }
  }

  return errors;
}

// Common validators
export const validators = {
  required: (field: string) => (value: string) =>
    value.trim() === "" ? `${field} is required` : null,

  email: (value: string) => {
    if (value.trim() === "") return null; // Not required by default
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Invalid email format";
  },

  date: (value: string) => {
    if (value.trim() === "") return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid date format" : null;
  },

  integer: (value: string) => {
    if (value.trim() === "") return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? "Must be a whole number" : null;
  },

  gradeLevel: (value: string) => {
    if (value.trim() === "") return null;
    const grade = parseInt(value, 10);
    if (isNaN(grade)) return "Invalid grade level";
    if (grade < 0 || grade > 12) return "Grade must be 0 (K) to 12";
    return null;
  },
};

/**
 * Format errors for display
 */
export function formatErrors(errors: CSVError[]): string {
  return errors
    .map((e) => {
      const location = e.column ? `Row ${e.row}, Column "${e.column}"` : `Row ${e.row}`;
      return `${location}: ${e.message}${e.value ? ` (value: "${e.value}")` : ""}`;
    })
    .join("\n");
}

/**
 * Generate a sample CSV template
 */
export function generateTemplate(headers: string[], sampleRow?: Record<string, string>): string {
  const headerLine = headers.map(escapeCSVValue).join(",");

  if (!sampleRow) {
    return headerLine;
  }

  const dataLine = headers.map((h) => escapeCSVValue(sampleRow[h] ?? "")).join(",");
  return `${headerLine}\n${dataLine}`;
}

/**
 * Escape a value for CSV output
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
