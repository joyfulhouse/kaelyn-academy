/**
 * Reading & English Language Arts Curriculum K-12
 * Aligned with Common Core ELA Standards
 */

import type { Subject, Unit } from "./types";
import { createLesson } from "./utils";

// Kindergarten Reading Units
const kindergartenUnits: Unit[] = [
  {
    id: "k-phonics",
    title: "Phonics & Word Recognition",
    slug: "phonics-word-recognition",
    description: "Learn letter sounds and basic word recognition",
    gradeLevel: 0,
    standardsAlignment: ["RF.K.1", "RF.K.2", "RF.K.3"],
    lessons: [
      createLesson("k-alphabet", "The Alphabet", "Learn all 26 letters and their sounds", 20),
      createLesson("k-letter-sounds", "Letter Sounds", "Connect letters with their sounds", 20),
      createLesson("k-rhyming", "Rhyming Words", "Recognize and produce rhyming words", 20),
      createLesson("k-sight-words", "Sight Words", "Learn high-frequency sight words", 25),
    ],
  },
  {
    id: "k-comprehension",
    title: "Reading Comprehension",
    slug: "comprehension",
    description: "Understand stories and informational text",
    gradeLevel: 0,
    standardsAlignment: ["RL.K.1", "RL.K.2", "RI.K.1"],
    lessons: [
      createLesson("k-story-elements", "Story Elements", "Identify characters, settings, and events", 25),
      createLesson("k-asking-questions", "Asking Questions", "Ask and answer questions about texts", 20),
      createLesson("k-main-idea", "Main Idea", "Identify the main topic of a text", 25),
    ],
  },
];

// Grade 1-2 Reading Units
const grade1Units: Unit[] = [
  {
    id: "1-phonics",
    title: "Advanced Phonics",
    slug: "advanced-phonics",
    description: "Develop phonics and word recognition skills",
    gradeLevel: 1,
    standardsAlignment: ["RF.1.2", "RF.1.3"],
    lessons: [
      createLesson("1-short-vowels", "Short Vowels", "Master short vowel sounds in words", 30),
      createLesson("1-long-vowels", "Long Vowels", "Learn long vowel patterns", 30),
      createLesson("1-blends-digraphs", "Blends and Digraphs", "Read words with blends and digraphs", 30),
      createLesson("1-syllables", "Syllables", "Decode two-syllable words", 30),
    ],
  },
  {
    id: "1-comprehension",
    title: "Reading Comprehension",
    slug: "comprehension",
    description: "Develop deeper understanding of texts",
    gradeLevel: 1,
    standardsAlignment: ["RL.1.1", "RL.1.3", "RI.1.2"],
    lessons: [
      createLesson("1-retelling", "Retelling Stories", "Retell stories with key details", 30),
      createLesson("1-central-message", "Central Message", "Identify the central message or lesson", 30),
      createLesson("1-text-features", "Text Features", "Use text features in informational texts", 30),
    ],
  },
];

const grade2Units: Unit[] = [
  {
    id: "2-fluency",
    title: "Reading Fluency",
    slug: "fluency",
    description: "Read with accuracy, expression, and appropriate rate",
    gradeLevel: 2,
    standardsAlignment: ["RF.2.4"],
    lessons: [
      createLesson("2-expression", "Reading with Expression", "Use expression when reading aloud", 30),
      createLesson("2-phrasing", "Phrasing", "Read in meaningful phrases", 30),
      createLesson("2-accuracy", "Accuracy", "Self-correct when reading", 30),
    ],
  },
  {
    id: "2-comprehension",
    title: "Reading Comprehension",
    slug: "comprehension",
    description: "Analyze literature and informational texts",
    gradeLevel: 2,
    standardsAlignment: ["RL.2.1", "RL.2.5", "RI.2.3"],
    lessons: [
      createLesson("2-character-analysis", "Character Analysis", "Describe how characters respond to events", 35),
      createLesson("2-text-structure", "Text Structure", "Identify the structure of informational text", 35),
      createLesson("2-compare-texts", "Comparing Texts", "Compare and contrast versions of stories", 35),
    ],
  },
];

