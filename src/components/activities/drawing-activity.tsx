"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Pencil,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Check,
  RotateCcw,
  Minus,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DrawingConfig } from "@/lib/db/schema/curriculum";

// Popover component (if not already available, create inline)
function PopoverSimple({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-2">{children}</PopoverContent>
    </Popover>
  );
}

interface DrawingActivityProps {
  title: string;
  instructions: string;
  config: DrawingConfig;
  onComplete: (score: number, imageData: string) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  accessibilityDescription?: string;
}

type DrawingTool = "pen" | "highlighter" | "eraser" | "shape" | "text";
type ShapeType = "rectangle" | "circle" | "line";

interface Point {
  x: number;
  y: number;
}

interface DrawingAction {
  type: "stroke" | "shape" | "text" | "clear";
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  points?: Point[];
  shapeType?: ShapeType;
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
  opacity?: number;
}

// Default colors for drawing
const DEFAULT_COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00AA00", // Green
  "#0000FF", // Blue
  "#FF9900", // Orange
  "#9900FF", // Purple
  "#00AAAA", // Cyan
  "#FF00FF", // Magenta
];

// Default stroke widths
const DEFAULT_STROKE_WIDTHS = [2, 4, 8, 12, 20];

// Tool icons mapping
const TOOL_ICONS: Record<DrawingTool, React.ComponentType<{ className?: string }>> = {
  pen: Pencil,
  highlighter: Highlighter,
  eraser: Eraser,
  shape: Square,
  text: Type,
};

