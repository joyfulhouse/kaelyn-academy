/**
 * Technology & Computer Science Curriculum K-12
 * Aligned with CSTA Standards
 */

import type { Subject, Unit, Lesson } from "./types";

function createLesson(
  id: string,
  title: string,
  description: string,
  duration: number = 40,
  prerequisites: string[] = []
): Lesson {
  return {
    id,
    title,
    slug: id,
    description,
    duration,
    objectives: [],
    prerequisites,
    activities: [],
    assessmentType: "practice",
  };
}

// K-2 Technology
const kindergartenUnits: Unit[] = [
  {
    id: "k-tech-basics",
    title: "Technology Basics",
    slug: "tech-basics",
    description: "Introduction to computers and devices",
    gradeLevel: 0,
    standardsAlignment: ["1A-CS-01", "1A-CS-02"],
    lessons: [
      createLesson("k-parts-computer", "Parts of a Computer", "Learn about keyboard, mouse, and screen", 25),
      createLesson("k-using-mouse", "Using the Mouse", "Practice clicking and dragging", 25),
      createLesson("k-keyboard", "Keyboard Fun", "Type letters and numbers", 25),
    ],
  },
];

const grade1Units: Unit[] = [
  {
    id: "1-digital-citizenship",
    title: "Digital Citizenship",
    slug: "digital-citizenship",
    description: "Learn about safe technology use",
    gradeLevel: 1,
    standardsAlignment: ["1A-IC-17", "1A-IC-18"],
    lessons: [
      createLesson("1-internet-safety", "Internet Safety", "Stay safe online", 30),
      createLesson("1-passwords", "Passwords", "Creating strong passwords", 30),
      createLesson("1-digital-footprint", "Digital Footprint", "What we share online", 30),
    ],
  },
];

const grade2Units: Unit[] = [
  {
    id: "2-computational-thinking",
    title: "Computational Thinking",
    slug: "computational-thinking",
    description: "Introduction to problem solving",
    gradeLevel: 2,
    standardsAlignment: ["1A-AP-08", "1A-AP-09"],
    lessons: [
      createLesson("2-sequences", "Sequences", "Put steps in order", 35),
      createLesson("2-patterns", "Finding Patterns", "Identify patterns in data", 35),
      createLesson("2-algorithms", "Simple Algorithms", "Create step-by-step instructions", 35),
    ],
  },
];

// 3-5 Technology
const grade3Units: Unit[] = [
  {
    id: "3-coding-intro",
    title: "Introduction to Coding",
    slug: "coding-intro",
    description: "Learn block-based programming",
    gradeLevel: 3,
    standardsAlignment: ["1B-AP-09", "1B-AP-10"],
    lessons: [
      createLesson("3-block-coding", "Block Coding", "Introduction to Scratch", 40),
      createLesson("3-loops", "Loops", "Repeat actions with loops", 40),
      createLesson("3-events", "Events", "Program with events", 40),
    ],
  },
];

const grade4Units: Unit[] = [
  {
    id: "4-programming",
    title: "Programming Concepts",
    slug: "programming",
    description: "Expand programming knowledge",
    gradeLevel: 4,
    standardsAlignment: ["1B-AP-11", "1B-AP-12"],
    lessons: [
      createLesson("4-variables", "Variables", "Store and use data", 45),
      createLesson("4-conditionals", "Conditionals", "Make decisions in code", 45),
      createLesson("4-debugging", "Debugging", "Find and fix errors", 45),
    ],
  },
];

const grade5Units: Unit[] = [
  {
    id: "5-data",
    title: "Data & Information",
    slug: "data-info",
    description: "Work with data",
    gradeLevel: 5,
    standardsAlignment: ["1B-DA-06", "1B-DA-07"],
    lessons: [
      createLesson("5-data-collection", "Data Collection", "Collect and organize data", 45),
      createLesson("5-data-visualization", "Data Visualization", "Create charts and graphs", 45),
      createLesson("5-spreadsheets", "Spreadsheets", "Introduction to spreadsheets", 45),
    ],
  },
];

// 6-8 Technology
const grade6Units: Unit[] = [
  {
    id: "6-web-design",
    title: "Web Design",
    slug: "web-design",
    description: "Create web pages",
    gradeLevel: 6,
    standardsAlignment: ["2-AP-13", "2-AP-16"],
    lessons: [
      createLesson("6-html-basics", "HTML Basics", "Create web page structure", 50),
      createLesson("6-css-styling", "CSS Styling", "Style web pages", 50),
      createLesson("6-web-project", "Web Project", "Build a personal website", 60),
    ],
  },
];