// Grade 3-5 Reading Units
const grade3Units: Unit[] = [
  {
    id: "3-literature",
    title: "Literature Analysis",
    slug: "literature",
    description: "Analyze stories, dramas, and poetry",
    gradeLevel: 3,
    standardsAlignment: ["RL.3.1", "RL.3.2", "RL.3.3"],
    lessons: [
      createLesson("3-theme", "Theme", "Determine the central message or theme", 40),
      createLesson("3-point-of-view", "Point of View", "Distinguish point of view", 40),
      createLesson("3-figurative-language", "Figurative Language", "Understand literal vs. nonliteral language", 35),
    ],
  },
  {
    id: "3-informational",
    title: "Informational Text",
    slug: "informational",
    description: "Analyze and use information from texts",
    gradeLevel: 3,
    standardsAlignment: ["RI.3.1", "RI.3.3", "RI.3.8"],
    lessons: [
      createLesson("3-evidence", "Text Evidence", "Use evidence to support answers", 40),
      createLesson("3-connections", "Making Connections", "Connect ideas within and across texts", 40),
      createLesson("3-author-purpose", "Author's Purpose", "Describe the author's purpose", 35),
    ],
  },
];

const grade4Units: Unit[] = [
  {
    id: "4-literature",
    title: "Literature Analysis",
    slug: "literature",
    description: "Deep analysis of literary elements",
    gradeLevel: 4,
    standardsAlignment: ["RL.4.2", "RL.4.3", "RL.4.6"],
    lessons: [
      createLesson("4-theme-summary", "Theme and Summary", "Determine theme and summarize text", 45),
      createLesson("4-character-motivation", "Character Motivation", "Analyze character motivation", 45),
      createLesson("4-compare-povs", "Compare Points of View", "Compare first and third person POV", 40),
    ],
  },
  {
    id: "4-writing",
    title: "Writing Workshop",
    slug: "writing",
    description: "Develop structured writing skills",
    gradeLevel: 4,
    standardsAlignment: ["W.4.1", "W.4.2", "W.4.3"],
    lessons: [
      createLesson("4-opinion-writing", "Opinion Writing", "Write opinion pieces with support", 50),
      createLesson("4-informative-writing", "Informative Writing", "Write informative/explanatory texts", 50),
      createLesson("4-narrative-writing", "Narrative Writing", "Write narratives with detail", 50),
    ],
  },
];

const grade5Units: Unit[] = [
  {
    id: "5-literature",
    title: "Advanced Literature",
    slug: "literature",
    description: "Complex literary analysis",
    gradeLevel: 5,
    standardsAlignment: ["RL.5.2", "RL.5.4", "RL.5.6"],
    lessons: [
      createLesson("5-theme-development", "Theme Development", "Analyze how themes develop", 45),
      createLesson("5-literary-devices", "Literary Devices", "Identify metaphors, similes, and more", 45),
      createLesson("5-narrator-perspective", "Narrator Perspective", "Analyze narrator or speaker perspective", 45),
    ],
  },
  {
    id: "5-research",
    title: "Research Skills",
    slug: "research",
    description: "Conduct and present research",
    gradeLevel: 5,
    standardsAlignment: ["W.5.7", "W.5.8", "W.5.9"],
    lessons: [
      createLesson("5-research-questions", "Research Questions", "Develop focused research questions", 45),
      createLesson("5-sources", "Evaluating Sources", "Evaluate source credibility", 45),
      createLesson("5-presenting-research", "Presenting Research", "Present research findings effectively", 50),
    ],
  },
];