export function DrawingActivity({
  title,
  instructions,
  config,
  onComplete,
  onCancel,
  readOnly = false,
  accessibilityDescription,
}: DrawingActivityProps) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
  const [currentColor, setCurrentColor] = useState(
    config.colors?.[0] ?? DEFAULT_COLORS[0]
  );
  const [strokeWidth, setStrokeWidth] = useState(
    config.strokeWidths?.[1] ?? DEFAULT_STROKE_WIDTHS[1]
  );
  const [currentShapeType, setCurrentShapeType] = useState<ShapeType>("rectangle");

  // History for undo/redo
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Current stroke being drawn
  const currentStrokeRef = useRef<Point[]>([]);
  const shapeStartRef = useRef<Point | null>(null);

  // Submission state
  const [submitted, setSubmitted] = useState(false);

  // Announcer ref for screen readers
  const announceRef = useRef<HTMLDivElement>(null);

  // Available tools from config
  const availableTools = config.allowedTools || ["pen", "highlighter", "eraser"];
  const colors = config.colors ?? DEFAULT_COLORS;
  const strokeWidths = config.strokeWidths ?? DEFAULT_STROKE_WIDTHS;

  // Announce for screen readers
  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  // Draw grid background
  const drawGrid = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (config.backgroundType === "grid" && config.gridSize) {
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 0.5;

      for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else if (config.backgroundType === "lined") {
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 0.5;
      const lineSpacing = 30;

      for (let y = lineSpacing; y <= canvas.height; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  }, [getContext, config.backgroundType, config.gridSize]);

  // Redraw canvas from history
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawGrid();

    // Draw background image if set
    if (config.backgroundImage && config.backgroundType === "image") {
      const img = new Image();
      img.src = config.backgroundImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Redraw history on top
        drawHistory();
      };
    } else {
      drawHistory();
    }

    function drawHistory() {
      // Draw all actions up to current history index
      // Re-check ctx and canvas for TypeScript narrowing
      if (!ctx || !canvas) return;

      for (let i = 0; i <= historyIndex; i++) {
        const action = history[i];
        if (!action) continue;

        if (action.type === "stroke" && action.points) {
          ctx.beginPath();
          ctx.strokeStyle = action.tool === "eraser" ? "#ffffff" : action.color;
          ctx.lineWidth = action.strokeWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = action.opacity ?? 1;

          if (action.points.length > 0) {
            ctx.moveTo(action.points[0].x, action.points[0].y);
            for (let j = 1; j < action.points.length; j++) {
              ctx.lineTo(action.points[j].x, action.points[j].y);
            }
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (action.type === "shape" && action.startPoint && action.endPoint) {
          ctx.strokeStyle = action.color;
          ctx.lineWidth = action.strokeWidth;
          ctx.globalAlpha = action.opacity ?? 1;

          const { x: x1, y: y1 } = action.startPoint;
          const { x: x2, y: y2 } = action.endPoint;

          if (action.shapeType === "rectangle") {
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
          } else if (action.shapeType === "circle") {
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const radiusX = Math.abs(x2 - x1) / 2;
            const radiusY = Math.abs(y2 - y1) / 2;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (action.shapeType === "line") {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        } else if (action.type === "clear") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawGrid();
        }
      }
    }
  }, [getContext, drawGrid, history, historyIndex, config.backgroundImage, config.backgroundType]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 400; // Fixed height

    // Initial draw
    redrawCanvas();
  }, [redrawCanvas]);

  // Redraw when history changes
  useEffect(() => {
    redrawCanvas();
  }, [history, historyIndex, redrawCanvas]);

  // Get point from event
  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Start drawing
  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (readOnly || submitted) return;
      e.preventDefault();

      const point = getPoint(e);
      setIsDrawing(true);

      if (currentTool === "shape") {
        shapeStartRef.current = point;
      } else {
        currentStrokeRef.current = [point];

        // Draw initial point
        const ctx = getContext();
        if (ctx) {
          ctx.beginPath();
          ctx.strokeStyle =
            currentTool === "eraser" ? "#ffffff" : currentColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = "round";
          ctx.globalAlpha = currentTool === "highlighter" ? 0.4 : 1;
          ctx.moveTo(point.x, point.y);
        }
      }
    },
    [readOnly, submitted, getPoint, currentTool, currentColor, strokeWidth, getContext]
  );

  // Continue drawing
  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || readOnly || submitted) return;
      e.preventDefault();

      const point = getPoint(e);
      const ctx = getContext();
      if (!ctx) return;

      if (currentTool === "shape" && shapeStartRef.current) {
        // Preview shape
        redrawCanvas();
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.setLineDash([5, 5]);

        const { x: x1, y: y1 } = shapeStartRef.current;
        const { x: x2, y: y2 } = point;

        if (currentShapeType === "rectangle") {
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        } else if (currentShapeType === "circle") {
          const centerX = (x1 + x2) / 2;
          const centerY = (y1 + y2) / 2;
          const radiusX = Math.abs(x2 - x1) / 2;
          const radiusY = Math.abs(y2 - y1) / 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (currentShapeType === "line") {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      } else {
        // Draw stroke
        currentStrokeRef.current.push(point);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    },
    [
      isDrawing,
      readOnly,
      submitted,
      getPoint,
      getContext,
      currentTool,
      currentShapeType,
      currentColor,
      strokeWidth,
      redrawCanvas,
    ]
  );

  // End drawing
  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const ctx = getContext();
    if (ctx) {
      ctx.globalAlpha = 1;
    }

    // Add action to history
    let newAction: DrawingAction | null = null;

    if (currentTool === "shape" && shapeStartRef.current) {
      // Shape action - we need to get the last point
      // Since we don't have the end point here, we'll skip if shape wasn't completed
      // This is handled in handleMove's preview
    } else if (currentStrokeRef.current.length > 0) {
      newAction = {
        type: "stroke",
        tool: currentTool,
        color: currentColor,
        strokeWidth,
        points: [...currentStrokeRef.current],
        opacity: currentTool === "highlighter" ? 0.4 : 1,
      };
    }

    if (newAction) {
      // Remove any redo history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAction);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    currentStrokeRef.current = [];
    shapeStartRef.current = null;
  }, [isDrawing, getContext, currentTool, currentColor, strokeWidth, history, historyIndex]);

  // Handle shape end (need to capture endpoint)
  const handleShapeEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || currentTool !== "shape" || !shapeStartRef.current) {
        handleEnd();
        return;
      }

      const endPoint = getPoint(e);
      const startPoint = shapeStartRef.current;

      const newAction: DrawingAction = {
        type: "shape",
        tool: "shape",
        color: currentColor,
        strokeWidth,
        shapeType: currentShapeType,
        startPoint,
        endPoint,
      };

      // Remove any redo history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAction);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setIsDrawing(false);
      shapeStartRef.current = null;
      announce(`Drew ${currentShapeType}`);
    },
    [
      isDrawing,
      currentTool,
      getPoint,
      currentColor,
      strokeWidth,
      currentShapeType,
      history,
      historyIndex,
      handleEnd,
      announce,
    ]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      setHistoryIndex(historyIndex - 1);
      announce("Undo");
    }
  }, [historyIndex, announce]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      announce("Redo");
    }
  }, [historyIndex, history.length, announce]);

  // Clear canvas
  const handleClear = useCallback(() => {
    const newAction: DrawingAction = {
      type: "clear",
      tool: "eraser",
      color: "#ffffff",
      strokeWidth: 0,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAction);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    announce("Canvas cleared");
  }, [history, historyIndex, announce]);

  // Download image
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    announce("Drawing downloaded");
  }, [title, announce]);

  // Submit
  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    setSubmitted(true);

    // For drawing activities, score is typically manual grading
    // We'll pass 100 and let the teacher grade based on rubric
    const score = 100;

    announce("Drawing submitted for review");
    onComplete(score, imageData);
  }, [announce, onComplete]);

  // Reset
  const handleReset = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setSubmitted(false);
    announce("Drawing reset");
  }, [announce]);

  // Select tool
  const handleSelectTool = useCallback(
    (tool: DrawingTool) => {
      setCurrentTool(tool);
      announce(`Selected ${tool} tool`);
    },
    [announce]
  );

  return (
    <div className="space-y-4">
      {/* Accessibility announcer */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary">Drawing Activity</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{instructions}</p>
          {accessibilityDescription && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              {accessibilityDescription}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Toolbar */}
      {!submitted && (
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tools */}
              <TooltipProvider>
                <div className="flex items-center gap-1 border-r pr-2 mr-2">
                  {availableTools.map((tool) => {
                    const Icon = TOOL_ICONS[tool as DrawingTool];
                    if (!Icon) return null;

                    return (
                      <Tooltip key={tool}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={currentTool === tool ? "default" : "ghost"}
                            size="icon"
                            onClick={() => handleSelectTool(tool as DrawingTool)}
                            disabled={readOnly}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="capitalize">{tool}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Shape selector (if shape tool available) */}
                {availableTools.includes("shape") && currentTool === "shape" && (
                  <div className="flex items-center gap-1 border-r pr-2 mr-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentShapeType === "rectangle" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setCurrentShapeType("rectangle")}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Rectangle</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentShapeType === "circle" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setCurrentShapeType("circle")}
                        >
                          <Circle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Circle</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentShapeType === "line" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setCurrentShapeType("line")}
                        >
                          <Minus className="h-4 w-4 rotate-[-45deg]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Line</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {/* Color picker */}
                <PopoverSimple
                  trigger={
                    <Button variant="ghost" size="icon" disabled={readOnly}>
                      <div
                        className="h-5 w-5 rounded-full border-2 border-muted"
                        style={{ backgroundColor: currentColor }}
                      />
                    </Button>
                  }
                >
                  <div className="grid grid-cols-4 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                          currentColor === color
                            ? "border-primary ring-2 ring-primary"
                            : "border-muted"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setCurrentColor(color);
                          announce(`Selected color`);
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </PopoverSimple>

                {/* Stroke width */}
                <PopoverSimple
                  trigger={
                    <Button variant="ghost" size="sm" disabled={readOnly} className="gap-1">
                      <div
                        className="rounded-full bg-foreground"
                        style={{ width: strokeWidth, height: strokeWidth }}
                      />
                    </Button>
                  }
                >
                  <div className="w-32 space-y-2">
                    <p className="text-xs text-muted-foreground">Stroke Width</p>
                    <div className="flex gap-2">
                      {strokeWidths.map((width) => (
                        <button
                          key={width}
                          className={cn(
                            "flex items-center justify-center h-8 w-8 rounded border transition-colors",
                            strokeWidth === width
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-muted-foreground"
                          )}
                          onClick={() => {
                            setStrokeWidth(width);
                            announce(`Stroke width ${width}`);
                          }}
                        >
                          <div
                            className="rounded-full bg-foreground"
                            style={{ width, height: width }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverSimple>

                {/* Undo/Redo */}
                <div className="flex items-center gap-1 border-l pl-2 ml-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleUndo}
                        disabled={historyIndex < 0 || readOnly}
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1 || readOnly}
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo</TooltipContent>
                  </Tooltip>
                </div>

                {/* Clear & Download */}
                <div className="flex items-center gap-1 border-l pl-2 ml-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        disabled={readOnly}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas */}
      <Card>
        <CardContent className="p-2">
          <div
            ref={containerRef}
            className={cn(
              "relative w-full bg-white rounded-lg overflow-hidden border",
              !readOnly && !submitted && "cursor-crosshair",
              submitted && "pointer-events-none opacity-90"
            )}
            style={{ height: 400 }}
          >
            <canvas
              ref={canvasRef}
              className="touch-none"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={currentTool === "shape" ? handleShapeEnd : handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={currentTool === "shape" ? handleShapeEnd : handleEnd}
              aria-label="Drawing canvas"
              role="img"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rubric (if available) */}
      {config.rubric && config.rubric.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Grading Rubric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {config.rubric.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.criterion}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant="outline">{item.points} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted state */}
      {submitted && (
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Drawing submitted!</p>
                <p className="text-sm text-muted-foreground">
                  Your drawing has been submitted for review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={readOnly}>
              <Check className="h-4 w-4 mr-2" />
              Submit Drawing
            </Button>
          ) : (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DrawingActivity;
