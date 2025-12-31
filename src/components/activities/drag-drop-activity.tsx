"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Check,
  X,
  RotateCcw,
  GripVertical,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type {
  DragDropItem,
  DragDropZone,
} from "@/lib/db/schema/curriculum";

interface DragDropActivityProps {
  title: string;
  instructions: string;
  items: DragDropItem[];
  zones: DragDropZone[];
  shuffleItems?: boolean;
  enableReorder?: boolean;
  onComplete: (score: number, placements: Record<string, string[]>) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  accessibilityDescription?: string;
}

interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  sourceZoneId: string | null;
}

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function DragDropActivity({
  title,
  instructions,
  items: initialItems,
  zones,
  shuffleItems = true,
  enableReorder = false,
  onComplete,
  onCancel,
  readOnly = false,
  accessibilityDescription,
}: DragDropActivityProps) {
  // Initialize shuffled items
  const [availableItems, setAvailableItems] = useState<DragDropItem[]>(() =>
    shuffleItems ? shuffleArray(initialItems) : initialItems
  );

  // Track which items are in which zones
  const [placements, setPlacements] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    zones.forEach((zone) => {
      initial[zone.id] = [];
    });
    return initial;
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItemId: null,
    sourceZoneId: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Refs for keyboard navigation
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const zoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Announce for screen readers
  const announceRef = useRef<HTMLDivElement>(null);
  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  }, []);

  // Calculate progress
  const totalItems = initialItems.length;
  const placedItems = Object.values(placements).flat().length;
  const progressPercent = (placedItems / totalItems) * 100;

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent, itemId: string, sourceZoneId: string | null) => {
      if (readOnly || submitted) return;

      e.dataTransfer.setData("text/plain", itemId);
      e.dataTransfer.effectAllowed = "move";

      setDragState({
        isDragging: true,
        draggedItemId: itemId,
        sourceZoneId,
      });

      const item = initialItems.find((i) => i.id === itemId);
      announce(`Picked up ${item?.content}. Drop on a target zone.`);
    },
    [readOnly, submitted, initialItems, announce]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItemId: null,
      sourceZoneId: null,
    });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (readOnly || submitted) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    [readOnly, submitted]
  );

  // Handle drop on zone
  const handleDropOnZone = useCallback(
    (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      if (readOnly || submitted) return;

      const itemId = e.dataTransfer.getData("text/plain");
      if (!itemId) return;

      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      // Check if zone has max items limit
      if (zone.maxItems && placements[zoneId].length >= zone.maxItems) {
        announce(`Zone ${zone.label} is full.`);
        return;
      }

      // Remove from source
      if (dragState.sourceZoneId) {
        setPlacements((prev) => ({
          ...prev,
          [dragState.sourceZoneId!]: prev[dragState.sourceZoneId!].filter(
            (id) => id !== itemId
          ),
        }));
      } else {
        setAvailableItems((prev) => prev.filter((item) => item.id !== itemId));
      }

      // Add to target zone
      setPlacements((prev) => ({
        ...prev,
        [zoneId]: [...prev[zoneId], itemId],
      }));

      const item = initialItems.find((i) => i.id === itemId);
      announce(`Dropped ${item?.content} in ${zone.label}.`);

      handleDragEnd();
    },
    [
      readOnly,
      submitted,
      zones,
      placements,
      dragState.sourceZoneId,
      initialItems,
      announce,
      handleDragEnd,
    ]
  );

  // Handle drop back to available items
  const handleDropToAvailable = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (readOnly || submitted) return;

      const itemId = e.dataTransfer.getData("text/plain");
      if (!itemId || !dragState.sourceZoneId) return;

      // Remove from zone
      setPlacements((prev) => ({
        ...prev,
        [dragState.sourceZoneId!]: prev[dragState.sourceZoneId!].filter(
          (id) => id !== itemId
        ),
      }));

      // Add back to available
      const item = initialItems.find((i) => i.id === itemId);
      if (item) {
        setAvailableItems((prev) => [...prev, item]);
        announce(`Returned ${item.content} to available items.`);
      }

      handleDragEnd();
    },
    [readOnly, submitted, dragState.sourceZoneId, initialItems, announce, handleDragEnd]
  );

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      itemId: string,
      currentZoneId: string | null
    ) => {
      if (readOnly || submitted) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        // Toggle selection for keyboard users
        if (dragState.draggedItemId === itemId) {
          // Deselect
          setDragState({
            isDragging: false,
            draggedItemId: null,
            sourceZoneId: null,
          });
          announce("Deselected item.");
        } else {
          // Select
          setDragState({
            isDragging: true,
            draggedItemId: itemId,
            sourceZoneId: currentZoneId,
          });
          const item = initialItems.find((i) => i.id === itemId);
          announce(
            `Selected ${item?.content}. Press Enter on a zone to drop.`
          );
        }
      }
    },
    [readOnly, submitted, dragState.draggedItemId, initialItems, announce]
  );

  // Handle zone keyboard selection
  const handleZoneKeyDown = useCallback(
    (e: React.KeyboardEvent, zoneId: string) => {
      if (readOnly || submitted) return;

      if (
        (e.key === " " || e.key === "Enter") &&
        dragState.draggedItemId
      ) {
        e.preventDefault();

        const zone = zones.find((z) => z.id === zoneId);
        if (!zone) return;

        // Check if zone has max items limit
        if (zone.maxItems && placements[zoneId].length >= zone.maxItems) {
          announce(`Zone ${zone.label} is full.`);
          return;
        }

        const itemId = dragState.draggedItemId;

        // Remove from source
        if (dragState.sourceZoneId) {
          setPlacements((prev) => ({
            ...prev,
            [dragState.sourceZoneId!]: prev[dragState.sourceZoneId!].filter(
              (id) => id !== itemId
            ),
          }));
        } else {
          setAvailableItems((prev) =>
            prev.filter((item) => item.id !== itemId)
          );
        }

        // Add to target zone
        setPlacements((prev) => ({
          ...prev,
          [zoneId]: [...prev[zoneId], itemId],
        }));

        const item = initialItems.find((i) => i.id === itemId);
        announce(`Dropped ${item?.content} in ${zone.label}.`);

        // Reset drag state
        setDragState({
          isDragging: false,
          draggedItemId: null,
          sourceZoneId: null,
        });
      }
    },
    [
      readOnly,
      submitted,
      dragState,
      zones,
      placements,
      initialItems,
      announce,
    ]
  );

  // Check answers and calculate score
  const handleSubmit = useCallback(() => {
    let correct = 0;

    zones.forEach((zone) => {
      const placedInZone = placements[zone.id] || [];
      placedInZone.forEach((itemId) => {
        if (zone.acceptedItemIds.includes(itemId)) {
          correct++;
        }
      });
    });

    const calculatedScore = Math.round((correct / totalItems) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    announce(
      `Activity complete. Score: ${calculatedScore}%. ${correct} out of ${totalItems} correct.`
    );

    onComplete(calculatedScore, placements);
  }, [zones, placements, totalItems, announce, onComplete]);

  // Reset activity
  const handleReset = useCallback(() => {
    setAvailableItems(shuffleItems ? shuffleArray(initialItems) : initialItems);
    const initial: Record<string, string[]> = {};
    zones.forEach((zone) => {
      initial[zone.id] = [];
    });
    setPlacements(initial);
    setSubmitted(false);
    setScore(null);
    announce("Activity reset. All items returned to starting position.");
  }, [initialItems, shuffleItems, zones, announce]);

  // Get item by ID
  const getItem = useCallback(
    (itemId: string) => initialItems.find((item) => item.id === itemId),
    [initialItems]
  );

  // Check if item is in correct zone
  const isItemCorrect = useCallback(
    (itemId: string, zoneId: string) => {
      const zone = zones.find((z) => z.id === zoneId);
      return zone?.acceptedItemIds.includes(itemId) ?? false;
    },
    [zones]
  );

  return (
    <div className="space-y-6">
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
            <Badge variant="secondary">
              {placedItems} / {totalItems} placed
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2 mt-2" />
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

      {/* Available items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Items to Place
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "min-h-[80px] p-4 rounded-lg border-2 border-dashed transition-colors",
              dragState.isDragging && dragState.sourceZoneId
                ? "border-primary bg-primary/5"
                : "border-muted"
            )}
            onDragOver={handleDragOver}
            onDrop={handleDropToAvailable}
            role="region"
            aria-label="Available items to drag"
          >
            {availableItems.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm">
                {placedItems === totalItems
                  ? "All items placed!"
                  : "Drag items here to remove them from zones"}
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.id, el);
                    }}
                    draggable={!readOnly && !submitted}
                    onDragStart={(e) => handleDragStart(e, item.id, null)}
                    onDragEnd={handleDragEnd}
                    onKeyDown={(e) => handleKeyDown(e, item.id, null)}
                    tabIndex={readOnly || submitted ? -1 : 0}
                    role="button"
                    aria-label={`Drag ${item.content} to a zone`}
                    aria-pressed={dragState.draggedItemId === item.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card cursor-grab transition-all",
                      "hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring",
                      dragState.draggedItemId === item.id &&
                        "border-primary shadow-lg scale-105",
                      (readOnly || submitted) && "cursor-default opacity-75"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain rounded"
                      />
                    )}
                    <span className="text-sm font-medium">{item.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drop zones */}
      <div className="grid gap-4 sm:grid-cols-2">
        {zones.map((zone) => (
          <Card
            key={zone.id}
            ref={(el) => {
              if (el) zoneRefs.current.set(zone.id, el);
            }}
            tabIndex={
              !readOnly && !submitted && dragState.draggedItemId ? 0 : -1
            }
            onKeyDown={(e) => handleZoneKeyDown(e, zone.id)}
            role="region"
            aria-label={`Drop zone: ${zone.label}`}
            className={cn(
              "transition-all",
              dragState.isDragging &&
                "ring-2 ring-primary/50 ring-offset-2"
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{zone.label}</span>
                {zone.maxItems && (
                  <Badge variant="outline" className="text-xs">
                    Max {zone.maxItems}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "min-h-[100px] p-3 rounded-lg border-2 border-dashed transition-colors",
                  dragState.isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted",
                  submitted && "pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnZone(e, zone.id)}
              >
                {placements[zone.id].length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Drop items here
                  </p>
                ) : (
                  <div className="space-y-2">
                    {placements[zone.id].map((itemId) => {
                      const item = getItem(itemId);
                      const isCorrect = isItemCorrect(itemId, zone.id);
                      const showResult = submitted;

                      return (
                        <div
                          key={itemId}
                          draggable={!readOnly && !submitted && enableReorder}
                          onDragStart={(e) =>
                            handleDragStart(e, itemId, zone.id)
                          }
                          onDragEnd={handleDragEnd}
                          onKeyDown={(e) => handleKeyDown(e, itemId, zone.id)}
                          tabIndex={
                            readOnly || submitted || !enableReorder ? -1 : 0
                          }
                          role="button"
                          aria-label={
                            showResult
                              ? `${item?.content} - ${
                                  isCorrect ? "Correct" : "Incorrect"
                                }`
                              : `${item?.content} in ${zone.label}`
                          }
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card transition-all",
                            !submitted &&
                              enableReorder &&
                              "cursor-grab hover:border-primary",
                            showResult &&
                              isCorrect &&
                              "border-green-500 bg-green-50 dark:bg-green-950/20",
                            showResult &&
                              !isCorrect &&
                              "border-red-500 bg-red-50 dark:bg-red-950/20"
                          )}
                        >
                          {enableReorder && !submitted && (
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          {item?.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt=""
                              width={32}
                              height={32}
                              className="h-8 w-8 object-contain rounded"
                            />
                          )}
                          <span className="text-sm font-medium flex-1">
                            {item?.content}
                          </span>
                          {showResult && (
                            <span className="shrink-0">
                              {isCorrect ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-600" />
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results */}
      {submitted && score !== null && (
        <Card
          className={cn(
            score >= 70 ? "bg-green-50 dark:bg-green-950/20" : "bg-amber-50 dark:bg-amber-950/20"
          )}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {score >= 70 ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">
                    {score >= 70 ? "Great job!" : "Keep practicing!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Score: {score}%
                  </p>
                </div>
              </div>
              <Badge variant={score >= 70 ? "default" : "secondary"}>
                {Object.values(placements).flat().filter((itemId) => {
                  const zoneId = Object.entries(placements).find(([, items]) =>
                    items.includes(itemId)
                  )?.[0];
                  return zoneId && isItemCorrect(itemId, zoneId);
                }).length}{" "}
                / {totalItems} correct
              </Badge>
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
            <Button
              onClick={handleSubmit}
              disabled={placedItems < totalItems || readOnly}
            >
              <Check className="h-4 w-4 mr-2" />
              Check Answers
            </Button>
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

export default DragDropActivity;