// Grade 6-8 Reading/ELA Units
const grade6Units: Unit[] = [
  {
    id: "6-literature",
    title: "Literary Analysis",
    slug: "literature",
    description: "Analyze complex literary texts",
    gradeLevel: 6,
    standardsAlignment: ["RL.6.1", "RL.6.2", "RL.6.3"],
    lessons: [
      createLesson("6-textual-evidence", "Textual Evidence", "Cite textual evidence to support analysis", 50),
      createLesson("6-theme-summary", "Theme and Summary", "Determine themes and provide summaries", 50),
      createLesson("6-plot-development", "Plot Development", "Analyze how plot unfolds", 50),
    ],
  },
  {
    id: "6-argument",
    title: "Argument Writing",
    slug: "argument",
    description: "Construct effective arguments",
    gradeLevel: 6,
    standardsAlignment: ["W.6.1"],
    lessons: [
      createLesson("6-claims", "Claims and Evidence", "Write clear claims with evidence", 50),
      createLesson("6-counterarguments", "Counterarguments", "Address counterarguments", 50),
      createLesson("6-argument-structure", "Argument Structure", "Organize arguments logically", 50),
    ],
  },
];

const grade7Units: Unit[] = [
  {
    id: "7-literature",
    title: "Literary Elements",
    slug: "literature",
    description: "Analyze interaction of literary elements",
    gradeLevel: 7,
    standardsAlignment: ["RL.7.1", "RL.7.3", "RL.7.6"],
    lessons: [
      createLesson("7-element-interaction", "Element Interaction", "Analyze how elements interact", 50),
      createLesson("7-point-of-view-effects", "Point of View Effects", "Analyze effects of POV", 50),
      createLesson("7-drama-poetry", "Drama and Poetry", "Compare drama and prose", 50),
    ],
  },
  {
    id: "7-informational",
    title: "Informational Text Analysis",
    slug: "informational",
    description: "Analyze structure and argument in informational texts",
    gradeLevel: 7,
    standardsAlignment: ["RI.7.5", "RI.7.8"],
    lessons: [
      createLesson("7-text-structure", "Analyzing Structure", "Analyze text structure contribution", 50),
      createLesson("7-argument-evaluation", "Evaluating Arguments", "Trace and evaluate arguments", 50),
    ],
  },
];

const grade8Units: Unit[] = [
  {
    id: "8-literature",
    title: "Literature and History",
    slug: "literature",
    description: "Connect literature to historical context",
    gradeLevel: 8,
    standardsAlignment: ["RL.8.1", "RL.8.6", "RL.8.9"],
    lessons: [
      createLesson("8-historical-fiction", "Historical Fiction", "Analyze historical fiction", 55),
      createLesson("8-perspective-analysis", "Perspective Analysis", "Analyze differing perspectives", 55),
      createLesson("8-modern-adaptation", "Modern Adaptations", "Analyze modern adaptations of texts", 55),
    ],
  },
  {
    id: "8-research-writing",
    title: "Research and Writing",
    slug: "research-writing",
    description: "Develop sophisticated research and writing skills",
    gradeLevel: 8,
    standardsAlignment: ["W.8.1", "W.8.7"],
    lessons: [
      createLesson("8-research-project", "Research Projects", "Conduct sustained research", 60),
      createLesson("8-synthesis", "Synthesizing Sources", "Synthesize multiple sources", 55),
    ],
  },
];

// Grade 9-12 Reading/ELA Units
const grade9Units: Unit[] = [
  {
    id: "9-literature",
    title: "World Literature",
    slug: "literature",
    description: "Explore diverse literary traditions",
    gradeLevel: 9,
    standardsAlignment: ["RL.9-10.1", "RL.9-10.4", "RL.9-10.6"],
    lessons: [
      createLesson("9-cultural-context", "Cultural Context", "Analyze literature in cultural context", 55),
      createLesson("9-author-choices", "Author's Choices", "Analyze author's choices", 55),
      createLesson("9-complex-characters", "Complex Characters", "Analyze complex characters", 55),
    ],
  },
  {
    id: "9-rhetoric",
    title: "Rhetoric and Composition",
    slug: "rhetoric",
    description: "Develop rhetorical awareness",
    gradeLevel: 9,
    standardsAlignment: ["RI.9-10.6", "W.9-10.1"],
    lessons: [
      createLesson("9-rhetorical-analysis", "Rhetorical Analysis", "Analyze rhetorical strategies", 55),
      createLesson("9-argument-development", "Argument Development", "Develop sophisticated arguments", 60),
    ],
  },
];

