"use client";

import { Lightbulb, Play, RotateCcw, Volume2, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GradeLevel } from "@/data/curriculum";

interface LessonVisualizationProps {
  subjectId: string;
  lessonId: string;
  lessonTitle: string;
  gradeLevel: GradeLevel;
  className?: string;
}

/**
 * Lesson Visualization Component
 *
 * This component will display interactive 3D visualizations for lessons.
 * Currently shows a placeholder - actual 3D content will be loaded
 * dynamically based on lesson metadata when the curriculum specifies
 * which visualization to use.
 *
 * Available visualizations in src/components/3d/:
 * - Math: ShapeExplorer, FractionVisualizer, MultiplicationGrid, NumberLine, CoordinateSystem
 * - Science: AtomModel, SolarSystem, WaterCycle
 */
export function LessonVisualization({
  lessonTitle,
  className,
}: LessonVisualizationProps) {
  return (
    <div className={className}>
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative rounded-lg overflow-hidden">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Interactive 3D Visualization
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Explore concepts in 3D - coming soon for "{lessonTitle}"
          </p>
        </div>

        {/* Controls overlay (placeholder) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" disabled>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" disabled>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" disabled>
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" disabled>
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonVisualization;
