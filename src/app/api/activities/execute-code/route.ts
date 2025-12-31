import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

/**
 * Schema for code execution request
 */
const codeExecutionSchema = z.object({
  code: z.string().max(50000), // Max 50KB of code
  language: z.enum(["javascript", "typescript", "python", "html", "css", "sql", "json"]),
  testCases: z
    .array(
      z.object({
        id: z.string(),
        input: z.string(),
        expectedOutput: z.string(),
        description: z.string().optional(),
        isHidden: z.boolean().optional(),
      })
    )
    .optional(),
  timeLimit: z.number().int().min(1000).max(30000).default(5000), // 1-30 seconds
});

interface TestResult {
  id: string;
  description?: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  isHidden?: boolean;
}

/**
 * POST /api/activities/execute-code - Execute code in a sandboxed environment
 *
 * SECURITY NOTE: This endpoint should connect to a secure, sandboxed
 * code execution service (like AWS Lambda, Google Cloud Run, or a
 * dedicated sandbox like Piston API, Judge0, or similar).
 *
 * For production use, NEVER execute untrusted code directly on your server.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, language, testCases, timeLimit } = codeExecutionSchema.parse(body);

    // In production, this would send the code to a sandboxed execution service
    // For now, we'll return a placeholder response indicating the code was received

    // Check if we have a sandbox service configured
    const sandboxUrl = process.env.CODE_SANDBOX_URL;

    if (sandboxUrl) {
      // Forward to sandbox service
      try {
        const sandboxResponse = await fetch(sandboxUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CODE_SANDBOX_API_KEY}`,
          },
          body: JSON.stringify({
            code,
            language,
            testCases,
            timeLimit,
          }),
          signal: AbortSignal.timeout(timeLimit + 5000), // Add 5s buffer
        });

        if (!sandboxResponse.ok) {
          const errorData = await sandboxResponse.json().catch(() => ({}));
          return NextResponse.json(
            { error: "Code execution failed", details: errorData },
            { status: sandboxResponse.status }
          );
        }

        const result = await sandboxResponse.json();
        return NextResponse.json(result);
      } catch (error) {
        console.error("Sandbox execution error:", error);
        return NextResponse.json(
          { error: "Code execution service unavailable" },
          { status: 503 }
        );
      }
    }

    // No sandbox configured - return simulated response for development
    const output = generateSimulatedOutput(language, code);
    const testResults = testCases
      ? simulateTestResults(testCases)
      : undefined;

    return NextResponse.json({
      output,
      testResults,
      executionTime: 0,
      message:
        "Code execution sandbox not configured. This is a simulated response for development.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error executing code:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}

/**
 * Generate simulated output for development when no sandbox is configured
 */
function generateSimulatedOutput(language: string, code: string): string {
  const languageNames: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
    json: "JSON",
  };

  const langName = languageNames[language] || language;

  // Check for basic syntax issues
  if (language === "json") {
    try {
      JSON.parse(code);
      return `[${langName}] JSON is valid.`;
    } catch {
      return `[${langName}] Invalid JSON syntax.`;
    }
  }

  // For other languages, return a placeholder message
  const lines = code.split("\n").length;
  const chars = code.length;

  return (
    `[${langName}] Code received (${lines} lines, ${chars} characters).\n` +
    `Code execution requires a sandboxed environment.\n` +
    `Your code has been validated and will be evaluated on submission.`
  );
}

/**
 * Generate simulated test results for development
 */
function simulateTestResults(
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    description?: string;
    isHidden?: boolean;
  }>
): TestResult[] {
  return testCases.map((tc) => ({
    id: tc.id,
    description: tc.description,
    passed: false,
    expectedOutput: tc.expectedOutput,
    actualOutput: "(Pending server-side evaluation)",
    isHidden: tc.isHidden,
  }));
}
