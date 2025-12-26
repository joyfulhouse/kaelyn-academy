/**
 * Mathematics Curriculum K-12
 * Aligned with Common Core State Standards
 */

import type { Subject, Unit } from "./types";
import { createLesson } from "./utils";

// Kindergarten Math Units
const kindergartenUnits: Unit[] = [
  {
    id: "k-counting",
    title: "Counting & Cardinality",
    slug: "counting-cardinality",
    description: "Learn to count objects and understand numbers 0-20",
    gradeLevel: 0,
    standardsAlignment: ["K.CC.A.1", "K.CC.A.2", "K.CC.A.3"],
    lessons: [
      createLesson("k-count-1-10", "Counting 1 to 10", "Count objects from 1 to 10 using fun visual activities", 20),
      createLesson("k-count-11-20", "Counting 11 to 20", "Extend counting skills to 20", 20, ["k-count-1-10"]),
      createLesson("k-number-names", "Number Names", "Learn to write and recognize number names", 25, ["k-count-1-10"]),
      createLesson("k-counting-objects", "Counting Objects", "Count various objects and answer 'how many?'", 25),
      createLesson("k-compare-numbers", "Compare Numbers", "Learn greater than, less than, and equal", 30, ["k-count-11-20"]),
    ],
  },
  {
    id: "k-operations",
    title: "Operations & Algebraic Thinking",
    slug: "operations-algebraic",
    description: "Understand addition and subtraction within 10",
    gradeLevel: 0,
    standardsAlignment: ["K.OA.A.1", "K.OA.A.2", "K.OA.A.3"],
    lessons: [
      createLesson("k-addition-intro", "Introduction to Addition", "Combine groups to add numbers", 25),
      createLesson("k-subtraction-intro", "Introduction to Subtraction", "Take away to subtract numbers", 25, ["k-addition-intro"]),
      createLesson("k-add-sub-5", "Addition and Subtraction within 5", "Practice with numbers up to 5", 30),
      createLesson("k-add-sub-10", "Addition and Subtraction within 10", "Extend to numbers up to 10", 30, ["k-add-sub-5"]),
    ],
  },
  {
    id: "k-geometry",
    title: "Geometry",
    slug: "geometry",
    description: "Identify and describe shapes",
    gradeLevel: 0,
    standardsAlignment: ["K.G.A.1", "K.G.A.2", "K.G.A.3"],
    lessons: [
      createLesson("k-2d-shapes", "2D Shapes", "Learn circles, squares, triangles, and rectangles", 25),
      createLesson("k-3d-shapes", "3D Shapes", "Explore cubes, cones, cylinders, and spheres", 25, ["k-2d-shapes"]),
      createLesson("k-shape-attributes", "Shape Attributes", "Compare shapes by their attributes", 30),
    ],
  },
];

// Grade 1 Math Units
const grade1Units: Unit[] = [
  {
    id: "1-place-value",
    title: "Place Value",
    slug: "place-value",
    description: "Understand tens and ones place value",
    gradeLevel: 1,
    standardsAlignment: ["1.NBT.B.2", "1.NBT.B.3"],
    lessons: [
      createLesson("1-tens-ones", "Tens and Ones", "Understand place value with tens and ones", 30),
      createLesson("1-count-120", "Counting to 120", "Count, read, and write numbers to 120", 30),
      createLesson("1-compare-2digit", "Comparing Two-Digit Numbers", "Compare numbers using place value", 30),
    ],
  },
  {
    id: "1-addition-subtraction",
    title: "Addition & Subtraction",
    slug: "addition-subtraction",
    description: "Add and subtract within 20",
    gradeLevel: 1,
    standardsAlignment: ["1.OA.A.1", "1.OA.B.3", "1.OA.C.6"],
    lessons: [
      createLesson("1-add-within-20", "Addition within 20", "Master addition facts within 20", 35),
      createLesson("1-sub-within-20", "Subtraction within 20", "Master subtraction facts within 20", 35),
      createLesson("1-word-problems", "Word Problems", "Solve addition and subtraction word problems", 40),
      createLesson("1-fact-strategies", "Fact Strategies", "Learn strategies like doubles and make 10", 30),
    ],
  },
];

