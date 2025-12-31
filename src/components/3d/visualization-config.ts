/**
 * Visualization Configuration
 * Maps lessons to specific 3D visualizations based on content
 */

import type { GradeLevel } from "@/data/curriculum";

/**
 * Available visualization types
 */
export type VisualizationType =
  // Math visualizations
  | "number-line"
  | "shape-explorer"
  | "multiplication-grid"
  | "coordinate-system"
  | "geometric-shapes"
  | "fraction-visualizer"
  // Science visualizations
  | "atom-model"
  | "solar-system"
  | "water-cycle"
  // Reading visualizations
  | "book-3d"
  | "word-cloud"
  | "story-scene"
  // History visualizations
  | "timeline-3d"
  | "historical-monument"
  | "world-map"
  // Generic
  | "none";

/**
 * Configuration for a specific visualization
 */
export interface VisualizationConfig {
  type: VisualizationType;
  props?: Record<string, unknown>;
  ageGroup?: "early" | "elementary" | "middle" | "high";
}

/**
 * Map grade level to age group for UI adjustments
 */
export function gradeToAgeGroup(grade: GradeLevel): "early" | "elementary" | "middle" | "high" {
  if (grade <= 2) return "early";
  if (grade <= 5) return "elementary";
  if (grade <= 8) return "middle";
  return "high";
}

/**
 * Explicit lesson-to-visualization mappings
 * Format: "lessonId": { type, props }
 */
