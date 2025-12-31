"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  Copy,
  CheckCheck,
  AlertCircle,
  Loader2,
  Terminal,
  Eye,
  EyeOff,
} from "lucide-react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { CodeEditorConfig } from "@/lib/db/schema/curriculum";

interface CodeEditorActivityProps {
  title: string;
  instructions: string;
  config: CodeEditorConfig;
  onComplete: (
    score: number,
    code: string,
    testResults: TestResult[]
  ) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

interface TestResult {
  id: string;
  description?: string;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  isHidden?: boolean;
}

// Language display names and Monaco language IDs
const LANGUAGE_CONFIG: Record<
  CodeEditorConfig["language"],
  { displayName: string; monacoId: string }
> = {
  javascript: { displayName: "JavaScript", monacoId: "javascript" },
  typescript: { displayName: "TypeScript", monacoId: "typescript" },
  python: { displayName: "Python", monacoId: "python" },
  html: { displayName: "HTML", monacoId: "html" },
  css: { displayName: "CSS", monacoId: "css" },
  sql: { displayName: "SQL", monacoId: "sql" },
  json: { displayName: "JSON", monacoId: "json" },
};

export function CodeEditorActivity({
  title,
  instructions,
  config,
  onComplete,
  onCancel,
  readOnly = false,
}: CodeEditorActivityProps) {
  const [code, setCode] = useState(config.starterCode ?? "");
  const [output, setOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Get language config
  const langConfig = LANGUAGE_CONFIG[config.language];

  // Calculate progress based on test results
  const passedTests = testResults.filter((t) => t.passed).length;
  const totalTests = config.testCases?.length ?? 0;
  const progressPercent =
    totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Handle editor mount
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor settings
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
    });
  }, []);

  // Handle code change
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!readOnly && !submitted) {
        setCode(value ?? "");
      }
    },
    [readOnly, submitted]
  );

  // Execute code by sending to server-side sandbox
  // NOTE: Client-side code execution is intentionally NOT implemented
  // All code execution should go through a secure server-side sandbox
  const executeCode = useCallback(async () => {
    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    setActiveTab("output");

    try {
      // Send code to server for sandboxed execution
      const response = await fetch("/api/activities/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: config.language,
          testCases: config.testCases,
          timeLimit: config.executionTimeLimit ?? 5000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setOutput(`Error: ${error.message ?? "Code execution failed"}`);
        return;
      }

      const result = await response.json();
      setOutput(result.output ?? "");

      if (result.testResults) {
        setTestResults(result.testResults);
        setActiveTab("tests");
      }
    } catch {
      // Fallback for when server endpoint is not available
      setOutput(
        `[${langConfig.displayName}] Code execution requires server-side sandbox.\n` +
        `Your code has been saved. Submit to have it evaluated.`
      );

      // Mark all tests as pending server evaluation
      if (config.testCases) {
        const pendingResults: TestResult[] = config.testCases.map((tc) => ({
          id: tc.id,
          description: tc.description,
          passed: false,
          expectedOutput: tc.expectedOutput,
          actualOutput: "(Pending server evaluation)",
          isHidden: tc.isHidden,
        }));
        setTestResults(pendingResults);
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, config.language, config.testCases, config.executionTimeLimit, langConfig.displayName]);

  // Handle submission
  const handleSubmit = useCallback(async () => {
    await executeCode();
    setSubmitted(true);

    const score =
      totalTests > 0
        ? Math.round(
            (testResults.filter((t) => t.passed).length / totalTests) * 100
          )
        : 100; // If no tests, assume full marks

    onComplete(score, code, testResults);
  }, [executeCode, totalTests, testResults, onComplete, code]);

  // Reset code to starter
  const handleReset = useCallback(() => {
    setCode(config.starterCode ?? "");
    setOutput("");
    setTestResults([]);
    setSubmitted(false);
    setCurrentHintIndex(-1);
    setShowSolution(false);
    editorRef.current?.focus();
  }, [config.starterCode]);

  // Show next hint
  const handleShowHint = useCallback(() => {
    if (config.hints && currentHintIndex < config.hints.length - 1) {
      setCurrentHintIndex((prev) => prev + 1);
    }
  }, [config.hints, currentHintIndex]);

  // Copy code to clipboard
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [code]);

  // Detect theme preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setEditorTheme(isDark ? "vs-dark" : "light");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkNow = document.documentElement.classList.contains("dark");
          setEditorTheme(isDarkNow ? "vs-dark" : "light");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="outline">{langConfig.displayName}</Badge>
            </div>
            {totalTests > 0 && (
              <Badge variant="secondary">
                {passedTests} / {totalTests} tests passed
              </Badge>
            )}
          </div>
          {totalTests > 0 && (
            <Progress value={progressPercent} className="h-2 mt-2" />
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {instructions}
          </p>
        </CardContent>
      </Card>

      {/* Hints */}
      {config.hints && config.hints.length > 0 && currentHintIndex >= 0 && (
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <strong>Hint {currentHintIndex + 1}:</strong>{" "}
            {config.hints[currentHintIndex]}
          </AlertDescription>
        </Alert>
      )}

      {/* Editor */}
      <Card className="overflow-hidden">
        <CardHeader className="py-2 px-4 bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4" />
              <span className="font-medium">Code Editor</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="h-7 px-2"
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={readOnly || submitted}
                className="h-7 px-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <div className="h-[300px] border-b">
          <Editor
            height="100%"
            language={langConfig.monacoId}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            theme={editorTheme}
            options={{
              readOnly: readOnly || submitted,
              domReadOnly: readOnly || submitted,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              padding: { top: 8, bottom: 8 },
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          />
        </div>

        {/* Output/Tests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 py-2 bg-muted/50 border-b">
            <TabsList className="h-8">
              <TabsTrigger value="output" className="h-6 text-xs">
                Output
              </TabsTrigger>
              {totalTests > 0 && (
                <TabsTrigger value="tests" className="h-6 text-xs">
                  Tests ({passedTests}/{totalTests})
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          <CardContent className="p-0">
            <TabsContent value="output" className="m-0">
              <ScrollArea className="h-[120px]">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                  {output || (
                    <span className="text-muted-foreground">
                      Click "Run Code" to see output
                    </span>
                  )}
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="tests" className="m-0">
              <ScrollArea className="h-[120px]">
                <div className="p-4 space-y-2">
                  {testResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Run your code to see test results
                    </p>
                  ) : (
                    testResults.map((result) => (
                      <div
                        key={result.id}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded-lg text-sm",
                          result.passed
                            ? "bg-green-50 dark:bg-green-950/20"
                            : "bg-red-50 dark:bg-red-950/20"
                        )}
                      >
                        {result.passed ? (
                          <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {result.isHidden
                              ? "Hidden Test"
                              : result.description ?? `Test ${result.id}`}
                          </p>
                          {!result.isHidden && !result.passed && (
                            <div className="text-xs mt-1 space-y-0.5">
                              {result.error ? (
                                <p className="text-red-600">
                                  Error: {result.error}
                                </p>
                              ) : (
                                <>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Expected:
                                    </span>{" "}
                                    <code className="px-1 py-0.5 bg-muted rounded">
                                      {result.expectedOutput}
                                    </code>
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Got:
                                    </span>{" "}
                                    <code className="px-1 py-0.5 bg-muted rounded">
                                      {result.actualOutput || "(no output)"}
                                    </code>
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Solution (after submission or for teachers) */}
      {config.solution && (submitted || showSolution) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Solution
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {showSolution && (
            <CardContent>
              <div className="bg-muted rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  language={langConfig.monacoId}
                  value={config.solution}
                  theme={editorTheme}
                  options={{
                    readOnly: true,
                    domReadOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Results */}
      {submitted && (
        <Card
          className={cn(
            passedTests === totalTests || totalTests === 0
              ? "bg-green-50 dark:bg-green-950/20"
              : "bg-amber-50 dark:bg-amber-950/20"
          )}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {passedTests === totalTests || totalTests === 0 ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">
                    {passedTests === totalTests || totalTests === 0
                      ? "Great job!"
                      : "Keep trying!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalTests > 0
                      ? `${passedTests} of ${totalTests} tests passed`
                      : "Code submitted successfully"}
                  </p>
                </div>
              </div>
              {totalTests > 0 && (
                <Badge
                  variant={
                    passedTests === totalTests ? "default" : "secondary"
                  }
                >
                  {Math.round((passedTests / totalTests) * 100)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {config.hints &&
            config.hints.length > 0 &&
            currentHintIndex < config.hints.length - 1 &&
            !submitted && (
              <Button
                variant="ghost"
                onClick={handleShowHint}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Get Hint ({currentHintIndex + 1}/{config.hints.length})
              </Button>
            )}
        </div>
        <div className="flex gap-2">
          {!submitted ? (
            <>
              <Button
                variant="outline"
                onClick={executeCode}
                disabled={isRunning || readOnly}
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Code
              </Button>
              <Button onClick={handleSubmit} disabled={isRunning || readOnly}>
                <Check className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeEditorActivity;