// Grade 2 Math Units
const grade2Units: Unit[] = [
  {
    id: "2-place-value",
    title: "Place Value to 1000",
    slug: "place-value-1000",
    description: "Understand hundreds, tens, and ones",
    gradeLevel: 2,
    standardsAlignment: ["2.NBT.A.1", "2.NBT.A.2", "2.NBT.A.3"],
    lessons: [
      createLesson("2-hundreds", "Understanding Hundreds", "Learn the hundreds place", 30),
      createLesson("2-count-1000", "Counting to 1000", "Skip count and count to 1000", 30),
      createLesson("2-compare-3digit", "Comparing Numbers to 1000", "Compare three-digit numbers", 35),
    ],
  },
  {
    id: "2-addition-subtraction",
    title: "Addition & Subtraction to 1000",
    slug: "add-sub-1000",
    description: "Add and subtract within 1000",
    gradeLevel: 2,
    standardsAlignment: ["2.NBT.B.5", "2.NBT.B.6", "2.NBT.B.7"],
    lessons: [
      createLesson("2-add-100", "Addition within 100", "Add two-digit numbers fluently", 35),
      createLesson("2-sub-100", "Subtraction within 100", "Subtract two-digit numbers", 35),
      createLesson("2-add-1000", "Addition within 1000", "Add numbers to 1000", 40),
      createLesson("2-mental-math", "Mental Math Strategies", "Develop mental math skills", 30),
    ],
  },
  {
    id: "2-measurement",
    title: "Measurement & Data",
    slug: "measurement-data",
    description: "Measure lengths and work with time and money",
    gradeLevel: 2,
    standardsAlignment: ["2.MD.A.1", "2.MD.C.7", "2.MD.C.8"],
    lessons: [
      createLesson("2-length", "Measuring Length", "Measure with standard units", 30),
      createLesson("2-time", "Telling Time", "Tell and write time to the nearest 5 minutes", 35),
      createLesson("2-money", "Money", "Solve problems involving money", 35),
    ],
  },
];

// Grade 3-5 (Late Elementary)
const grade3Units: Unit[] = [
  {
    id: "3-multiplication",
    title: "Multiplication & Division",
    slug: "multiplication-division",
    description: "Understand concepts of multiplication and division",
    gradeLevel: 3,
    standardsAlignment: ["3.OA.A.1", "3.OA.A.2", "3.OA.C.7"],
    lessons: [
      createLesson("3-mult-intro", "Introduction to Multiplication", "Understand multiplication as groups", 35),
      createLesson("3-mult-facts", "Multiplication Facts", "Learn multiplication tables 0-10", 40),
      createLesson("3-division-intro", "Introduction to Division", "Understand division as sharing", 35),
      createLesson("3-mult-div-relationship", "Multiplication-Division Relationship", "Connect multiplication and division", 35),
    ],
  },
  {
    id: "3-fractions",
    title: "Introduction to Fractions",
    slug: "fractions-intro",
    description: "Develop understanding of fractions",
    gradeLevel: 3,
    standardsAlignment: ["3.NF.A.1", "3.NF.A.2", "3.NF.A.3"],
    lessons: [
      createLesson("3-fraction-parts", "Parts of a Whole", "Understand fractions as parts of a whole", 35),
      createLesson("3-number-line-fractions", "Fractions on a Number Line", "Represent fractions on number lines", 35),
      createLesson("3-equivalent-fractions", "Equivalent Fractions", "Understand and identify equivalent fractions", 40),
    ],
  },
];

const grade4Units: Unit[] = [
  {
    id: "4-multi-digit",
    title: "Multi-Digit Operations",
    slug: "multi-digit-operations",
    description: "Multiply and divide multi-digit numbers",
    gradeLevel: 4,
    standardsAlignment: ["4.NBT.B.4", "4.NBT.B.5", "4.NBT.B.6"],
    lessons: [
      createLesson("4-multiply-1digit", "Multiply by 1-Digit", "Multiply multi-digit by one-digit numbers", 40),
      createLesson("4-multiply-2digit", "Multiply by 2-Digit", "Multiply two-digit by two-digit numbers", 45),
      createLesson("4-divide-1digit", "Divide by 1-Digit", "Divide multi-digit by one-digit numbers", 45),
    ],
  },
  {
    id: "4-fractions-decimals",
    title: "Fractions & Decimals",
    slug: "fractions-decimals",
    description: "Extend fraction understanding and introduce decimals",
    gradeLevel: 4,
    standardsAlignment: ["4.NF.A.1", "4.NF.B.3", "4.NF.C.6"],
    lessons: [
      createLesson("4-equivalent-fractions", "Equivalent Fractions", "Generate equivalent fractions", 35),
      createLesson("4-add-sub-fractions", "Add and Subtract Fractions", "Add and subtract with like denominators", 40),
      createLesson("4-decimals-intro", "Introduction to Decimals", "Understand decimal notation for fractions", 35),
    ],
  },
];

