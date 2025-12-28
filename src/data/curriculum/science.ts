/**
 * Science Curriculum K-12
 * Aligned with Next Generation Science Standards (NGSS)
 */

import type { Subject, Unit } from "./types";
import { createLesson } from "./utils";

// Kindergarten Science
const kindergartenUnits: Unit[] = [
  {
    id: "k-weather",
    title: "Weather & Climate",
    slug: "weather-climate",
    description: "Observe and describe weather patterns",
    gradeLevel: 0,
    standardsAlignment: ["K-ESS2-1", "K-ESS3-2"],
    lessons: [
      createLesson("k-weather-types", "Types of Weather", "Identify different weather conditions", 25),
      createLesson("k-seasons", "Seasons", "Observe seasonal changes", 25),
      createLesson("k-weather-clothing", "Weather and Clothing", "Connect weather to daily life", 20),
    ],
  },
  {
    id: "k-plants-animals",
    title: "Plants & Animals",
    slug: "plants-animals",
    description: "Explore living things and their needs",
    gradeLevel: 0,
    standardsAlignment: ["K-LS1-1", "K-ESS3-1"],
    lessons: [
      createLesson("k-living-nonliving", "Living vs Non-Living", "Distinguish living from non-living things", 25),
      createLesson("k-plant-needs", "What Plants Need", "Identify what plants need to survive", 25),
      createLesson("k-animal-needs", "What Animals Need", "Identify what animals need to survive", 25),
    ],
  },
];

// Grade 1-2 Science
const grade1Units: Unit[] = [
  {
    id: "1-light-sound",
    title: "Light & Sound",
    slug: "light-sound",
    description: "Investigate light and sound phenomena",
    gradeLevel: 1,
    standardsAlignment: ["1-PS4-1", "1-PS4-2", "1-PS4-3"],
    lessons: [
      createLesson("1-light-sources", "Light Sources", "Identify sources of light", 30),
      createLesson("1-shadows", "Shadows", "Investigate how shadows are made", 30),
      createLesson("1-sound-vibrations", "Sound Vibrations", "Explore how sound is produced", 30),
    ],
  },
  {
    id: "1-sky-patterns",
    title: "Sky Patterns",
    slug: "sky-patterns",
    description: "Observe patterns in the sky",
    gradeLevel: 1,
    standardsAlignment: ["1-ESS1-1", "1-ESS1-2"],
    lessons: [
      createLesson("1-sun-moon", "Sun and Moon", "Observe the sun and moon", 30),
      createLesson("1-day-night", "Day and Night", "Understand day and night cycle", 30),
      createLesson("1-stars", "Stars", "Observe stars in the night sky", 30),
    ],
  },
];

const grade2Units: Unit[] = [
  {
    id: "2-matter",
    title: "Matter & Materials",
    slug: "matter-materials",
    description: "Explore properties of matter",
    gradeLevel: 2,
    standardsAlignment: ["2-PS1-1", "2-PS1-2"],
    lessons: [
      createLesson("2-properties", "Properties of Matter", "Describe properties of materials", 35),
      createLesson("2-solids-liquids", "Solids and Liquids", "Compare solids and liquids", 35),
      createLesson("2-heating-cooling", "Heating and Cooling", "Observe changes from heating/cooling", 35),
    ],
  },
  {
    id: "2-ecosystems",
    title: "Ecosystems",
    slug: "ecosystems",
    description: "Understand plant and animal interactions",
    gradeLevel: 2,
    standardsAlignment: ["2-LS2-1", "2-LS4-1"],
    lessons: [
      createLesson("2-habitats", "Habitats", "Identify different habitats", 35),
      createLesson("2-food-chains", "Food Chains", "Understand simple food chains", 35),
      createLesson("2-seed-dispersal", "Seed Dispersal", "Learn how seeds spread", 35),
    ],
  },
];

// Grade 3-5 Science
const grade3Units: Unit[] = [
  {
    id: "3-forces-motion",
    title: "Forces & Motion",
    slug: "forces-motion",
    description: "Investigate forces and their effects",
    gradeLevel: 3,
    standardsAlignment: ["3-PS2-1", "3-PS2-2"],
    lessons: [
      createLesson("3-balanced-forces", "Balanced Forces", "Understand balanced and unbalanced forces", 40),
      createLesson("3-friction", "Friction", "Investigate friction", 40),
      createLesson("3-magnets", "Magnets", "Explore magnetic forces", 40),
    ],
  },
  {
    id: "3-life-cycles",
    title: "Life Cycles",
    slug: "life-cycles",
    description: "Explore life cycles of organisms",
    gradeLevel: 3,
    standardsAlignment: ["3-LS1-1", "3-LS3-1"],
    lessons: [
      createLesson("3-plant-life-cycle", "Plant Life Cycles", "Study plant life cycles", 40),
      createLesson("3-animal-life-cycle", "Animal Life Cycles", "Compare animal life cycles", 40),
      createLesson("3-inherited-traits", "Inherited Traits", "Understand inherited characteristics", 40),
    ],
  },
];