const explicitMappings: Record<string, VisualizationConfig> = {
  // Kindergarten Math - Geometry
  "k-2d-shapes": { type: "shape-explorer", props: { shapes: ["cube", "sphere", "cone"] } },
  "k-3d-shapes": { type: "geometric-shapes", props: { showLabels: true } },
  "k-shape-attributes": { type: "shape-explorer", props: { showProperties: true } },

  // Kindergarten Math - Counting
  "k-count-1-10": { type: "number-line", props: { min: 0, max: 10, step: 1 } },
  "k-count-11-20": { type: "number-line", props: { min: 10, max: 20, step: 1 } },
  "k-counting-objects": { type: "number-line", props: { min: 0, max: 20, showObjects: true } },
  "k-compare-numbers": { type: "number-line", props: { min: 0, max: 20, interactive: true } },

  // Grade 1-2 Math
  "1-tens-ones": { type: "number-line", props: { min: 0, max: 100, step: 10 } },
  "1-count-120": { type: "number-line", props: { min: 0, max: 120, step: 10 } },
  "2-hundreds": { type: "number-line", props: { min: 0, max: 1000, step: 100 } },

  // Grade 3+ Math - Multiplication
  "3-mult-intro": { type: "multiplication-grid", props: { maxFactor: 5 } },
  "3-mult-facts": { type: "multiplication-grid", props: { maxFactor: 10 } },
  "4-mult-facts": { type: "multiplication-grid", props: { maxFactor: 12 } },

  // Fractions
  "3-fractions-intro": { type: "fraction-visualizer", props: { maxDenominator: 8 } },
  "3-unit-fractions": { type: "fraction-visualizer", props: { showUnitFractions: true } },
  "3-equivalent-fractions": { type: "fraction-visualizer", props: { showEquivalent: true } },
  "4-add-fractions": { type: "fraction-visualizer", props: { showAddition: true } },
  "5-fractions": { type: "fraction-visualizer" },
  "6-ratios": { type: "fraction-visualizer", props: { showRatios: true } },

  // Coordinate geometry
  "5-coordinate-plane": { type: "coordinate-system", props: { quadrant: 1 } },
  "6-coordinate-plane": { type: "coordinate-system", props: { allQuadrants: true } },
  "7-graphing": { type: "coordinate-system", props: { showGraphing: true } },
  "8-linear-equations": { type: "coordinate-system", props: { showLines: true } },

  // High school geometry
  "9-geometry-basics": { type: "geometric-shapes", props: { advanced: true } },
  "10-geometry": { type: "geometric-shapes", props: { showProofs: true } },

  // Science - Space
  "1-sun-moon": { type: "solar-system", props: { visiblePlanets: ["Earth"], showLabels: true } },
  "1-day-night": { type: "solar-system", props: { visiblePlanets: ["Earth"], focusEarth: true } },
  "1-stars": { type: "solar-system", props: { showStars: true } },
  "3-solar-system": { type: "solar-system", props: { showLabels: true, animate: true } },
  "4-moon-phases": { type: "solar-system", props: { focusMoon: true } },
  "5-solar-system": { type: "solar-system" },
  "6-earth-sun-moon": { type: "solar-system", props: { showOrbits: true } },

  // Science - Chemistry/Atoms
  "5-matter": { type: "atom-model", props: { element: "O", showElectrons: true } },
  "6-elements": { type: "atom-model", props: { showPeriodicContext: true } },
  "7-atoms": { type: "atom-model", props: { interactive: true } },
  "8-atomic-structure": { type: "atom-model", props: { showSubparticles: true } },
  "9-chemistry": { type: "atom-model", props: { element: "C" } },
  "10-chemistry": { type: "atom-model", props: { showBonds: true } },

  // Science - Water Cycle
  "2-water-cycle": { type: "water-cycle" },
  "3-weather": { type: "water-cycle", props: { showClouds: true } },
  "4-water-cycle": { type: "water-cycle", props: { detailed: true } },
  "5-earth-systems": { type: "water-cycle" },

  // Reading - Books and Stories
  "k-alphabet": { type: "book-3d", props: { title: "ABC Book", pages: 26 } },
  "k-sight-words": { type: "word-cloud", props: { showCategories: false } },
  "k-story-elements": { type: "story-scene", props: { sceneType: "home" } },
  "1-phonics": { type: "word-cloud", props: { showCategories: true } },
  "1-reading-stories": { type: "book-3d", props: { title: "My First Story" } },
  "1-story-setting": { type: "story-scene", props: { sceneType: "forest" } },
  "2-vocabulary": { type: "word-cloud", props: { showCategories: true } },
  "2-fiction": { type: "story-scene", props: { sceneType: "home" } },
  "3-reading-comprehension": { type: "book-3d", props: { showPageContent: true } },
  "3-vocabulary-context": { type: "word-cloud", props: { interactive: true } },
  "3-story-structure": { type: "story-scene", props: { showLabels: true } },
  "4-literature": { type: "book-3d", props: { title: "Classic Tales" } },
  "4-word-roots": { type: "word-cloud", props: { showCategories: true } },
  "5-literary-elements": { type: "story-scene", props: { sceneType: "city" } },
  "5-vocabulary-advanced": { type: "word-cloud", props: { showCategories: true } },
  "6-literature-analysis": { type: "book-3d", props: { showPageContent: true } },

  // History - Timeline and Events
  "k-past-present": { type: "timeline-3d", props: { title: "Then and Now" } },
  "1-american-symbols": { type: "historical-monument", props: { type: "lighthouse" } },
  "1-community-history": { type: "timeline-3d", props: { title: "Our Community" } },
  "2-american-history": { type: "timeline-3d", props: { title: "American History" } },
  "2-famous-americans": { type: "historical-monument", props: { type: "lighthouse" } },
  "3-native-americans": { type: "world-map", props: { title: "Native American Regions" } },
  "3-explorers": { type: "world-map", props: { title: "Age of Exploration" } },
  "4-colonial-america": { type: "timeline-3d", props: { title: "Colonial Period" } },
  "4-revolution": { type: "timeline-3d", props: { title: "American Revolution" } },
  "5-westward-expansion": { type: "world-map", props: { title: "Westward Expansion" } },
  "5-civil-war": { type: "timeline-3d", props: { title: "Civil War Era" } },
  "6-ancient-civilizations": { type: "historical-monument", props: { type: "pyramid" } },
  "6-ancient-egypt": { type: "historical-monument", props: { type: "pyramid" } },
  "6-ancient-greece": { type: "historical-monument", props: { type: "temple" } },
  "6-ancient-rome": { type: "historical-monument", props: { type: "colosseum" } },
  "7-medieval-europe": { type: "historical-monument", props: { type: "castle" } },
  "7-world-geography": { type: "world-map", props: { showLabels: true } },
  "8-world-history": { type: "timeline-3d", props: { title: "World History" } },
  "8-renaissance": { type: "historical-monument", props: { type: "tower" } },
  "9-us-history": { type: "timeline-3d", props: { title: "US History" } },
  "9-world-geography": { type: "world-map", props: { interactive: true } },
  "10-world-history": { type: "timeline-3d", props: { title: "Modern World" } },
  "11-us-history-advanced": { type: "timeline-3d", props: { showDescriptions: true } },
  "12-government": { type: "historical-monument", props: { type: "temple" } },
};

