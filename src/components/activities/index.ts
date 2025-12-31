// Interactive Activity Components
// These components provide reusable interactive activities for K-12 education

export { DragDropActivity } from "./drag-drop-activity";
export { CodeEditorActivity } from "./code-editor-activity";
export { FillBlankActivity } from "./fill-blank-activity";
export { DrawingActivity } from "./drawing-activity";

// Re-export types from schema for convenience
export type {
  DragDropItem,
  DragDropZone,
  CodeEditorConfig,
  FillBlankConfig,
  DrawingConfig,
  ActivityConfig,
  InteractiveActivityType,
} from "@/lib/db/schema/curriculum";