const grade5Units: Unit[] = [
  {
    id: "5-operations",
    title: "Operations with Whole Numbers",
    slug: "whole-number-operations",
    description: "Master all operations with multi-digit whole numbers",
    gradeLevel: 5,
    standardsAlignment: ["5.NBT.B.5", "5.NBT.B.6"],
    lessons: [
      createLesson("5-multiply-whole", "Multiply Multi-Digit Numbers", "Fluently multiply multi-digit whole numbers", 45),
      createLesson("5-divide-whole", "Divide Multi-Digit Numbers", "Divide whole numbers with 2-digit divisors", 45),
    ],
  },
  {
    id: "5-fractions",
    title: "Fractions Operations",
    slug: "fraction-operations",
    description: "Add, subtract, multiply, and divide fractions",
    gradeLevel: 5,
    standardsAlignment: ["5.NF.A.1", "5.NF.B.4", "5.NF.B.7"],
    lessons: [
      createLesson("5-add-sub-fractions", "Add & Subtract Fractions", "Add and subtract with unlike denominators", 45),
      createLesson("5-multiply-fractions", "Multiply Fractions", "Multiply fractions and whole numbers", 45),
      createLesson("5-divide-fractions", "Divide Fractions", "Divide fractions by whole numbers", 45),
    ],
  },
  {
    id: "5-decimals",
    title: "Decimals Operations",
    slug: "decimal-operations",
    description: "Perform operations with decimals",
    gradeLevel: 5,
    standardsAlignment: ["5.NBT.B.7"],
    lessons: [
      createLesson("5-add-sub-decimals", "Add & Subtract Decimals", "Add and subtract decimals to hundredths", 40),
      createLesson("5-multiply-decimals", "Multiply Decimals", "Multiply decimals to hundredths", 45),
      createLesson("5-divide-decimals", "Divide Decimals", "Divide decimals to hundredths", 45),
    ],
  },
];

// Grade 6-8 (Middle School)
const grade6Units: Unit[] = [
  {
    id: "6-ratios",
    title: "Ratios & Proportional Relationships",
    slug: "ratios-proportions",
    description: "Understand ratio concepts and use ratio reasoning",
    gradeLevel: 6,
    standardsAlignment: ["6.RP.A.1", "6.RP.A.2", "6.RP.A.3"],
    lessons: [
      createLesson("6-ratios-intro", "Understanding Ratios", "Understand ratio concepts", 45),
      createLesson("6-unit-rates", "Unit Rates", "Understand and use unit rates", 45),
      createLesson("6-percent", "Percent", "Use percent to solve problems", 45),
    ],
  },
  {
    id: "6-expressions",
    title: "Expressions & Equations",
    slug: "expressions-equations",
    description: "Apply and extend understanding of arithmetic to algebraic expressions",
    gradeLevel: 6,
    standardsAlignment: ["6.EE.A.1", "6.EE.A.2", "6.EE.B.7"],
    lessons: [
      createLesson("6-exponents", "Exponents", "Write and evaluate numerical expressions with exponents", 40),
      createLesson("6-variables", "Variables and Expressions", "Write, read, and evaluate expressions", 45),
      createLesson("6-one-step-equations", "One-Step Equations", "Solve one-step equations", 45),
    ],
  },
];

