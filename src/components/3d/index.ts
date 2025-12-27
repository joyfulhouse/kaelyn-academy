// 3D Components for Kaelyn's Academy
// Built with React Three Fiber and Three.js

// Canvas wrappers
export { Scene3D, SimpleScene3D } from "./canvas-wrapper";

// Lesson visualization (main entry point)
export { LessonVisualization } from "./lesson-visualization";

// Visualization configuration
export {
  getVisualizationConfig,
  hasVisualizationSupport,
  gradeToAgeGroup,
  type VisualizationType,
  type VisualizationConfig,
} from "./visualization-config";

// Primitives and utilities
export {
  InteractiveBox,
  InteractiveSphere,
  NumberDisplay,
  CountingObjects,
  FractionVisualizer,
  AxisHelper,
  GridFloor,
  HighlightRing,
} from "./primitives";

// Math visualizations
export { NumberLine } from "./math/number-line";
export { ShapeExplorer, ShapeGallery } from "./math/shape-explorer";
export { MultiplicationGrid, MultiplicationTable } from "./math/multiplication-grid";
export { CoordinateSystem } from "./math/coordinate-system";
export { GeometricShapes, type ShapeType } from "./math/geometric-shapes";
export { FractionVisualizer as FractionPieChart } from "./math/fraction-visualizer";

// Science visualizations
export { AtomModel, COMMON_ATOMS, type AtomConfig } from "./science/atom-model";
export { SolarSystem } from "./science/solar-system";
export { WaterCycle } from "./science/water-cycle";