const grade7Units: Unit[] = [
  {
    id: "7-text-coding",
    title: "Text-Based Coding",
    slug: "text-coding",
    description: "Transition to text programming",
    gradeLevel: 7,
    standardsAlignment: ["2-AP-13", "2-AP-15"],
    lessons: [
      createLesson("7-python-intro", "Python Introduction", "First steps in Python", 50),
      createLesson("7-python-functions", "Functions", "Create reusable code", 50),
      createLesson("7-python-lists", "Lists and Loops", "Work with collections", 50),
    ],
  },
];

const grade8Units: Unit[] = [
  {
    id: "8-cybersecurity",
    title: "Cybersecurity",
    slug: "cybersecurity",
    description: "Learn about online security",
    gradeLevel: 8,
    standardsAlignment: ["2-IC-20", "2-IC-23"],
    lessons: [
      createLesson("8-threats", "Cyber Threats", "Understand online threats", 50),
      createLesson("8-encryption", "Encryption", "Basics of encryption", 50),
      createLesson("8-privacy", "Privacy", "Protect personal information", 50),
    ],
  },
  {
    id: "8-app-development",
    title: "App Development",
    slug: "app-dev",
    description: "Build mobile applications",
    gradeLevel: 8,
    standardsAlignment: ["2-AP-16", "2-AP-17"],
    lessons: [
      createLesson("8-app-design", "App Design", "Design mobile apps", 55),
      createLesson("8-app-prototype", "Prototyping", "Create app prototypes", 55),
    ],
  },
];

// 9-12 Technology
const grade9Units: Unit[] = [
  {
    id: "9-cs-foundations",
    title: "CS Foundations",
    slug: "cs-foundations",
    description: "Computer science fundamentals",
    gradeLevel: 9,
    standardsAlignment: ["3A-CS-01", "3A-CS-02"],
    lessons: [
      createLesson("9-computing-history", "History of Computing", "Evolution of computers", 50),
      createLesson("9-hardware", "Computer Hardware", "Understanding hardware components", 50),
      createLesson("9-software", "Software Systems", "Operating systems and applications", 50),
    ],
  },
];

const grade10Units: Unit[] = [
  {
    id: "10-programming-1",
    title: "Programming I",
    slug: "programming-1",
    description: "Comprehensive programming course",
    gradeLevel: 10,
    standardsAlignment: ["3A-AP-13", "3A-AP-16"],
    lessons: [
      createLesson("10-oop", "Object-Oriented Programming", "Classes and objects", 55),
      createLesson("10-data-structures", "Data Structures", "Arrays, lists, and dictionaries", 55),
      createLesson("10-algorithms", "Algorithms", "Sorting and searching", 55),
      createLesson("10-project", "Programming Project", "Build a complete application", 90),
    ],
  },
];

const grade11Units: Unit[] = [
  {
    id: "11-ap-csp",
    title: "AP CS Principles",
    slug: "ap-csp",
    description: "AP Computer Science Principles",
    gradeLevel: 11,
    standardsAlignment: ["3A-AP-18", "3A-DA-12"],
    lessons: [
      createLesson("11-internet", "The Internet", "How the internet works", 55),
      createLesson("11-big-data", "Big Data", "Analyze large datasets", 55),
      createLesson("11-impact", "Computing Impact", "Technology's effect on society", 55),
      createLesson("11-create-task", "Create Task", "AP Create Task project", 120),
    ],
  },
];

const grade12Units: Unit[] = [
  {
    id: "12-ap-csa",
    title: "AP CS A",
    slug: "ap-csa",
    description: "AP Computer Science A (Java)",
    gradeLevel: 12,
    standardsAlignment: ["3B-AP-21", "3B-AP-22"],
    lessons: [
      createLesson("12-java-oop", "Java OOP", "Advanced object-oriented concepts", 60),
      createLesson("12-recursion", "Recursion", "Recursive algorithms", 60),
      createLesson("12-2d-arrays", "2D Arrays", "Working with matrices", 60),
      createLesson("12-searching-sorting", "Searching & Sorting", "Classic algorithms", 60),
    ],
  },
  {
    id: "12-emerging-tech",
    title: "Emerging Technologies",
    slug: "emerging-tech",
    description: "Explore cutting-edge technology",
    gradeLevel: 12,
    standardsAlignment: ["3B-IC-25", "3B-IC-26"],
    lessons: [
      createLesson("12-ai-ml", "AI & Machine Learning", "Understand AI concepts", 55),
      createLesson("12-blockchain", "Blockchain", "Distributed ledger technology", 55),
      createLesson("12-future-tech", "Future of Technology", "Emerging trends", 55),
    ],
  },
];

export const technologyCurriculum: Subject = {
  id: "technology",
  name: "Technology",
  slug: "technology",
  description: "Comprehensive K-12 computer science and technology curriculum aligned with CSTA Standards",
  icon: "💻",
  color: "from-pink-500 to-rose-500",
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
