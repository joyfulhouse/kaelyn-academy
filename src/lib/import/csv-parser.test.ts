/**
 * CSV Parser Tests
 */

import { describe, it, expect } from "vitest";
import { parseCSV, validateRow, validators, generateTemplate } from "./csv-parser";

describe("parseCSV", () => {
  it("should parse simple CSV content", () => {
    const csv = `name,email,grade
John,john@test.com,5
Jane,jane@test.com,3`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.headers).toEqual(["name", "email", "grade"]);
    expect(result.data[0]).toEqual({ name: "John", email: "john@test.com", grade: "5" });
  });

  it("should handle quoted values", () => {
    const csv = `name,description
"John Smith","A student, grade 5"`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data[0].name).toBe("John Smith");
    expect(result.data[0].description).toBe("A student, grade 5");
  });

  it("should handle escaped quotes in quoted values", () => {
    const csv = `name,quote
John,"He said ""Hello""."`;

    const result = parseCSV(csv);

    expect(result.success).toBe(true);
    expect(result.data[0].quote).toBe('He said "Hello".');
  });

  it("should skip empty rows when configured", () => {
    const csv = `name,grade
John,5

Jane,3
`;

    const result = parseCSV(csv, { skipEmptyRows: true });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("should trim values when configured", () => {
    const csv = `name,grade
  John  ,  5  `;

    const result = parseCSV(csv, { trimValues: true });

    expect(result.data[0].name).toBe("John");
    expect(result.data[0].grade).toBe("5");
  });

  it("should report error for column count mismatch", () => {
    const csv = `name,email,grade
John,john@test.com
Jane,jane@test.com,3`;

    const result = parseCSV(csv);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("Column count mismatch");
    expect(result.errors[0].row).toBe(2);
  });

  it("should check for required headers", () => {
    const csv = `name,email
John,john@test.com`;

    const result = parseCSV(csv, { requiredHeaders: ["name", "grade"] });

    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain("Missing required header: grade");
  });

  it("should respect maxRows limit", () => {
    const csv = `name
Row1
Row2
Row3
Row4
Row5`;

    const result = parseCSV(csv, { maxRows: 3 });

    expect(result.data).toHaveLength(3);
    expect(result.errors.some((e) => e.message.includes("Maximum row limit"))).toBe(true);
  });

  it("should handle Windows line endings", () => {
    const csv = "name,grade\r\nJohn,5\r\nJane,3";

    const result = parseCSV(csv);

    expect(result.data).toHaveLength(2);
  });

  it("should handle empty file gracefully", () => {
    const result = parseCSV("");

    // Empty file has no data rows
    expect(result.data).toHaveLength(0);
    expect(result.totalRows).toBe(0);
  });
});

describe("validators", () => {
  it("should validate required fields", () => {
    const validate = validators.required("Name");

    expect(validate("John")).toBeNull();
    expect(validate("")).toBe("Name is required");
    expect(validate("   ")).toBe("Name is required");
  });

  it("should validate email format", () => {
    expect(validators.email("test@example.com")).toBeNull();
    expect(validators.email("invalid")).toBe("Invalid email format");
    expect(validators.email("")).toBeNull(); // Not required by default
  });

  it("should validate date format", () => {
    expect(validators.date("2024-01-15")).toBeNull();
    expect(validators.date("invalid")).toBe("Invalid date format");
    expect(validators.date("")).toBeNull();
  });

  it("should validate integer format", () => {
    expect(validators.integer("5")).toBeNull();
    expect(validators.integer("abc")).toBe("Must be a whole number");
    expect(validators.integer("")).toBeNull();
  });

  it("should validate grade level", () => {
    expect(validators.gradeLevel("0")).toBeNull(); // Kindergarten
    expect(validators.gradeLevel("12")).toBeNull(); // 12th grade
    expect(validators.gradeLevel("-1")).toBe("Grade must be 0 (K) to 12");
    expect(validators.gradeLevel("13")).toBe("Grade must be 0 (K) to 12");
    expect(validators.gradeLevel("abc")).toBe("Invalid grade level");
  });
});

describe("validateRow", () => {
  it("should validate row against schema", () => {
    const row = { name: "John", email: "invalid", grade: "5" };
    const errors = validateRow(row, 2, {
      name: validators.required("Name"),
      email: validators.email,
      grade: validators.gradeLevel,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].column).toBe("email");
  });

  it("should pass valid row", () => {
    const row = { name: "John", email: "john@test.com", grade: "5" };
    const errors = validateRow(row, 2, {
      name: validators.required("Name"),
      email: validators.email,
      grade: validators.gradeLevel,
    });

    expect(errors).toHaveLength(0);
  });
});

describe("generateTemplate", () => {
  it("should generate header-only template", () => {
    const template = generateTemplate(["name", "email", "grade"]);

    expect(template).toBe("name,email,grade");
  });

  it("should generate template with sample row", () => {
    const template = generateTemplate(
      ["name", "email", "grade"],
      { name: "John", email: "john@test.com", grade: "5" }
    );

    expect(template).toBe("name,email,grade\nJohn,john@test.com,5");
  });

  it("should escape values with commas", () => {
    const template = generateTemplate(
      ["name", "description"],
      { name: "John", description: "Student, Grade 5" }
    );

    expect(template).toContain('"Student, Grade 5"');
  });
});
