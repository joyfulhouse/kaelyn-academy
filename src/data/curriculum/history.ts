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
  {
    id: "1-history-basics",
    title: "History Basics",
    slug: "history-basics",
    description: "Understanding the past and how it shapes our lives",
    gradeLevel: 1,
    standardsAlignment: ["D2.His.1.K-2", "D2.His.3.K-2"],
    lessons: [
      createLesson("1-past-present-future", "Past, Present, Future", "Understanding time concepts", 25),
      createLesson("1-timelines", "Timelines", "Creating and reading simple timelines", 30),
      createLesson("1-historical-figures", "Historical Figures", "Learning about important people", 30),
      createLesson("1-primary-sources", "Primary Sources", "Looking at photos and objects from the past", 25),
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
  {
    id: "2-world-cultures",
    title: "World Cultures",
    slug: "world-cultures",
    description: "Exploring cultures from around the world",
    gradeLevel: 2,
    standardsAlignment: ["D2.Geo.6.K-2", "D2.His.4.K-2"],
    lessons: [
      createLesson("2-continents-cultures", "Continents and Cultures", "Introduction to world cultures", 30),
      createLesson("2-food-traditions", "Food Traditions", "How food connects to culture", 30),
      createLesson("2-celebrations", "Celebrations Around the World", "Different ways people celebrate", 30),
      createLesson("2-families-world", "Families Around the World", "How families live in different places", 30),
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
  {
    id: "3-economics",
    title: "Economics & Resources",
    slug: "economics-resources",
    description: "Understanding economic systems and resources",
    gradeLevel: 3,
    standardsAlignment: ["D2.Eco.1.3-5", "D2.Eco.3.3-5"],
    lessons: [
      createLesson("3-producers-consumers", "Producers and Consumers", "How goods and services are exchanged", 40),
      createLesson("3-supply-demand", "Supply and Demand", "Basic economic principles", 40),
      createLesson("3-natural-resources", "Natural Resources", "How communities use resources", 40),
      createLesson("3-jobs-community", "Jobs in Community", "Different careers and their roles", 35),
    ],
  },
  {
    id: "3-geography-mapping",
    title: "Geography & Mapping",
    slug: "geography-mapping",
    description: "Advanced map skills and geographic concepts",
    gradeLevel: 3,
    standardsAlignment: ["D2.Geo.2.3-5", "D2.Geo.3.3-5"],
    lessons: [
      createLesson("3-map-types", "Types of Maps", "Political, physical, and thematic maps", 40),
      createLesson("3-cardinal-directions", "Cardinal Directions", "Using compass rose and directions", 35),
      createLesson("3-scale-distance", "Scale and Distance", "Measuring distances on maps", 40),
      createLesson("3-regions", "Regions", "Understanding geographic regions", 40),
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
  {
    id: "4-native-americans",
    title: "Native American Cultures",
    slug: "native-americans",
    description: "In-depth study of Native American nations and cultures",
    gradeLevel: 4,
    standardsAlignment: ["D2.His.4.3-5", "D2.His.5.3-5"],
    lessons: [
      createLesson("4-native-regions", "Native Nations by Region", "How geography shaped cultures", 45),
      createLesson("4-native-cultures", "Cultural Traditions", "Art, stories, and customs", 45),
      createLesson("4-native-today", "Native Americans Today", "Contemporary Native American communities", 45),
      createLesson("4-native-government", "Tribal Governments", "Sovereignty and self-governance", 45),
    ],
  },
  {
    id: "4-civics",
    title: "Civics & Government",
    slug: "civics",
    description: "Understanding American government and citizenship",
    gradeLevel: 4,
    standardsAlignment: ["D2.Civ.2.3-5", "D2.Civ.5.3-5"],
    lessons: [
      createLesson("4-federal-gov", "Federal Government", "The three branches", 45),
      createLesson("4-constitution", "The Constitution", "Founding document of our nation", 45),
      createLesson("4-bill-of-rights", "Bill of Rights", "Our fundamental freedoms", 45),
      createLesson("4-citizenship", "Active Citizenship", "Participating in democracy", 40),
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
  {
    id: "5-geography",
    title: "Geography of the Americas",
    slug: "geography-americas",
    description: "Physical and human geography of North and South America",
    gradeLevel: 5,
    standardsAlignment: ["D2.Geo.4.3-5", "D2.Geo.6.3-5"],
    lessons: [
      createLesson("5-north-america", "North America", "Physical features and climate", 45),
      createLesson("5-south-america", "South America", "Geography and cultures", 45),
      createLesson("5-human-environment", "Human-Environment Interaction", "How people adapt to and modify environments", 45),
      createLesson("5-movement", "Movement & Migration", "How people, goods, and ideas move", 45),
    ],
  },
  {
    id: "5-economics",
    title: "Economics in History",
    slug: "economics-history",
    description: "Economic forces that shaped American history",
    gradeLevel: 5,
    standardsAlignment: ["D2.Eco.4.3-5", "D2.Eco.6.3-5"],
    lessons: [
      createLesson("5-colonial-economy", "Colonial Economy", "Trade and mercantilism", 45),
      createLesson("5-industrial-beginnings", "Industrial Beginnings", "Early manufacturing", 45),
      createLesson("5-agriculture", "Agriculture in America", "Farming and plantation systems", 45),
      createLesson("5-trade-routes", "Trade Routes", "How trade connected the world", 45),
    ],
  },
  {
    id: "5-civics-founding",
    title: "Founding Documents",
    slug: "founding-documents",
    description: "Deep dive into founding documents and principles",
    gradeLevel: 5,
    standardsAlignment: ["D2.Civ.4.3-5", "D2.Civ.6.3-5"],
    lessons: [
      createLesson("5-declaration", "Declaration of Independence", "Ideas of liberty and equality", 50),
      createLesson("5-articles", "Articles of Confederation", "First attempt at government", 45),
      createLesson("5-constitution-deep", "Constitution in Depth", "Structure and meaning", 50),
      createLesson("5-amendments", "Constitutional Amendments", "How the Constitution has changed", 45),
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
  {
    id: "6-world-geography",
    title: "World Geography",
    slug: "world-geography",
    description: "Physical and human geography of world regions",
    gradeLevel: 6,
    standardsAlignment: ["D2.Geo.1.6-8", "D2.Geo.2.6-8", "D2.Geo.4.6-8"],
    lessons: [
      createLesson("6-europe", "Europe", "Geography and cultures of Europe", 50),
      createLesson("6-asia", "Asia", "The diverse continent of Asia", 50),
      createLesson("6-africa", "Africa", "Geography and cultures of Africa", 50),
      createLesson("6-australia-oceania", "Australia & Oceania", "Pacific region geography", 45),
      createLesson("6-population", "Population & Migration", "How and why populations move", 50),
    ],
  },
  {
    id: "6-ancient-economics",
    title: "Economics of Ancient Civilizations",
    slug: "ancient-economics",
    description: "Trade, currency, and economic systems in the ancient world",
    gradeLevel: 6,
    standardsAlignment: ["D2.Eco.1.6-8", "D2.Eco.5.6-8"],
    lessons: [
      createLesson("6-trade-routes-ancient", "Ancient Trade Routes", "Silk Road and maritime trade", 50),
      createLesson("6-currency-development", "Development of Currency", "From barter to coins", 45),
      createLesson("6-agriculture-surplus", "Agriculture & Surplus", "How farming changed society", 50),
      createLesson("6-specialization", "Specialization & Jobs", "Division of labor in ancient societies", 45),
    ],
  },
  {
    id: "6-ancient-government",
    title: "Government in Ancient Civilizations",
    slug: "ancient-government",
    description: "How ancient societies organized their governments",
    gradeLevel: 6,
    standardsAlignment: ["D2.Civ.2.6-8", "D2.Civ.4.6-8"],
    lessons: [
      createLesson("6-monarchy-empire", "Monarchies & Empires", "Rule by kings and emperors", 50),
      createLesson("6-democracy-origins", "Origins of Democracy", "Greek democracy", 50),
      createLesson("6-republic", "The Roman Republic", "Representative government", 50),
      createLesson("6-law-codes", "Ancient Law Codes", "Hammurabi's Code and Roman law", 50),
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
  {
    id: "7-economics-trade",
    title: "Economics & Global Trade",
    slug: "economics-trade",
    description: "Economic systems and global trade networks",
    gradeLevel: 7,
    standardsAlignment: ["D2.Eco.2.6-8", "D2.Eco.4.6-8", "D2.Eco.6.6-8"],
    lessons: [
      createLesson("7-economic-systems", "Economic Systems", "Comparing capitalism, socialism, and communism", 55),
      createLesson("7-medieval-trade", "Medieval Trade", "Guilds, fairs, and trade routes", 50),
      createLesson("7-global-trade", "Global Trade Networks", "Columbian Exchange and mercantilism", 55),
      createLesson("7-economic-revolution", "Economic Revolution", "Rise of capitalism and banking", 50),
    ],
  },
  {
    id: "7-civics-evolution",
    title: "Evolution of Government",
    slug: "civics-evolution",
    description: "How governments evolved from feudalism to nation-states",
    gradeLevel: 7,
    standardsAlignment: ["D2.Civ.1.6-8", "D2.Civ.3.6-8", "D2.Civ.6.6-8"],
    lessons: [
      createLesson("7-feudalism", "Feudalism", "Medieval political organization", 50),
      createLesson("7-nation-states", "Rise of Nation-States", "Formation of modern countries", 50),
      createLesson("7-enlightenment-ideas", "Enlightenment Ideas", "New ideas about government", 55),
      createLesson("7-absolute-monarchy", "Absolute Monarchy", "Kings with unlimited power", 50),
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
  {
    id: "8-civics-government",
    title: "Civics & American Government",
    slug: "civics-government",
    description: "In-depth study of American government and civic participation",
    gradeLevel: 8,
    standardsAlignment: ["D2.Civ.1.6-8", "D2.Civ.5.6-8", "D2.Civ.8.6-8"],
    lessons: [
      createLesson("8-federalism", "Federalism", "Division of power between levels of government", 55),
      createLesson("8-branches-depth", "Branches in Depth", "Detailed study of each branch", 55),
      createLesson("8-supreme-court", "The Supreme Court", "Judicial review and landmark cases", 55),
      createLesson("8-political-parties", "Political Parties", "Role of parties in democracy", 50),
      createLesson("8-civic-engagement", "Civic Engagement", "How citizens participate", 50),
    ],
  },
  {
    id: "8-economics-american",
    title: "American Economic Development",
    slug: "economics-american",
    description: "Economic growth and change in early America",
    gradeLevel: 8,
    standardsAlignment: ["D2.Eco.3.6-8", "D2.Eco.7.6-8"],
    lessons: [
      createLesson("8-colonial-economy", "Colonial Economy", "Economic systems in the colonies", 50),
      createLesson("8-industrial-revolution", "Industrial Revolution", "Transformation of American economy", 55),
      createLesson("8-slavery-economy", "Slavery and the Economy", "Economic impact of slavery", 55),
      createLesson("8-sectional-differences", "Sectional Differences", "North vs. South economies", 50),
    ],
  },
  {
    id: "8-geography-american",
    title: "Geography of the United States",
    slug: "geography-american",
    description: "Physical and human geography of the United States",
    gradeLevel: 8,
    standardsAlignment: ["D2.Geo.3.6-8", "D2.Geo.5.6-8", "D2.Geo.7.6-8"],
    lessons: [
      createLesson("8-physical-regions", "Physical Regions", "Major landforms and climates", 50),
      createLesson("8-manifest-destiny", "Manifest Destiny", "Geography of westward expansion", 55),
      createLesson("8-human-environment", "Human-Environment Interaction", "How Americans changed the land", 50),
      createLesson("8-urbanization", "Early Urbanization", "Growth of cities", 50),
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
  {
    id: "9-world-geography",
    title: "World Geography",
    slug: "world-geography",
    description: "Comprehensive study of world regions and global issues",
    gradeLevel: 9,
    standardsAlignment: ["D2.Geo.1.9-12", "D2.Geo.4.9-12", "D2.Geo.6.9-12"],
    lessons: [
      createLesson("9-physical-systems", "Physical Systems", "Earth's physical processes", 55),
      createLesson("9-human-systems", "Human Systems", "Population, culture, and settlement", 55),
      createLesson("9-environment-society", "Environment and Society", "Human-environment interaction", 55),
      createLesson("9-globalization", "Globalization", "Interconnected world systems", 55),
      createLesson("9-regional-studies", "Regional Studies", "Comparative analysis of regions", 55),
    ],
  },
  {
    id: "9-economics-intro",
    title: "Introduction to Economics",
    slug: "economics-intro",
    description: "Foundational economic concepts and principles",
    gradeLevel: 9,
    standardsAlignment: ["D2.Eco.1.9-12", "D2.Eco.2.9-12"],
    lessons: [
      createLesson("9-scarcity-choice", "Scarcity and Choice", "Basic economic problem", 55),
      createLesson("9-supply-demand-adv", "Supply and Demand", "Market equilibrium", 55),
      createLesson("9-market-economy", "Market Economy", "Free market principles", 55),
      createLesson("9-role-government", "Role of Government", "Government in the economy", 55),
    ],
  },
  {
    id: "9-historical-thinking",
    title: "Historical Thinking Skills",
    slug: "historical-thinking",
    description: "Developing critical thinking skills for studying history",
    gradeLevel: 9,
    standardsAlignment: ["D2.His.1.9-12", "D2.His.11.9-12", "D2.His.16.9-12"],
    lessons: [
      createLesson("9-primary-secondary", "Primary and Secondary Sources", "Evaluating historical evidence", 55),
      createLesson("9-causation", "Causation in History", "Understanding cause and effect", 55),
      createLesson("9-perspective", "Historical Perspective", "Multiple viewpoints", 55),
      createLesson("9-argument-evidence", "Argument and Evidence", "Building historical arguments", 55),
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
  {
    id: "10-20th-century",
    title: "20th Century World",
    slug: "20th-century",
    description: "World history from 1900 to present",
    gradeLevel: 10,
    standardsAlignment: ["D2.His.2.9-12", "D2.His.5.9-12", "D2.His.14.9-12"],
    lessons: [
      createLesson("10-world-war-1", "World War I", "The Great War and its aftermath", 55),
      createLesson("10-interwar", "Interwar Period", "Rise of totalitarianism", 55),
      createLesson("10-world-war-2", "World War II", "Global conflict and Holocaust", 60),
      createLesson("10-cold-war-world", "Cold War", "Superpower conflict and proxy wars", 55),
      createLesson("10-post-cold-war", "Post-Cold War World", "New world order and globalization", 55),
    ],
  },
  {
    id: "10-comparative-government",
    title: "Comparative Government",
    slug: "comparative-government",
    description: "Comparing political systems around the world",
    gradeLevel: 10,
    standardsAlignment: ["D2.Civ.1.9-12", "D2.Civ.6.9-12", "D2.Civ.7.9-12"],
    lessons: [
      createLesson("10-democracies", "Democracies", "Parliamentary vs presidential systems", 55),
      createLesson("10-authoritarian", "Authoritarian Systems", "Dictatorships and one-party states", 55),
      createLesson("10-international-orgs", "International Organizations", "UN, NATO, EU and global governance", 55),
      createLesson("10-human-rights", "Human Rights", "Universal rights and their protection", 55),
    ],
  },
  {
    id: "10-global-economics",
    title: "Global Economics",
    slug: "global-economics",
    description: "International trade and economic development",
    gradeLevel: 10,
    standardsAlignment: ["D2.Eco.4.9-12", "D2.Eco.7.9-12", "D2.Eco.10.9-12"],
    lessons: [
      createLesson("10-international-trade", "International Trade", "Benefits and barriers to trade", 55),
      createLesson("10-development", "Economic Development", "Developed vs developing nations", 55),
      createLesson("10-economic-integration", "Economic Integration", "Trade blocs and agreements", 55),
      createLesson("10-global-challenges", "Global Economic Challenges", "Poverty, inequality, and sustainability", 55),
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
  {
    id: "11-ap-government",
    title: "AP Government & Politics",
    slug: "ap-government",
    description: "Advanced study of American government and political behavior",
    gradeLevel: 11,
    standardsAlignment: ["D2.Civ.2.9-12", "D2.Civ.4.9-12", "D2.Civ.8.9-12"],
    lessons: [
      createLesson("11-constitutional-foundations", "Constitutional Foundations", "Philosophical and practical origins", 55),
      createLesson("11-political-behavior", "Political Behavior", "Voting, public opinion, and media", 55),
      createLesson("11-policy-making", "Policy Making", "How laws and regulations are created", 55),
      createLesson("11-civil-liberties", "Civil Liberties", "First Amendment and due process", 55),
      createLesson("11-civil-rights-law", "Civil Rights in Law", "Equal protection and discrimination", 55),
    ],
  },
  {
    id: "11-us-geography",
    title: "US Geography & Demographics",
    slug: "us-geography",
    description: "Physical and human geography of the United States",
    gradeLevel: 11,
    standardsAlignment: ["D2.Geo.2.9-12", "D2.Geo.5.9-12", "D2.Geo.8.9-12"],
    lessons: [
      createLesson("11-regional-geography", "Regional Geography", "US regions in depth", 55),
      createLesson("11-urbanization", "Urbanization", "Growth and challenges of cities", 55),
      createLesson("11-demographics", "Demographics", "Population patterns and change", 55),
      createLesson("11-environmental-issues", "Environmental Issues", "Conservation and sustainability", 55),
    ],
  },
  {
    id: "11-american-economics",
    title: "American Economic History",
    slug: "american-economics",
    description: "Economic development of the United States",
    gradeLevel: 11,
    standardsAlignment: ["D2.Eco.3.9-12", "D2.Eco.5.9-12", "D2.Eco.8.9-12"],
    lessons: [
      createLesson("11-industrial-economy", "Industrial Economy", "Rise of big business", 55),
      createLesson("11-labor-movement", "Labor Movement", "Workers' rights and unions", 55),
      createLesson("11-great-depression", "Great Depression", "Economic crisis and New Deal", 55),
      createLesson("11-postwar-economy", "Postwar Economy", "American economic dominance", 55),
      createLesson("11-modern-economy", "Modern Economy", "21st century economic challenges", 55),
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
  {
    id: "12-ap-us-gov",
    title: "AP US Government & Politics",
    slug: "ap-us-gov",
    description: "College-level American government and political institutions",
    gradeLevel: 12,
    standardsAlignment: ["D2.Civ.3.9-12", "D2.Civ.5.9-12", "D2.Civ.10.9-12"],
    lessons: [
      createLesson("12-federalism-detail", "Federalism in Detail", "Division of powers and intergovernmental relations", 55),
      createLesson("12-congress", "Congress", "Structure, powers, and processes", 55),
      createLesson("12-presidency", "The Presidency", "Executive power and administration", 55),
      createLesson("12-judiciary", "The Judiciary", "Federal courts and constitutional interpretation", 55),
      createLesson("12-political-parties", "Political Parties & Elections", "Party systems and electoral processes", 55),
      createLesson("12-interest-groups", "Interest Groups", "Lobbying and political participation", 55),
    ],
  },
  {
    id: "12-sociology",
    title: "Sociology",
    slug: "sociology",
    description: "Study of human society and social behavior",
    gradeLevel: 12,
    standardsAlignment: ["D2.Soc.1.9-12", "D2.Soc.4.9-12"],
    lessons: [
      createLesson("12-sociological-perspective", "Sociological Perspective", "Understanding society through sociology", 55),
      createLesson("12-culture-society", "Culture and Society", "Norms, values, and social institutions", 55),
      createLesson("12-social-stratification", "Social Stratification", "Class, race, and inequality", 55),
      createLesson("12-social-institutions", "Social Institutions", "Family, education, religion, and government", 55),
      createLesson("12-social-change", "Social Change", "Movements and social transformation", 55),
    ],
  },
  {
    id: "12-psychology",
    title: "Psychology",
    slug: "psychology",
    description: "Introduction to psychological science",
    gradeLevel: 12,
    standardsAlignment: ["D2.Psy.1.9-12", "D2.Psy.3.9-12"],
    lessons: [
      createLesson("12-psych-methods", "Research Methods", "Scientific study of behavior", 55),
      createLesson("12-brain-behavior", "Brain and Behavior", "Biological basis of psychology", 55),
      createLesson("12-learning-memory", "Learning and Memory", "How we learn and remember", 55),
      createLesson("12-development", "Human Development", "Lifespan development", 55),
      createLesson("12-social-psych", "Social Psychology", "How others influence our behavior", 55),
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