/**
 * Keyword patterns for auto-detection fallback
 */
const keywordPatterns: Array<{ pattern: RegExp; config: VisualizationConfig }> = [
  // Math patterns
  { pattern: /shape|geometry|polygon|triangle|square|circle|cube|sphere/i, config: { type: "shape-explorer" } },
  { pattern: /fraction|numerator|denominator|half|third|quarter/i, config: { type: "fraction-visualizer" } },
  { pattern: /multiply|multiplication|times|product|factor/i, config: { type: "multiplication-grid" } },
  { pattern: /number\s*line|counting|compare\s*number/i, config: { type: "number-line" } },
  { pattern: /coordinate|graph|plot|x-axis|y-axis|quadrant/i, config: { type: "coordinate-system" } },

  // Science patterns
  { pattern: /solar\s*system|planet|sun|moon|earth|orbit/i, config: { type: "solar-system" } },
  { pattern: /atom|element|electron|proton|neutron|molecule/i, config: { type: "atom-model" } },
  { pattern: /water\s*cycle|evaporation|condensation|precipitation/i, config: { type: "water-cycle" } },

  // Reading patterns
  { pattern: /book|reading|chapter|novel|literature/i, config: { type: "book-3d" } },
  { pattern: /vocabulary|words|spelling|phonics|syllable/i, config: { type: "word-cloud" } },
  { pattern: /story|character|setting|plot|narrative|fiction/i, config: { type: "story-scene" } },

  // History patterns
  { pattern: /timeline|era|century|decade|period|chronolog/i, config: { type: "timeline-3d" } },
  { pattern: /pyramid|colosseum|temple|castle|monument|landmark/i, config: { type: "historical-monument" } },
  { pattern: /map|geography|continent|country|region|territory/i, config: { type: "world-map" } },
  { pattern: /ancient|medieval|renaissance|revolution|war|civilization/i, config: { type: "timeline-3d" } },
];

/**
 * Subject-based default visualizations
 */
const subjectDefaults: Record<string, VisualizationConfig> = {
  math: { type: "number-line" },
  science: { type: "atom-model" },
  reading: { type: "book-3d" },
  history: { type: "timeline-3d" },
  technology: { type: "none" },
};

/**
 * Get visualization configuration for a lesson
 */
export function getVisualizationConfig(
  lessonId: string,
  lessonTitle: string,
  subjectId: string,
  gradeLevel: GradeLevel
): VisualizationConfig | null {
  // 1. Check explicit mapping first
  if (explicitMappings[lessonId]) {
    const config = explicitMappings[lessonId];
    return {
      ...config,
      ageGroup: config.ageGroup ?? gradeToAgeGroup(gradeLevel),
    };
  }

  // 2. Try keyword-based detection from title
  for (const { pattern, config } of keywordPatterns) {
    if (pattern.test(lessonTitle)) {
      return {
        ...config,
        ageGroup: gradeToAgeGroup(gradeLevel),
      };
    }
  }

  // 3. Fall back to subject defaults
  const defaultConfig = subjectDefaults[subjectId];
  if (defaultConfig && defaultConfig.type !== "none") {
    return {
      ...defaultConfig,
      ageGroup: gradeToAgeGroup(gradeLevel),
    };
  }

  // 4. No visualization available
  return null;
}

/**
 * Check if a visualization type is available for a subject
 */
export function hasVisualizationSupport(subjectId: string): boolean {
  return subjectId === "math" || subjectId === "science" || subjectId === "reading" || subjectId === "history";
}