const grade7Units: Unit[] = [
  {
    id: "7-rational-numbers",
    title: "Rational Numbers",
    slug: "rational-numbers",
    description: "Apply operations to rational numbers",
    gradeLevel: 7,
    standardsAlignment: ["7.NS.A.1", "7.NS.A.2", "7.NS.A.3"],
    lessons: [
      createLesson("7-add-sub-integers", "Add & Subtract Integers", "Operations with positive and negative numbers", 45),
      createLesson("7-multiply-divide-rational", "Multiply & Divide Rational Numbers", "Operations with rational numbers", 50),
    ],
  },
  {
    id: "7-proportional",
    title: "Proportional Relationships",
    slug: "proportional-relationships",
    description: "Analyze proportional relationships",
    gradeLevel: 7,
    standardsAlignment: ["7.RP.A.1", "7.RP.A.2"],
    lessons: [
      createLesson("7-constant-proportionality", "Constant of Proportionality", "Identify constant of proportionality", 45),
      createLesson("7-proportional-graphs", "Graphs of Proportional Relationships", "Graph and interpret proportions", 50),
    ],
  },
  {
    id: "7-equations",
    title: "Equations & Inequalities",
    slug: "equations-inequalities",
    description: "Solve multi-step equations and inequalities",
    gradeLevel: 7,
    standardsAlignment: ["7.EE.B.3", "7.EE.B.4"],
    lessons: [
      createLesson("7-two-step-equations", "Two-Step Equations", "Solve two-step equations", 50),
      createLesson("7-inequalities", "Inequalities", "Solve and graph inequalities", 50),
    ],
  },
];

const grade8Units: Unit[] = [
  {
    id: "8-linear-equations",
    title: "Linear Equations",
    slug: "linear-equations",
    description: "Analyze and solve linear equations and systems",
    gradeLevel: 8,
    standardsAlignment: ["8.EE.C.7", "8.EE.C.8"],
    lessons: [
      createLesson("8-linear-equations-one", "Linear Equations in One Variable", "Solve linear equations with one variable", 50),
      createLesson("8-systems", "Systems of Linear Equations", "Solve systems of two linear equations", 55),
    ],
  },
  {
    id: "8-functions",
    title: "Functions",
    slug: "functions",
    description: "Define, evaluate, and compare functions",
    gradeLevel: 8,
    standardsAlignment: ["8.F.A.1", "8.F.A.2", "8.F.B.4"],
    lessons: [
      createLesson("8-functions-intro", "Understanding Functions", "Understand the concept of a function", 45),
      createLesson("8-compare-functions", "Compare Functions", "Compare properties of functions", 50),
      createLesson("8-linear-functions", "Linear Functions", "Model linear relationships with functions", 50),
    ],
  },
  {
    id: "8-geometry",
    title: "Geometry",
    slug: "geometry",
    description: "Understand congruence and similarity, Pythagorean theorem",
    gradeLevel: 8,
    standardsAlignment: ["8.G.A.1", "8.G.B.6", "8.G.B.7"],
    lessons: [
      createLesson("8-transformations", "Transformations", "Understand congruence through transformations", 50),
      createLesson("8-pythagorean", "Pythagorean Theorem", "Apply the Pythagorean theorem", 55),
      createLesson("8-volume", "Volume", "Solve problems involving volume", 45),
    ],
  },
];

// Grade 9-12 (High School)
const grade9Units: Unit[] = [
  {
    id: "9-algebra-foundations",
    title: "Algebra Foundations",
    slug: "algebra-foundations",
    description: "Build foundational algebra skills",
    gradeLevel: 9,
    standardsAlignment: ["HSA-SSE.A.1", "HSA-APR.A.1"],
    lessons: [
      createLesson("9-variables-expressions", "Variables and Expressions", "Work with algebraic expressions", 50),
      createLesson("9-equations-review", "Equations Review", "Solve equations of various types", 50),
      createLesson("9-polynomials", "Polynomials", "Understand and manipulate polynomials", 55),
    ],
  },
  {
    id: "9-linear-relationships",
    title: "Linear Relationships",
    slug: "linear-relationships",
    description: "Master linear equations and functions",
    gradeLevel: 9,
    standardsAlignment: ["HSA-CED.A.2", "HSF-IF.C.7"],
    lessons: [
      createLesson("9-slope-intercept", "Slope-Intercept Form", "Graph and write equations in slope-intercept form", 50),
      createLesson("9-point-slope", "Point-Slope Form", "Use point-slope form", 50),
      createLesson("9-parallel-perpendicular", "Parallel and Perpendicular Lines", "Analyze special line relationships", 50),
    ],
  },
];

