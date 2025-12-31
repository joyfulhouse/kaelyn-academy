"use client";

import { Suspense, useState, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { Lightbulb, Play, RotateCcw, Maximize, Minimize, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GradeLevel } from "@/data/curriculum";
import {
  getVisualizationConfig,
  hasVisualizationSupport,
  type VisualizationConfig,
} from "./visualization-config";

// Dynamically import 3D components to enable code splitting
const Scene3D = dynamic(() => import("./canvas-wrapper").then(mod => ({ default: mod.Scene3D })), {
  ssr: false,
  loading: () => <VisualizationSkeleton />,
});

// Math visualizations
const NumberLine = dynamic(() => import("./math/number-line").then(mod => ({ default: mod.NumberLine })), { ssr: false });
const ShapeExplorer = dynamic(() => import("./math/shape-explorer").then(mod => ({ default: mod.ShapeExplorer })), { ssr: false });
const MultiplicationGrid = dynamic(() => import("./math/multiplication-grid").then(mod => ({ default: mod.MultiplicationGrid })), { ssr: false });
const CoordinateSystem = dynamic(() => import("./math/coordinate-system").then(mod => ({ default: mod.CoordinateSystem })), { ssr: false });
const GeometricShapes = dynamic(() => import("./math/geometric-shapes").then(mod => ({ default: mod.GeometricShapes })), { ssr: false });
const FractionVisualizer = dynamic(() => import("./math/fraction-visualizer").then(mod => ({ default: mod.FractionVisualizer })), { ssr: false });

// Science visualizations
const AtomModel = dynamic(() => import("./science/atom-model").then(mod => ({ default: mod.AtomModel })), { ssr: false });
const SolarSystem = dynamic(() => import("./science/solar-system").then(mod => ({ default: mod.SolarSystem })), { ssr: false });
const WaterCycle = dynamic(() => import("./science/water-cycle").then(mod => ({ default: mod.WaterCycle })), { ssr: false });

// Reading visualizations
const Book3D = dynamic(() => import("./reading/book-3d").then(mod => ({ default: mod.Book3D })), { ssr: false });
const WordCloud3D = dynamic(() => import("./reading/word-cloud").then(mod => ({ default: mod.WordCloud3D })), { ssr: false });
const StoryScene = dynamic(() => import("./reading/story-scene").then(mod => ({ default: mod.StoryScene })), { ssr: false });

// History visualizations
const Timeline3D = dynamic(() => import("./history/timeline-3d").then(mod => ({ default: mod.Timeline3D })), { ssr: false });
const HistoricalMonument = dynamic(() => import("./history/historical-monument").then(mod => ({ default: mod.HistoricalMonument })), { ssr: false });
const WorldMap3D = dynamic(() => import("./history/world-map-3d").then(mod => ({ default: mod.WorldMap3D })), { ssr: false });

interface LessonVisualizationProps {
  subjectId: string;
  lessonId: string;
  lessonTitle: string;
  gradeLevel: GradeLevel;
  className?: string;
}

function VisualizationSkeleton() {
  return (
    <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function NoVisualizationFallback({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative rounded-lg overflow-hidden">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">
          Interactive Content
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Text and interactive activities for &ldquo;{lessonTitle}&rdquo;
        </p>
      </div>
    </div>
  );
}

const VisualizationRenderer = memo(function VisualizationRenderer({ config }: { config: VisualizationConfig }) {
  const props = config.props ?? {};

  switch (config.type) {
    case "number-line":
      return (
        <NumberLine
          min={(props.min as number) ?? 0}
          max={(props.max as number) ?? 10}
          step={(props.step as number) ?? 1}
          interactive={(props.interactive as boolean) ?? true}
        />
      );

    case "shape-explorer":
      return (
        <ShapeExplorer
          shape={(props.shape as "cube" | "sphere" | "cylinder" | "cone" | "pyramid" | "torus") ?? "cube"}
          showProperties={(props.showProperties as boolean) ?? true}
          animate={true}
        />
      );

    case "multiplication-grid":
      return (
        <MultiplicationGrid
          factor1={(props.factor1 as number) ?? 3}
          factor2={(props.factor2 as number) ?? 4}
          showProduct={true}
          animated={true}
        />
      );

    case "coordinate-system":
      return (
        <CoordinateSystem
          showGrid={true}
          showLabels={true}
          animate={true}
        />
      );

    case "geometric-shapes":
      return (
        <GeometricShapes
          shape={(props.shape as "cube" | "sphere" | "cylinder" | "cone" | "pyramid" | "torus") ?? "cube"}
          showDimensions={true}
          animate={true}
          showEdges={true}
        />
      );

    case "fraction-visualizer":
      return (
        <FractionVisualizer
          numerator={(props.numerator as number) ?? 3}
          denominator={(props.denominator as number) ?? 4}
          shape="circle"
          showLabels={true}
        />
      );

    case "atom-model":
      return (
        <AtomModel
          atom={(props.element as string) ?? "carbon"}
          animate={true}
          showLabels={(props.showLabels as boolean) ?? true}
          showOrbits={(props.showOrbits as boolean) ?? true}
        />
      );

    case "solar-system":
      return (
        <SolarSystem
          animate={(props.animate as boolean) ?? true}
          showLabels={(props.showLabels as boolean) ?? true}
          showOrbits={(props.showOrbits as boolean) ?? true}
          speedMultiplier={1}
        />
      );

    case "water-cycle":
      return <WaterCycle animate={true} />;

    // Reading visualizations
    case "book-3d":
      return (
        <Book3D
          title={(props.title as string) ?? "My Book"}
          author={(props.author as string) ?? "Author"}
          pages={(props.pages as number) ?? 12}
          animate={true}
          showPageContent={(props.showPageContent as boolean) ?? true}
        />
      );

    case "word-cloud":
      return (
        <WordCloud3D
          animate={true}
          showCategories={(props.showCategories as boolean) ?? false}
          interactive={(props.interactive as boolean) ?? true}
        />
      );

    case "story-scene":
      return (
        <StoryScene
          sceneType={(props.sceneType as "forest" | "city" | "ocean" | "space" | "home" | "school") ?? "forest"}
          timeOfDay={(props.timeOfDay as "day" | "night" | "sunset") ?? "day"}
          showLabels={(props.showLabels as boolean) ?? true}
          animate={true}
        />
      );

    // History visualizations
    case "timeline-3d":
      return (
        <Timeline3D
          title={(props.title as string) ?? "Historical Timeline"}
          animate={true}
          showDescriptions={(props.showDescriptions as boolean) ?? true}
        />
      );

    case "historical-monument":
      return (
        <HistoricalMonument
          type={(props.type as "pyramid" | "colosseum" | "lighthouse" | "temple" | "castle" | "tower" | "wall") ?? "pyramid"}
          animate={true}
          showInfo={true}
        />
      );

    case "world-map":
      return (
        <WorldMap3D
          title={(props.title as string) ?? "World Map"}
          animate={true}
          showLabels={(props.showLabels as boolean) ?? true}
          interactive={(props.interactive as boolean) ?? true}
        />
      );

    default:
      return null;
  }
});

/**
 * Lesson Visualization Component
 *
 * Renders interactive 3D visualizations for lessons based on subject and content.
 * Automatically detects the appropriate visualization based on lesson metadata
 * and shows a fallback UI for unsupported content.
 */
export function LessonVisualization({
  subjectId,
  lessonId,
  lessonTitle,
  gradeLevel,
  className,
}: LessonVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlaying = useCallback(() => setIsPlaying((prev) => !prev), []);
  const toggleFullscreen = useCallback(() => setIsFullscreen((prev) => !prev), []);
  const closeFullscreen = useCallback(() => setIsFullscreen(false), []);

  // Get visualization configuration
  const config = getVisualizationConfig(lessonId, lessonTitle, subjectId, gradeLevel);

  // Check if this subject supports 3D visualizations
  if (!hasVisualizationSupport(subjectId) || !config) {
    return (
      <div className={className}>
        <NoVisualizationFallback lessonTitle={lessonTitle} />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`relative rounded-lg overflow-hidden transition-all ${
          isFullscreen ? "fixed inset-4 z-50 bg-background" : "aspect-video"
        }`}
      >
        <Suspense fallback={<VisualizationSkeleton />}>
          <Scene3D
            className="w-full h-full"
            ageGroup={config.ageGroup}
            controls={true}
            shadows={true}
            cameraPosition={[0, 2, 5]}
          >
            <VisualizationRenderer config={config} />
          </Scene3D>
        </Suspense>

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={togglePlaying}
                  >
                    {isPlaying ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPlaying ? "Reset View" : "Play Animation"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Visualization type badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
            <Settings2 className="h-3 w-3" />
            <span className="capitalize">{config.type.replace("-", " ")}</span>
          </div>
        </div>

        {/* Fullscreen backdrop */}
        {isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={closeFullscreen}
          >
            <Minimize className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default LessonVisualization;