const grade4Units: Unit[] = [
  {
    id: "4-energy",
    title: "Energy",
    slug: "energy",
    description: "Explore energy transfer and transformation",
    gradeLevel: 4,
    standardsAlignment: ["4-PS3-1", "4-PS3-2", "4-PS3-4"],
    lessons: [
      createLesson("4-energy-forms", "Forms of Energy", "Identify different forms of energy", 45),
      createLesson("4-energy-transfer", "Energy Transfer", "Investigate energy transfer", 45),
      createLesson("4-renewable-energy", "Renewable Energy", "Explore renewable energy sources", 45),
    ],
  },
  {
    id: "4-earth-systems",
    title: "Earth Systems",
    slug: "earth-systems",
    description: "Understand Earth's systems and changes",
    gradeLevel: 4,
    standardsAlignment: ["4-ESS1-1", "4-ESS2-1", "4-ESS2-2"],
    lessons: [
      createLesson("4-rocks-minerals", "Rocks and Minerals", "Identify rocks and minerals", 45),
      createLesson("4-weathering-erosion", "Weathering and Erosion", "Understand Earth surface changes", 45),
      createLesson("4-water-cycle", "Water Cycle", "Explore the water cycle", 45),
    ],
  },
];

const grade5Units: Unit[] = [
  {
    id: "5-matter-changes",
    title: "Matter & Changes",
    slug: "matter-changes",
    description: "Investigate physical and chemical changes",
    gradeLevel: 5,
    standardsAlignment: ["5-PS1-1", "5-PS1-2", "5-PS1-3"],
    lessons: [
      createLesson("5-states-of-matter", "States of Matter", "Understand states of matter", 45),
      createLesson("5-physical-changes", "Physical Changes", "Identify physical changes", 45),
      createLesson("5-chemical-changes", "Chemical Changes", "Recognize chemical reactions", 45),
    ],
  },
  {
    id: "5-ecosystems",
    title: "Ecosystems",
    slug: "ecosystems",
    description: "Analyze ecosystem interactions",
    gradeLevel: 5,
    standardsAlignment: ["5-LS2-1", "5-ESS2-1"],
    lessons: [
      createLesson("5-food-webs", "Food Webs", "Analyze complex food webs", 50),
      createLesson("5-decomposers", "Decomposers", "Understand decomposer role", 45),
      createLesson("5-human-impact", "Human Impact", "Investigate human effects on ecosystems", 50),
    ],
  },
];

// Grade 6-8 Science
const grade6Units: Unit[] = [
  {
    id: "6-cells",
    title: "Cells & Life",
    slug: "cells-life",
    description: "Explore cell structure and function",
    gradeLevel: 6,
    standardsAlignment: ["MS-LS1-1", "MS-LS1-2"],
    lessons: [
      createLesson("6-cell-structure", "Cell Structure", "Identify cell organelles", 50),
      createLesson("6-plant-animal-cells", "Plant vs Animal Cells", "Compare cell types", 50),
      createLesson("6-cell-processes", "Cell Processes", "Understand cellular processes", 50),
    ],
  },
  {
    id: "6-earth-space",
    title: "Earth & Space",
    slug: "earth-space",
    description: "Explore Earth's place in the universe",
    gradeLevel: 6,
    standardsAlignment: ["MS-ESS1-1", "MS-ESS1-2"],
    lessons: [
      createLesson("6-solar-system", "Solar System", "Explore our solar system", 50),
      createLesson("6-earth-moon", "Earth-Moon System", "Understand Earth-Moon interactions", 50),
      createLesson("6-seasons", "Seasons", "Explain seasonal changes", 50),
    ],
  },
];

const grade7Units: Unit[] = [
  {
    id: "7-body-systems",
    title: "Human Body Systems",
    slug: "body-systems",
    description: "Study human body systems",
    gradeLevel: 7,
    standardsAlignment: ["MS-LS1-3", "MS-LS1-8"],
    lessons: [
      createLesson("7-digestive", "Digestive System", "Understand digestion", 50),
      createLesson("7-circulatory", "Circulatory System", "Explore blood circulation", 50),
      createLesson("7-respiratory", "Respiratory System", "Study respiration", 50),
      createLesson("7-nervous", "Nervous System", "Investigate the nervous system", 55),
    ],
  },
  {
    id: "7-chemistry",
    title: "Chemistry Foundations",
    slug: "chemistry",
    description: "Introduction to chemistry concepts",
    gradeLevel: 7,
    standardsAlignment: ["MS-PS1-1", "MS-PS1-2"],
    lessons: [
      createLesson("7-atoms", "Atoms", "Understand atomic structure", 50),
      createLesson("7-elements", "Elements", "Explore the periodic table", 50),
      createLesson("7-compounds", "Compounds", "Understand chemical compounds", 50),
    ],
  },
];