const grade10Units: Unit[] = [
  {
    id: "10-quadratics",
    title: "Quadratic Functions",
    slug: "quadratic-functions",
    description: "Analyze and solve quadratic equations",
    gradeLevel: 10,
    standardsAlignment: ["HSA-SSE.B.3", "HSA-REI.B.4"],
    lessons: [
      createLesson("10-quadratic-intro", "Introduction to Quadratics", "Understand quadratic functions", 55),
      createLesson("10-factoring", "Factoring Quadratics", "Factor quadratic expressions", 55),
      createLesson("10-quadratic-formula", "Quadratic Formula", "Use the quadratic formula", 55),
      createLesson("10-completing-square", "Completing the Square", "Solve by completing the square", 55),
    ],
  },
  {
    id: "10-geometry",
    title: "Geometry",
    slug: "geometry",
    description: "Explore geometric relationships and proofs",
    gradeLevel: 10,
    standardsAlignment: ["HSG-CO.A.1", "HSG-SRT.B.5"],
    lessons: [
      createLesson("10-geometric-proofs", "Geometric Proofs", "Write and understand geometric proofs", 55),
      createLesson("10-similarity", "Similarity", "Understand and apply similarity", 50),
      createLesson("10-right-triangles", "Right Triangle Trigonometry", "Apply trigonometry to right triangles", 55),
    ],
  },
];

const grade11Units: Unit[] = [
  {
    id: "11-exponential",
    title: "Exponential & Logarithmic Functions",
    slug: "exponential-logarithmic",
    description: "Understand exponential and logarithmic relationships",
    gradeLevel: 11,
    standardsAlignment: ["HSF-LE.A.1", "HSF-LE.A.4"],
    lessons: [
      createLesson("11-exponential-functions", "Exponential Functions", "Analyze exponential growth and decay", 55),
      createLesson("11-logarithms", "Logarithms", "Understand and apply logarithms", 55),
      createLesson("11-exponential-equations", "Exponential Equations", "Solve exponential equations", 55),
    ],
  },
  {
    id: "11-statistics",
    title: "Statistics & Probability",
    slug: "statistics-probability",
    description: "Analyze data and understand probability",
    gradeLevel: 11,
    standardsAlignment: ["HSS-ID.A.1", "HSS-CP.A.1"],
    lessons: [
      createLesson("11-data-analysis", "Data Analysis", "Analyze data distributions", 50),
      createLesson("11-probability", "Probability", "Calculate and interpret probability", 55),
      createLesson("11-conditional-probability", "Conditional Probability", "Understand conditional probability", 55),
    ],
  },
];

const grade12Units: Unit[] = [
  {
    id: "12-precalculus",
    title: "Pre-Calculus Concepts",
    slug: "precalculus",
    description: "Prepare for calculus with advanced functions",
    gradeLevel: 12,
    standardsAlignment: ["HSF-TF.A.1", "HSF-BF.A.1"],
    lessons: [
      createLesson("12-trig-functions", "Trigonometric Functions", "Extend trigonometry to unit circle", 55),
      createLesson("12-sequences-series", "Sequences and Series", "Analyze arithmetic and geometric sequences", 55),
      createLesson("12-limits-intro", "Introduction to Limits", "Understand the concept of limits", 60),
    ],
  },
  {
    id: "12-calculus-intro",
    title: "Introduction to Calculus",
    slug: "calculus-intro",
    description: "Begin calculus concepts",
    gradeLevel: 12,
    standardsAlignment: [],
    lessons: [
      createLesson("12-derivatives-intro", "Introduction to Derivatives", "Understand rate of change", 60),
      createLesson("12-integrals-intro", "Introduction to Integrals", "Understand area under curves", 60),
    ],
  },
];

// Complete Math Curriculum
export const mathCurriculum: Subject = {
  id: "math",
  name: "Mathematics",
  slug: "math",
  description: "Comprehensive K-12 mathematics curriculum aligned with Common Core State Standards",
  icon: "🔢",
  color: "from-blue-500 to-cyan-500",
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
