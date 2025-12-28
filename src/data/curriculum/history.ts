/**
 * History & Social Studies Curriculum K-12
 * Aligned with C3 Framework for Social Studies
 */

import type { Subject, Unit, Lesson } from "./types";

function createLesson(
  id: string,
  title: string,
  description: string,
  duration: number = 35,
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

// Kindergarten Social Studies
const kindergartenUnits: Unit[] = [
  {
    id: "k-community",
    title: "My Community",
    slug: "my-community",
    description: "Learn about communities and helpers",
    gradeLevel: 0,
    standardsAlignment: ["D2.Civ.1.K-2", "D2.Civ.6.K-2"],
    lessons: [
      createLesson("k-family", "My Family", "Learn about families", 20),
      createLesson("k-school", "My School", "Explore our school community", 20),
      createLesson("k-helpers", "Community Helpers", "Learn about people who help us", 25),
    ],
  },
  {
    id: "k-holidays",
    title: "Holidays & Traditions",
    slug: "holidays-traditions",
    description: "Explore holidays and cultural traditions",
    gradeLevel: 0,
    standardsAlignment: ["D2.His.3.K-2"],
    lessons: [
      createLesson("k-national-holidays", "National Holidays", "Learn about national celebrations", 20),
      createLesson("k-traditions", "Family Traditions", "Share and learn about traditions", 20),
    ],
  },
];

// Grade 1-2 Social Studies
const grade1Units: Unit[] = [
  {
    id: "1-citizenship",
    title: "Citizenship",
    slug: "citizenship",
    description: "Learn about being a good citizen",
    gradeLevel: 1,
    standardsAlignment: ["D2.Civ.2.K-2", "D2.Civ.7.K-2"],
    lessons: [
      createLesson("1-rules-laws", "Rules and Laws", "Understand why we have rules", 30),
      createLesson("1-rights-responsibilities", "Rights and Responsibilities", "Learn about citizenship", 30),
      createLesson("1-symbols", "American Symbols", "Learn about national symbols", 30),
    ],
  },
  {
    id: "1-geography",
    title: "Geography Basics",
    slug: "geography",
    description: "Introduction to geography",
    gradeLevel: 1,
    standardsAlignment: ["D2.Geo.1.K-2", "D2.Geo.2.K-2"],
    lessons: [
      createLesson("1-maps", "Maps", "Learn to read simple maps", 30),
      createLesson("1-landforms", "Landforms", "Identify basic landforms", 30),
      createLesson("1-globes", "Globes", "Explore globes and continents", 30),
    ],
  },
];

const grade2Units: Unit[] = [
  {
    id: "2-us-history",
    title: "Early America",
    slug: "early-america",
    description: "Learn about early American history",
    gradeLevel: 2,
    standardsAlignment: ["D2.His.1.K-2", "D2.His.2.K-2"],
    lessons: [
      createLesson("2-native-americans", "Native Americans", "Learn about Native American cultures", 35),
      createLesson("2-explorers", "Explorers", "Discover early explorers", 35),
      createLesson("2-colonies", "Early Settlers", "Learn about colonial life", 35),
    ],
  },
  {
    id: "2-economics",
    title: "Economics",
    slug: "economics",
    description: "Basic economic concepts",
    gradeLevel: 2,
    standardsAlignment: ["D2.Eco.1.K-2", "D2.Eco.2.K-2"],
    lessons: [
      createLesson("2-wants-needs", "Wants and Needs", "Distinguish wants from needs", 30),
      createLesson("2-goods-services", "Goods and Services", "Understand goods and services", 30),
      createLesson("2-money", "Money", "Learn about money and trade", 30),
    ],
  },
];

// Grade 3-5 Social Studies
const grade3Units: Unit[] = [
  {
    id: "3-communities",
    title: "Communities Then and Now",
    slug: "communities",
    description: "Compare communities over time",
    gradeLevel: 3,
    standardsAlignment: ["D2.His.1.3-5", "D2.His.14.3-5"],
    lessons: [
      createLesson("3-past-present", "Past and Present", "Compare life then and now", 40),
      createLesson("3-local-history", "Local History", "Explore local community history", 40),
      createLesson("3-immigration", "Immigration", "Learn about immigrant experiences", 40),
    ],
  },
  {
    id: "3-government",
    title: "Government",
    slug: "government",
    description: "Understand local and state government",
    gradeLevel: 3,
    standardsAlignment: ["D2.Civ.1.3-5", "D2.Civ.3.3-5"],
    lessons: [
      createLesson("3-local-gov", "Local Government", "Learn about local government", 40),
      createLesson("3-state-gov", "State Government", "Understand state government", 40),
      createLesson("3-voting", "Voting", "Learn about voting and elections", 40),
    ],
  },
];

const grade4Units: Unit[] = [
  {
    id: "4-state-history",
    title: "State History",
    slug: "state-history",
    description: "Explore state history and geography",
    gradeLevel: 4,
    standardsAlignment: ["D2.His.2.3-5", "D2.Geo.4.3-5"],
    lessons: [
      createLesson("4-state-geography", "State Geography", "Study state geography", 45),
      createLesson("4-state-history", "State History", "Learn state history", 45),
      createLesson("4-state-economy", "State Economy", "Understand state economy", 45),
    ],
  },
  {
    id: "4-regions",
    title: "US Regions",
    slug: "us-regions",
    description: "Study the regions of the United States",
    gradeLevel: 4,
    standardsAlignment: ["D2.Geo.2.3-5", "D2.Geo.5.3-5"],
    lessons: [
      createLesson("4-northeast", "Northeast Region", "Explore the Northeast", 40),
      createLesson("4-southeast", "Southeast Region", "Study the Southeast", 40),
      createLesson("4-midwest", "Midwest Region", "Learn about the Midwest", 40),
      createLesson("4-west", "West Region", "Discover the West", 40),
    ],
  },
];

const grade5Units: Unit[] = [
  {
    id: "5-us-history",
    title: "US History",
    slug: "us-history",
    description: "American history from exploration to growth",
    gradeLevel: 5,
    standardsAlignment: ["D2.His.1.3-5", "D2.His.3.3-5"],
    lessons: [
      createLesson("5-exploration", "Age of Exploration", "European exploration", 45),
      createLesson("5-colonial-period", "Colonial Period", "Life in the colonies", 45),
      createLesson("5-revolution", "American Revolution", "Fight for independence", 50),
      createLesson("5-constitution", "Constitution", "Creating the Constitution", 50),
      createLesson("5-westward", "Westward Expansion", "Moving west", 45),
    ],
  },
];

// Grade 6-8 Social Studies
const grade6Units: Unit[] = [
  {
    id: "6-ancient-civilizations",
    title: "Ancient Civilizations",
    slug: "ancient-civilizations",
    description: "Study ancient world civilizations",
    gradeLevel: 6,
    standardsAlignment: ["D2.His.1.6-8", "D2.His.12.6-8"],
    lessons: [
      createLesson("6-mesopotamia", "Mesopotamia", "Study ancient Mesopotamia", 50),
      createLesson("6-egypt", "Ancient Egypt", "Explore ancient Egypt", 50),
      createLesson("6-greece", "Ancient Greece", "Learn about ancient Greece", 50),
      createLesson("6-rome", "Ancient Rome", "Study the Roman Empire", 50),
      createLesson("6-china-india", "China and India", "Ancient Asian civilizations", 50),
    ],
  },
];

const grade7Units: Unit[] = [
  {
    id: "7-world-history",
    title: "Medieval to Modern",
    slug: "world-history",
    description: "World history from medieval times",
    gradeLevel: 7,
    standardsAlignment: ["D2.His.2.6-8", "D2.His.14.6-8"],
    lessons: [
      createLesson("7-middle-ages", "Middle Ages", "Medieval Europe", 50),
      createLesson("7-renaissance", "Renaissance", "Cultural rebirth in Europe", 50),
      createLesson("7-reformation", "Reformation", "Religious reformation", 50),
      createLesson("7-exploration", "Age of Exploration", "European exploration", 50),
    ],
  },
  {
    id: "7-geography",
    title: "World Geography",
    slug: "geography",
    description: "Comprehensive world geography",
    gradeLevel: 7,
    standardsAlignment: ["D2.Geo.1.6-8", "D2.Geo.4.6-8"],
    lessons: [
      createLesson("7-physical-geography", "Physical Geography", "Earth's physical features", 50),
      createLesson("7-human-geography", "Human Geography", "Human impact on geography", 50),
      createLesson("7-cultural-geography", "Cultural Geography", "World cultures", 50),
    ],
  },
];

const grade8Units: Unit[] = [
  {
    id: "8-us-history",
    title: "US History",
    slug: "us-history",
    description: "American history through Civil War",
    gradeLevel: 8,
    standardsAlignment: ["D2.His.1.6-8", "D2.His.3.6-8"],
    lessons: [
      createLesson("8-constitution-gov", "Constitution & Government", "US government foundations", 55),
      createLesson("8-early-republic", "Early Republic", "Early American nation", 55),
      createLesson("8-expansion", "Expansion & Reform", "Westward expansion", 55),
      createLesson("8-civil-war", "Civil War", "Causes and effects of Civil War", 55),
      createLesson("8-reconstruction", "Reconstruction", "Post-war reconstruction", 55),
    ],
  },
];

// Grade 9-12 Social Studies
const grade9Units: Unit[] = [
  {
    id: "9-civics",
    title: "Civics & Government",
    slug: "civics",
    description: "American government and civics",
    gradeLevel: 9,
    standardsAlignment: ["D2.Civ.1.9-12", "D2.Civ.3.9-12"],
    lessons: [
      createLesson("9-constitution", "The Constitution", "In-depth Constitution study", 55),
      createLesson("9-branches", "Branches of Government", "Three branches of government", 55),
      createLesson("9-rights", "Rights and Liberties", "Constitutional rights", 55),
      createLesson("9-civic-participation", "Civic Participation", "Active citizenship", 55),
    ],
  },
];

const grade10Units: Unit[] = [
  {
    id: "10-world-history",
    title: "World History",
    slug: "world-history",
    description: "Modern world history",
    gradeLevel: 10,
    standardsAlignment: ["D2.His.1.9-12", "D2.His.4.9-12"],
    lessons: [
      createLesson("10-enlightenment", "Enlightenment", "Age of Enlightenment", 55),
      createLesson("10-revolutions", "Age of Revolutions", "Political revolutions", 55),
      createLesson("10-industrialization", "Industrialization", "Industrial Revolution", 55),
      createLesson("10-imperialism", "Imperialism", "Age of Imperialism", 55),
    ],
  },
];

const grade11Units: Unit[] = [
  {
    id: "11-us-history",
    title: "US History",
    slug: "us-history",
    description: "American history 1865-present",
    gradeLevel: 11,
    standardsAlignment: ["D2.His.1.9-12", "D2.His.5.9-12"],
    lessons: [
      createLesson("11-gilded-age", "Gilded Age", "Industrialization and reform", 55),
      createLesson("11-progressive-era", "Progressive Era", "Progressive reforms", 55),
      createLesson("11-world-wars", "World Wars", "WWI and WWII", 60),
      createLesson("11-cold-war", "Cold War", "Cold War era", 55),
      createLesson("11-civil-rights", "Civil Rights", "Civil Rights Movement", 55),
      createLesson("11-modern-america", "Modern America", "Contemporary America", 55),
    ],
  },
];

const grade12Units: Unit[] = [
  {
    id: "12-economics",
    title: "Economics",
    slug: "economics",
    description: "Comprehensive economics course",
    gradeLevel: 12,
    standardsAlignment: ["D2.Eco.1.9-12", "D2.Eco.9.9-12"],
    lessons: [
      createLesson("12-micro", "Microeconomics", "Individual economic decisions", 55),
      createLesson("12-macro", "Macroeconomics", "National and global economics", 55),
      createLesson("12-markets", "Markets", "Market structures", 55),
      createLesson("12-personal-finance", "Personal Finance", "Financial literacy", 55),
    ],
  },
  {
    id: "12-current-events",
    title: "Current Events",
    slug: "current-events",
    description: "Analysis of current events",
    gradeLevel: 12,
    standardsAlignment: ["D2.His.16.9-12"],
    lessons: [
      createLesson("12-media-literacy", "Media Literacy", "Analyzing news and media", 55),
      createLesson("12-global-issues", "Global Issues", "Contemporary global challenges", 55),
      createLesson("12-civic-action", "Civic Action", "Taking informed action", 55),
    ],
  },
];

export const historyCurriculum: Subject = {
  id: "history",
  name: "History",
  slug: "history",
  description: "Comprehensive K-12 history and social studies curriculum aligned with C3 Framework",
  icon: "🏛️",
  color: "from-warning to-warning/80",
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