const grade8Units: Unit[] = [
  {
    id: "8-physics",
    title: "Physics Fundamentals",
    slug: "physics",
    description: "Explore motion, forces, and energy",
    gradeLevel: 8,
    standardsAlignment: ["MS-PS2-1", "MS-PS2-2", "MS-PS3-1"],
    lessons: [
      createLesson("8-motion", "Motion", "Describe and calculate motion", 55),
      createLesson("8-forces", "Forces", "Understand Newton's Laws", 55),
      createLesson("8-energy-work", "Energy and Work", "Calculate work and energy", 55),
    ],
  },
  {
    id: "8-genetics",
    title: "Genetics",
    slug: "genetics",
    description: "Understand heredity and genetics",
    gradeLevel: 8,
    standardsAlignment: ["MS-LS3-1", "MS-LS3-2"],
    lessons: [
      createLesson("8-dna", "DNA", "Explore DNA structure", 55),
      createLesson("8-heredity", "Heredity", "Understand inheritance patterns", 55),
      createLesson("8-mutations", "Mutations", "Study genetic mutations", 55),
    ],
  },
];

// Grade 9-12 Science
const grade9Units: Unit[] = [
  {
    id: "9-biology",
    title: "Biology Foundations",
    slug: "biology",
    description: "Core biology concepts",
    gradeLevel: 9,
    standardsAlignment: ["HS-LS1-1", "HS-LS1-2"],
    lessons: [
      createLesson("9-cell-biology", "Cell Biology", "Advanced cell biology", 55),
      createLesson("9-photosynthesis", "Photosynthesis", "Understand photosynthesis", 55),
      createLesson("9-cellular-respiration", "Cellular Respiration", "Study cellular respiration", 55),
    ],
  },
  {
    id: "9-ecology",
    title: "Ecology",
    slug: "ecology",
    description: "Study of ecosystems",
    gradeLevel: 9,
    standardsAlignment: ["HS-LS2-1", "HS-LS2-6"],
    lessons: [
      createLesson("9-biomes", "Biomes", "Explore Earth's biomes", 55),
      createLesson("9-population-dynamics", "Population Dynamics", "Analyze populations", 55),
      createLesson("9-biogeochemical-cycles", "Biogeochemical Cycles", "Study matter cycles", 55),
    ],
  },
];

const grade10Units: Unit[] = [
  {
    id: "10-chemistry",
    title: "Chemistry",
    slug: "chemistry",
    description: "Comprehensive chemistry course",
    gradeLevel: 10,
    standardsAlignment: ["HS-PS1-1", "HS-PS1-2", "HS-PS1-7"],
    lessons: [
      createLesson("10-atomic-theory", "Atomic Theory", "Modern atomic theory", 55),
      createLesson("10-bonding", "Chemical Bonding", "Understand chemical bonds", 55),
      createLesson("10-reactions", "Chemical Reactions", "Study reaction types", 55),
      createLesson("10-stoichiometry", "Stoichiometry", "Calculate chemical quantities", 60),
    ],
  },
];

const grade11Units: Unit[] = [
  {
    id: "11-physics",
    title: "Physics",
    slug: "physics",
    description: "Comprehensive physics course",
    gradeLevel: 11,
    standardsAlignment: ["HS-PS2-1", "HS-PS3-1", "HS-PS4-1"],
    lessons: [
      createLesson("11-kinematics", "Kinematics", "Study motion mathematically", 60),
      createLesson("11-dynamics", "Dynamics", "Forces and Newton's Laws", 60),
      createLesson("11-energy-momentum", "Energy and Momentum", "Conservation laws", 60),
      createLesson("11-waves", "Waves", "Wave properties and behavior", 55),
    ],
  },
];

const grade12Units: Unit[] = [
  {
    id: "12-advanced-bio",
    title: "Advanced Biology",
    slug: "advanced-biology",
    description: "AP-level biology topics",
    gradeLevel: 12,
    standardsAlignment: ["HS-LS3-1", "HS-LS4-1"],
    lessons: [
      createLesson("12-molecular-genetics", "Molecular Genetics", "DNA replication and gene expression", 60),
      createLesson("12-biotechnology", "Biotechnology", "Modern genetic technologies", 60),
      createLesson("12-evolution", "Evolution", "Evolutionary biology", 60),
    ],
  },
  {
    id: "12-environmental",
    title: "Environmental Science",
    slug: "environmental",
    description: "Study environmental issues",
    gradeLevel: 12,
    standardsAlignment: ["HS-ESS3-1", "HS-ESS3-4"],
    lessons: [
      createLesson("12-climate-change", "Climate Change", "Understand climate science", 60),
      createLesson("12-sustainability", "Sustainability", "Explore sustainable practices", 60),
      createLesson("12-conservation", "Conservation", "Study conservation biology", 60),
    ],
  },
];

export const scienceCurriculum: Subject = {
  id: "science",
  name: "Science",
  slug: "science",
  description: "Comprehensive K-12 science curriculum aligned with Next Generation Science Standards (NGSS)",
  icon: "🔬",
  color: "from-primary/90 to-primary",
  grades: {
    0: kindergartenUnits,
    1: grade1Units,
    2: grade2Units,
    3: grade3Units,
    4: grade4Units,
    5: grade5Units,
    6: grade6Units,
    7: grade7Units,
    8: grade8Units,
    9: grade9Units,
    10: grade10Units,
    11: grade11Units,
    12: grade12Units,
  },
};