const grade10Units: Unit[] = [
  {
    id: "10-american-literature",
    title: "American Literature",
    slug: "american-literature",
    description: "Survey of American literary traditions",
    gradeLevel: 10,
    standardsAlignment: ["RL.9-10.3", "RL.9-10.9"],
    lessons: [
      createLesson("10-early-american", "Early American Literature", "Colonial and Revolutionary period", 55),
      createLesson("10-romanticism", "American Romanticism", "Transcendentalism and Romanticism", 55),
      createLesson("10-realism", "Realism and Naturalism", "American Realism movement", 55),
    ],
  },
  {
    id: "10-essay-writing",
    title: "Essay Writing",
    slug: "essay-writing",
    description: "Master the academic essay",
    gradeLevel: 10,
    standardsAlignment: ["W.9-10.1", "W.9-10.2", "W.9-10.4"],
    lessons: [
      createLesson("10-literary-essay", "Literary Essay", "Write analytical literary essays", 60),
      createLesson("10-research-essay", "Research Essay", "Write research-based essays", 60),
    ],
  },
];

const grade11Units: Unit[] = [
  {
    id: "11-british-literature",
    title: "British Literature",
    slug: "british-literature",
    description: "Survey of British literary traditions",
    gradeLevel: 11,
    standardsAlignment: ["RL.11-12.1", "RL.11-12.5"],
    lessons: [
      createLesson("11-medieval", "Medieval Literature", "Beowulf and Canterbury Tales", 55),
      createLesson("11-shakespeare", "Shakespeare", "Shakespearean drama and poetry", 60),
      createLesson("11-romantic", "British Romanticism", "Romantic poets and novelists", 55),
    ],
  },
  {
    id: "11-advanced-writing",
    title: "Advanced Writing",
    slug: "advanced-writing",
    description: "College-level writing preparation",
    gradeLevel: 11,
    standardsAlignment: ["W.11-12.1", "W.11-12.5"],
    lessons: [
      createLesson("11-analysis-essay", "Analysis Essay", "Write sophisticated analysis", 60),
      createLesson("11-revision", "Revision Strategies", "Advanced revision techniques", 55),
    ],
  },
];

const grade12Units: Unit[] = [
  {
    id: "12-contemporary-literature",
    title: "Contemporary Literature",
    slug: "contemporary-literature",
    description: "Modern and contemporary works",
    gradeLevel: 12,
    standardsAlignment: ["RL.11-12.3", "RL.11-12.7"],
    lessons: [
      createLesson("12-20th-century", "20th Century Literature", "Modernism and Postmodernism", 55),
      createLesson("12-global-voices", "Global Voices", "Contemporary world literature", 55),
      createLesson("12-multimedia-texts", "Multimedia Texts", "Analyze multimedia narratives", 55),
    ],
  },
  {
    id: "12-college-writing",
    title: "College Writing",
    slug: "college-writing",
    description: "Prepare for college-level writing",
    gradeLevel: 12,
    standardsAlignment: ["W.11-12.1", "W.11-12.10"],
    lessons: [
      createLesson("12-personal-essay", "Personal Essay", "Craft personal essays", 60),
      createLesson("12-research-paper", "Research Paper", "Complete extended research paper", 90),
    ],
  },
];

export const readingCurriculum: Subject = {
  id: "reading",
  name: "Reading & ELA",
  slug: "reading",
  description: "Comprehensive K-12 English Language Arts curriculum aligned with Common Core ELA Standards",
  icon: "📚",
  color: "from-green-500 to-emerald-500",
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
