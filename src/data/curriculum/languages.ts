/**
 * Foreign Language Curriculum K-12
 * Aligned with ACTFL World-Readiness Standards for Learning Languages
 * Languages: Spanish, French, German, Mandarin Chinese, Japanese, ASL
 */

import type { Subject, Unit } from "./types";
import { createLesson } from "./utils";

// =============================================================================
// SPANISH CURRICULUM
// =============================================================================

const spanishKindergarten: Unit[] = [
  {
    id: "k-spanish-basics",
    title: "¡Hola! Spanish Basics",
    slug: "spanish-basics",
    description: "Introduction to Spanish greetings and basic vocabulary",
    gradeLevel: 0,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.1.2"],
    lessons: [
      createLesson("k-sp-greetings", "Greetings & Farewells", "Learn hola, adiós, buenos días", 15),
      createLesson("k-sp-colors", "Colors in Spanish", "Learn colors: rojo, azul, amarillo", 15),
      createLesson("k-sp-numbers", "Numbers 1-10", "Count from uno to diez", 20),
      createLesson("k-sp-family", "My Family", "Learn familia vocabulary", 15),
    ],
  },
];

const spanishGrade1: Unit[] = [
  {
    id: "1-spanish-conversation",
    title: "Simple Conversations",
    slug: "simple-conversations",
    description: "Build basic conversational skills in Spanish",
    gradeLevel: 1,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.2.1"],
    lessons: [
      createLesson("1-sp-intro", "Introducing Yourself", "Me llamo..., ¿Cómo te llamas?", 20),
      createLesson("1-sp-feelings", "How I Feel", "Express emotions: feliz, triste, cansado", 20),
      createLesson("1-sp-classroom", "Classroom Objects", "Learn la mesa, el libro, la silla", 25),
      createLesson("1-sp-animals", "Animals", "Learn animal vocabulary in Spanish", 20),
    ],
  },
];

const spanishGrade2: Unit[] = [
  {
    id: "2-spanish-daily",
    title: "Daily Life in Spanish",
    slug: "daily-life",
    description: "Vocabulary for everyday activities",
    gradeLevel: 2,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("2-sp-food", "Food & Meals", "Learn food vocabulary and meal times", 25),
      createLesson("2-sp-weather", "Weather", "Describe el tiempo and seasons", 25),
      createLesson("2-sp-body", "Parts of the Body", "Learn body parts in Spanish", 25),
      createLesson("2-sp-clothes", "Clothing", "Describe what you wear", 25),
    ],
  },
];

const spanishGrade3: Unit[] = [
  {
    id: "3-spanish-grammar",
    title: "Basic Grammar",
    slug: "basic-grammar",
    description: "Introduction to Spanish grammar structures",
    gradeLevel: 3,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("3-sp-nouns", "Nouns & Gender", "Understand masculine and feminine nouns", 30),
      createLesson("3-sp-verbs-ser", "Verb Ser", "Learn the verb 'to be' (permanent)", 30),
      createLesson("3-sp-verbs-estar", "Verb Estar", "Learn the verb 'to be' (temporary)", 30),
      createLesson("3-sp-adjectives", "Adjectives", "Describe people and things", 30),
    ],
  },
];

const spanishGrade4to5: Unit[] = [
  {
    id: "4-spanish-present",
    title: "Present Tense Verbs",
    slug: "present-tense",
    description: "Master regular and irregular present tense verbs",
    gradeLevel: 4,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("4-sp-ar-verbs", "-AR Verbs", "Conjugate regular -ar verbs", 35),
      createLesson("4-sp-er-ir-verbs", "-ER and -IR Verbs", "Conjugate regular -er and -ir verbs", 35),
      createLesson("4-sp-stem-change", "Stem-Changing Verbs", "Learn o→ue, e→ie patterns", 40),
      createLesson("4-sp-irregular", "Common Irregular Verbs", "Master tener, ir, hacer, decir", 40),
    ],
  },
  {
    id: "5-spanish-intermediate",
    title: "Intermediate Communication",
    slug: "intermediate-comm",
    description: "Develop intermediate conversational skills",
    gradeLevel: 5,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("5-sp-past-preterite", "Preterite Tense", "Talk about completed past actions", 40),
      createLesson("5-sp-past-imperfect", "Imperfect Tense", "Describe ongoing past actions", 40),
      createLesson("5-sp-comparisons", "Comparisons", "Compare using más que, menos que", 35),
      createLesson("5-sp-direct-obj", "Direct Object Pronouns", "Use lo, la, los, las", 40),
    ],
  },
];

const spanishMiddle: Unit[] = [
  {
    id: "6-spanish-culture",
    title: "Hispanic Cultures",
    slug: "hispanic-cultures",
    description: "Explore Spanish-speaking countries and cultures",
    gradeLevel: 6,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("6-sp-mexico", "Mexico & Central America", "Geography, traditions, and festivals", 45),
      createLesson("6-sp-spain", "Spain", "History, customs, and regional diversity", 45),
      createLesson("6-sp-southam", "South America", "Explore Andean and Caribbean cultures", 45),
      createLesson("6-sp-music-art", "Music & Art", "Famous artists and musical traditions", 40),
    ],
  },
  {
    id: "7-spanish-complex",
    title: "Complex Structures",
    slug: "complex-structures",
    description: "Advanced grammar and sentence construction",
    gradeLevel: 7,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.4.1"],
    lessons: [
      createLesson("7-sp-subjunctive", "Introduction to Subjunctive", "Express wishes and doubts", 50),
      createLesson("7-sp-commands", "Commands", "Give formal and informal commands", 45),
      createLesson("7-sp-conditional", "Conditional Tense", "Express what would happen", 45),
      createLesson("7-sp-relative", "Relative Pronouns", "Use que, quien, cual", 45),
    ],
  },
  {
    id: "8-spanish-proficiency",
    title: "Intermediate High Proficiency",
    slug: "intermediate-high",
    description: "Develop sophisticated language use",
    gradeLevel: 8,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("8-sp-debate", "Debating Topics", "Express and defend opinions", 50),
      createLesson("8-sp-literature", "Short Stories", "Read and analyze Spanish literature", 50),
      createLesson("8-sp-media", "Spanish Media", "Understand news and entertainment", 45),
      createLesson("8-sp-writing", "Essay Writing", "Write structured paragraphs", 50),
    ],
  },
];

const spanishHigh: Unit[] = [
  {
    id: "9-spanish-advanced",
    title: "Advanced Spanish I",
    slug: "advanced-1",
    description: "College-prep level Spanish",
    gradeLevel: 9,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2", "ACTFL.4.1"],
    lessons: [
      createLesson("9-sp-subj-adv", "Advanced Subjunctive", "Subjunctive with impersonal expressions", 55),
      createLesson("9-sp-perfect", "Perfect Tenses", "Present and past perfect", 55),
      createLesson("9-sp-passive", "Passive Voice", "Construct passive sentences", 50),
      createLesson("9-sp-novel", "Novel Study", "Read a complete novel in Spanish", 60),
    ],
  },
  {
    id: "10-spanish-literature",
    title: "Spanish Literature",
    slug: "literature",
    description: "Survey of Spanish and Latin American literature",
    gradeLevel: 10,
    standardsAlignment: ["ACTFL.3.2", "ACTFL.4.2"],
    lessons: [
      createLesson("10-sp-poetry", "Poetry Analysis", "Analyze poems from Spanish-speaking world", 55),
      createLesson("10-sp-drama", "Theater", "Study dramatic works like Don Quijote", 55),
      createLesson("10-sp-modern", "Modern Literature", "Contemporary authors and themes", 55),
      createLesson("10-sp-film", "Spanish Cinema", "Analyze films from Spain and Latin America", 50),
    ],
  },
  {
    id: "11-spanish-ap",
    title: "AP Spanish Language Prep",
    slug: "ap-language",
    description: "Preparation for AP Spanish Language exam",
    gradeLevel: 11,
    standardsAlignment: ["ACTFL.4.1", "ACTFL.4.2", "ACTFL.5.1"],
    lessons: [
      createLesson("11-sp-ap-listening", "AP Listening Skills", "Practice audio interpretation", 60),
      createLesson("11-sp-ap-reading", "AP Reading Skills", "Analyze authentic texts", 60),
      createLesson("11-sp-ap-speaking", "AP Speaking Tasks", "Prepare interpersonal and presentational tasks", 60),
      createLesson("11-sp-ap-writing", "AP Writing Skills", "Master essay formats", 60),
    ],
  },
  {
    id: "12-spanish-capstone",
    title: "Spanish Capstone",
    slug: "capstone",
    description: "Advanced topics and real-world application",
    gradeLevel: 12,
    standardsAlignment: ["ACTFL.5.1", "ACTFL.5.2"],
    lessons: [
      createLesson("12-sp-current", "Current Events", "Discuss global issues in Spanish", 55),
      createLesson("12-sp-business", "Business Spanish", "Professional communication", 55),
      createLesson("12-sp-heritage", "Heritage & Identity", "Explore Hispanic heritage in the US", 50),
      createLesson("12-sp-capstone", "Capstone Project", "Create a Spanish portfolio", 60),
    ],
  },
];

export const spanishCurriculum: Subject = {
  id: "spanish",
  name: "Spanish",
  slug: "spanish",
  description: "Learn Spanish from beginner to advanced, exploring language and Hispanic cultures",
  icon: "Languages",
  color: "#E91E63",
  grades: {
    0: spanishKindergarten,
    1: spanishGrade1,
    2: spanishGrade2,
    3: spanishGrade3,
    4: spanishGrade4to5.filter(u => u.gradeLevel === 4),
    5: spanishGrade4to5.filter(u => u.gradeLevel === 5),
    6: spanishMiddle.filter(u => u.gradeLevel === 6),
    7: spanishMiddle.filter(u => u.gradeLevel === 7),
    8: spanishMiddle.filter(u => u.gradeLevel === 8),
    9: spanishHigh.filter(u => u.gradeLevel === 9),
    10: spanishHigh.filter(u => u.gradeLevel === 10),
    11: spanishHigh.filter(u => u.gradeLevel === 11),
    12: spanishHigh.filter(u => u.gradeLevel === 12),
  },
};

// =============================================================================
// FRENCH CURRICULUM
// =============================================================================

const frenchKindergarten: Unit[] = [
  {
    id: "k-french-basics",
    title: "Bonjour! French Basics",
    slug: "french-basics",
    description: "Introduction to French greetings and vocabulary",
    gradeLevel: 0,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.1.2"],
    lessons: [
      createLesson("k-fr-greetings", "Greetings", "Learn bonjour, au revoir, merci", 15),
      createLesson("k-fr-colors", "Colors", "Learn colors: rouge, bleu, jaune", 15),
      createLesson("k-fr-numbers", "Numbers 1-10", "Count from un to dix", 20),
      createLesson("k-fr-animals", "Animals", "Learn farm and pet animal names", 15),
    ],
  },
];

const frenchElementary: Unit[] = [
  {
    id: "1-french-intro",
    title: "Introduction to French",
    slug: "introduction",
    description: "Build basic conversational skills",
    gradeLevel: 1,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.2.1"],
    lessons: [
      createLesson("1-fr-intro-self", "Introducing Yourself", "Je m'appelle..., Comment t'appelles-tu?", 20),
      createLesson("1-fr-family", "My Family", "Learn family vocabulary in French", 20),
      createLesson("1-fr-classroom", "In the Classroom", "Learn classroom objects", 25),
    ],
  },
  {
    id: "2-french-daily",
    title: "Daily Life in French",
    slug: "daily-life",
    description: "Vocabulary for everyday activities and routines",
    gradeLevel: 2,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("2-fr-food", "Food & Meals", "Learn food vocabulary: le petit-déjeuner, le déjeuner", 25),
      createLesson("2-fr-weather", "Weather", "Describe le temps: il fait beau, il pleut", 25),
      createLesson("2-fr-body", "Parts of the Body", "Learn body parts: la tête, les bras, les jambes", 25),
      createLesson("2-fr-clothes", "Clothing", "Describe what you wear: les vêtements", 25),
    ],
  },
  {
    id: "3-french-grammar",
    title: "Basic French Grammar",
    slug: "basic-grammar",
    description: "Introduction to French grammar",
    gradeLevel: 3,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("3-fr-articles", "Articles", "Use le, la, les, un, une, des", 30),
      createLesson("3-fr-etre-avoir", "Être and Avoir", "Master the two essential verbs", 35),
      createLesson("3-fr-negation", "Negation", "Form negative sentences with ne...pas", 30),
    ],
  },
  {
    id: "4-french-verbs",
    title: "Present Tense Verbs",
    slug: "present-tense",
    description: "Master regular verb conjugations in present tense",
    gradeLevel: 4,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("4-fr-er-verbs", "-ER Verbs", "Conjugate regular -er verbs: parler, manger, jouer", 35),
      createLesson("4-fr-ir-re-verbs", "-IR and -RE Verbs", "Conjugate regular -ir and -re verbs", 35),
      createLesson("4-fr-aller-faire", "Aller and Faire", "Master these common irregular verbs", 40),
      createLesson("4-fr-questions", "Asking Questions", "Form questions with est-ce que and inversion", 35),
    ],
  },
  {
    id: "5-french-culture",
    title: "French Culture",
    slug: "culture",
    description: "Explore French-speaking regions",
    gradeLevel: 5,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.3.1"],
    lessons: [
      createLesson("5-fr-france", "Discovering France", "Regions, landmarks, and traditions", 40),
      createLesson("5-fr-francophone", "La Francophonie", "French-speaking countries worldwide", 40),
      createLesson("5-fr-cuisine", "French Cuisine", "Traditional foods and dining customs", 35),
    ],
  },
];

const frenchMiddle: Unit[] = [
  {
    id: "6-french-intermediate",
    title: "Intermediate French",
    slug: "intermediate",
    description: "Develop intermediate skills",
    gradeLevel: 6,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("6-fr-past-compose", "Passé Composé", "Talk about past events", 45),
      createLesson("6-fr-imparfait", "Imparfait", "Describe past habits and conditions", 45),
      createLesson("6-fr-pronouns", "Object Pronouns", "Use direct and indirect pronouns", 45),
    ],
  },
  {
    id: "7-french-complex",
    title: "Complex Structures",
    slug: "complex-structures",
    description: "Advanced grammar and cultural exploration",
    gradeLevel: 7,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("7-fr-relative-pronouns", "Relative Pronouns", "Use qui, que, dont, où in complex sentences", 50),
      createLesson("7-fr-future-tense", "Future Tense", "Express future events with le futur simple", 45),
      createLesson("7-fr-comparisons", "Comparisons", "Compare using plus, moins, aussi...que", 45),
      createLesson("7-fr-francophone-lit", "Francophone Literature", "Read stories from French-speaking Africa and Canada", 50),
    ],
  },
  {
    id: "8-french-advanced",
    title: "Advanced French",
    slug: "advanced",
    description: "Complex structures and expression",
    gradeLevel: 8,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("8-fr-subjunctive", "Subjunctive Mood", "Express doubt, wish, necessity", 50),
      createLesson("8-fr-conditional", "Conditional", "Hypothetical situations", 50),
      createLesson("8-fr-literature", "French Literature", "Short stories and poems", 50),
    ],
  },
];

const frenchHigh: Unit[] = [
  {
    id: "9-french-advanced-lit",
    title: "French Literature I",
    slug: "literature-1",
    description: "Study French literary works",
    gradeLevel: 9,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("9-fr-fairy-tales", "Contes de Fées", "Classic French fairy tales", 55),
      createLesson("9-fr-short-stories", "Nouvelles", "Modern short fiction", 55),
      createLesson("9-fr-poetry", "French Poetry", "From Ronsard to contemporary", 55),
    ],
  },
  {
    id: "10-french-literature-2",
    title: "French Literature II",
    slug: "literature-2",
    description: "In-depth study of French literary movements",
    gradeLevel: 10,
    standardsAlignment: ["ACTFL.3.2", "ACTFL.4.1"],
    lessons: [
      createLesson("10-fr-enlightenment", "Les Lumières", "Enlightenment writers: Voltaire, Rousseau", 55),
      createLesson("10-fr-romanticism", "Le Romantisme", "Hugo, Lamartine, and the Romantic movement", 55),
      createLesson("10-fr-realism", "Le Réalisme", "Balzac, Flaubert, and French realism", 55),
      createLesson("10-fr-theater", "French Theater", "Molière and modern French drama", 55),
    ],
  },
  {
    id: "11-french-ap",
    title: "AP French Preparation",
    slug: "ap-french",
    description: "Prepare for AP French exam",
    gradeLevel: 11,
    standardsAlignment: ["ACTFL.4.1", "ACTFL.4.2"],
    lessons: [
      createLesson("11-fr-ap-themes", "AP Themes", "Explore the six AP themes", 60),
      createLesson("11-fr-ap-speaking", "Interpersonal Tasks", "Conversations and presentations", 60),
      createLesson("11-fr-ap-essay", "AP Essay Writing", "Persuasive writing in French", 60),
    ],
  },
  {
    id: "12-french-capstone",
    title: "French Capstone",
    slug: "capstone",
    description: "Advanced topics and real-world application",
    gradeLevel: 12,
    standardsAlignment: ["ACTFL.5.1", "ACTFL.5.2"],
    lessons: [
      createLesson("12-fr-current-events", "L'Actualité", "Discuss current events in French", 55),
      createLesson("12-fr-business", "Le Français Professionnel", "Business and professional French", 55),
      createLesson("12-fr-film", "Le Cinéma Français", "Analyze French and Francophone films", 55),
      createLesson("12-fr-capstone-project", "Projet Final", "Create a French portfolio and presentation", 60),
    ],
  },
];

export const frenchCurriculum: Subject = {
  id: "french",
  name: "French",
  slug: "french",
  description: "Learn French and explore Francophone cultures around the world",
  icon: "Languages",
  color: "#3F51B5",
  grades: {
    0: frenchKindergarten,
    1: frenchElementary.filter(u => u.gradeLevel === 1),
    2: frenchElementary.filter(u => u.gradeLevel === 2),
    3: frenchElementary.filter(u => u.gradeLevel === 3),
    4: frenchElementary.filter(u => u.gradeLevel === 4),
    5: frenchElementary.filter(u => u.gradeLevel === 5),
    6: frenchMiddle.filter(u => u.gradeLevel === 6),
    7: frenchMiddle.filter(u => u.gradeLevel === 7),
    8: frenchMiddle.filter(u => u.gradeLevel === 8),
    9: frenchHigh.filter(u => u.gradeLevel === 9),
    10: frenchHigh.filter(u => u.gradeLevel === 10),
    11: frenchHigh.filter(u => u.gradeLevel === 11),
    12: frenchHigh.filter(u => u.gradeLevel === 12),
  },
};

// =============================================================================
// GERMAN CURRICULUM
// =============================================================================

const germanKindergarten: Unit[] = [
  {
    id: "k-german-basics",
    title: "Hallo! German Basics",
    slug: "german-basics",
    description: "Introduction to German language",
    gradeLevel: 0,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.1.2"],
    lessons: [
      createLesson("k-de-greetings", "Greetings", "Learn Guten Tag, Auf Wiedersehen", 15),
      createLesson("k-de-colors", "Colors", "Learn Farben: rot, blau, gelb", 15),
      createLesson("k-de-numbers", "Numbers 1-10", "Count from eins to zehn", 20),
    ],
  },
];

const germanElementary: Unit[] = [
  {
    id: "1-german-intro",
    title: "Introduction to German",
    slug: "german-intro",
    description: "Basic German vocabulary and phrases",
    gradeLevel: 1,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.2.1"],
    lessons: [
      createLesson("1-de-intro-self", "Introducing Yourself", "Ich heiße..., Wie heißt du?", 20),
      createLesson("1-de-family", "My Family", "Learn die Familie vocabulary", 20),
      createLesson("1-de-classroom", "In the Classroom", "Learn classroom objects in German", 25),
    ],
  },
  {
    id: "2-german-daily",
    title: "Daily Life in German",
    slug: "daily-life",
    description: "Vocabulary for everyday activities",
    gradeLevel: 2,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("2-de-food", "Food & Meals", "Learn das Essen vocabulary", 25),
      createLesson("2-de-weather", "Weather", "Describe das Wetter: Es ist sonnig, es regnet", 25),
      createLesson("2-de-animals", "Animals", "Learn die Tiere in German", 25),
      createLesson("2-de-clothes", "Clothing", "Describe die Kleidung", 25),
    ],
  },
  {
    id: "3-german-grammar",
    title: "German Grammar Basics",
    slug: "grammar-basics",
    description: "Introduction to German grammar",
    gradeLevel: 3,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("3-de-articles", "Articles & Cases", "Der, die, das and case system intro", 35),
      createLesson("3-de-verbs-present", "Present Tense", "Regular verb conjugation", 35),
      createLesson("3-de-sein-haben", "Sein and Haben", "Master the essential verbs", 35),
    ],
  },
  {
    id: "4-german-verbs",
    title: "Verb Conjugation",
    slug: "verb-conjugation",
    description: "Master German verb patterns",
    gradeLevel: 4,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("4-de-regular-verbs", "Regular Verbs", "Conjugate regular verbs: spielen, lernen, machen", 35),
      createLesson("4-de-stem-change", "Stem-Changing Verbs", "Learn sprechen, lesen, fahren patterns", 40),
      createLesson("4-de-separable", "Separable Verbs", "Understand aufstehen, ankommen, mitkommen", 40),
      createLesson("4-de-questions", "Asking Questions", "Form questions with wo, was, wann, wer", 35),
    ],
  },
  {
    id: "5-german-culture",
    title: "German-Speaking Countries",
    slug: "german-culture",
    description: "Explore Germany, Austria, and Switzerland",
    gradeLevel: 5,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.3.1"],
    lessons: [
      createLesson("5-de-germany", "Germany", "Regions, cities, and traditions", 40),
      createLesson("5-de-austria-swiss", "Austria & Switzerland", "Alpine culture and dialects", 40),
      createLesson("5-de-traditions", "Holidays & Traditions", "Oktoberfest, Christmas markets", 35),
    ],
  },
];

const germanMiddleHigh: Unit[] = [
  {
    id: "6-german-intermediate-1",
    title: "Intermediate German I",
    slug: "intermediate-1",
    description: "Build intermediate skills and vocabulary",
    gradeLevel: 6,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("6-de-preterite", "Präteritum", "Simple past tense for storytelling", 45),
      createLesson("6-de-prepositions", "Prepositions", "Two-way prepositions with Akkusativ and Dativ", 50),
      createLesson("6-de-pronouns", "Pronouns", "Personal and reflexive pronouns", 45),
      createLesson("6-de-reading", "Reading Practice", "Short stories and articles", 45),
    ],
  },
  {
    id: "7-german-intermediate",
    title: "Intermediate German II",
    slug: "intermediate",
    description: "Develop intermediate proficiency",
    gradeLevel: 7,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("7-de-perfect", "Perfekt Tense", "Past tense with haben and sein", 50),
      createLesson("7-de-cases", "Case System", "Nominativ, Akkusativ, Dativ", 55),
      createLesson("7-de-modal", "Modal Verbs", "können, müssen, wollen, dürfen", 45),
    ],
  },
  {
    id: "8-german-advanced-grammar",
    title: "Advanced Grammar",
    slug: "advanced-grammar",
    description: "Master complex German structures",
    gradeLevel: 8,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("8-de-genitive", "Genitive Case", "The fourth case in German", 50),
      createLesson("8-de-relative", "Relative Clauses", "Complex sentence construction", 55),
      createLesson("8-de-future", "Future Tenses", "Futur I and Futur II", 50),
      createLesson("8-de-culture", "German Culture", "History, arts, and current events", 50),
    ],
  },
  {
    id: "9-german-high-1",
    title: "German I High School",
    slug: "high-school-1",
    description: "High school German fundamentals",
    gradeLevel: 9,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("9-de-review", "Comprehensive Review", "Solidify all grammar concepts", 55),
      createLesson("9-de-writing", "Writing Skills", "Paragraph and essay structure", 55),
      createLesson("9-de-conversation", "Conversation Practice", "Extended conversations on various topics", 50),
      createLesson("9-de-media", "German Media", "Films, music, and current events", 50),
    ],
  },
  {
    id: "10-german-advanced",
    title: "Advanced German",
    slug: "advanced",
    description: "Complex grammar and literature",
    gradeLevel: 10,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("10-de-subjunctive", "Konjunktiv II", "Express wishes and hypotheticals", 55),
      createLesson("10-de-passive", "Passive Voice", "Form passive constructions", 50),
      createLesson("10-de-literature", "German Literature", "Kafka, Goethe, modern works", 60),
    ],
  },
  {
    id: "11-german-literature",
    title: "German Literature",
    slug: "literature",
    description: "Survey of German literary traditions",
    gradeLevel: 11,
    standardsAlignment: ["ACTFL.3.2", "ACTFL.4.1"],
    lessons: [
      createLesson("11-de-enlightenment", "Die Aufklärung", "Enlightenment literature", 55),
      createLesson("11-de-romantik", "Die Romantik", "German Romantic movement", 55),
      createLesson("11-de-modern", "Moderne Literatur", "20th century German authors", 55),
      createLesson("11-de-film", "Deutscher Film", "German cinema history and analysis", 55),
    ],
  },
  {
    id: "12-german-capstone",
    title: "German Capstone",
    slug: "capstone",
    description: "Advanced topics and real-world application",
    gradeLevel: 12,
    standardsAlignment: ["ACTFL.5.1", "ACTFL.5.2"],
    lessons: [
      createLesson("12-de-current-events", "Aktuelle Ereignisse", "Discuss current events in German", 55),
      createLesson("12-de-business", "Geschäftsdeutsch", "Business and professional German", 55),
      createLesson("12-de-history", "Deutsche Geschichte", "In-depth study of German history", 55),
      createLesson("12-de-capstone", "Abschlussprojekt", "Create a German portfolio and presentation", 60),
    ],
  },
];

export const germanCurriculum: Subject = {
  id: "german",
  name: "German",
  slug: "german",
  description: "Learn German and explore German-speaking cultures in Europe",
  icon: "Languages",
  color: "#FFC107",
  grades: {
    0: germanKindergarten,
    1: germanElementary.filter(u => u.gradeLevel === 1),
    2: germanElementary.filter(u => u.gradeLevel === 2),
    3: germanElementary.filter(u => u.gradeLevel === 3),
    4: germanElementary.filter(u => u.gradeLevel === 4),
    5: germanElementary.filter(u => u.gradeLevel === 5),
    6: germanMiddleHigh.filter(u => u.gradeLevel === 6),
    7: germanMiddleHigh.filter(u => u.gradeLevel === 7),
    8: germanMiddleHigh.filter(u => u.gradeLevel === 8),
    9: germanMiddleHigh.filter(u => u.gradeLevel === 9),
    10: germanMiddleHigh.filter(u => u.gradeLevel === 10),
    11: germanMiddleHigh.filter(u => u.gradeLevel === 11),
    12: germanMiddleHigh.filter(u => u.gradeLevel === 12),
  },
};

// =============================================================================
// MANDARIN CHINESE CURRICULUM
// =============================================================================

const mandarinKindergarten: Unit[] = [
  {
    id: "k-mandarin-basics",
    title: "你好! Mandarin Basics",
    slug: "mandarin-basics",
    description: "Introduction to Mandarin Chinese",
    gradeLevel: 0,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.1.2"],
    lessons: [
      createLesson("k-zh-greetings", "Greetings", "Learn 你好, 再见, 谢谢", 20),
      createLesson("k-zh-tones", "Four Tones", "Master the four tones of Mandarin", 20),
      createLesson("k-zh-numbers", "Numbers 1-10", "Count from 一 to 十", 20),
    ],
  },
];

const mandarinElementary: Unit[] = [
  {
    id: "1-mandarin-intro",
    title: "Introduction to Mandarin",
    slug: "mandarin-intro",
    description: "Basic vocabulary and pinyin",
    gradeLevel: 1,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.2.1"],
    lessons: [
      createLesson("1-zh-intro-self", "Introducing Yourself", "我叫..., 你叫什么名字?", 20),
      createLesson("1-zh-pinyin", "Pinyin Basics", "Learn pinyin romanization system", 25),
      createLesson("1-zh-family", "My Family", "Learn 家人 family vocabulary", 20),
      createLesson("1-zh-colors", "Colors", "Learn 颜色: 红, 蓝, 绿, 黄", 20),
    ],
  },
  {
    id: "2-mandarin-daily",
    title: "Daily Life in Mandarin",
    slug: "daily-life",
    description: "Vocabulary for everyday activities",
    gradeLevel: 2,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("2-zh-food", "Food & Meals", "Learn 食物 food vocabulary", 25),
      createLesson("2-zh-animals", "Animals", "Learn 动物 animal vocabulary", 25),
      createLesson("2-zh-school", "At School", "Learn school vocabulary: 学校, 老师, 学生", 25),
      createLesson("2-zh-body", "Parts of the Body", "Learn body parts in Mandarin", 25),
    ],
  },
  {
    id: "3-mandarin-characters",
    title: "Chinese Characters",
    slug: "characters",
    description: "Introduction to reading and writing characters",
    gradeLevel: 3,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("3-zh-radicals", "Radicals", "Learn common radicals (部首)", 35),
      createLesson("3-zh-strokes", "Stroke Order", "Write characters correctly", 35),
      createLesson("3-zh-basic-chars", "Basic Characters", "100 most common characters", 40),
    ],
  },
  {
    id: "4-mandarin-reading",
    title: "Reading and Writing",
    slug: "reading-writing",
    description: "Develop character recognition and writing",
    gradeLevel: 4,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("4-zh-character-comp", "Character Components", "Understand how characters are built", 40),
      createLesson("4-zh-sentences", "Simple Sentences", "Read and write basic sentences", 40),
      createLesson("4-zh-numbers-dates", "Numbers and Dates", "Express quantities and calendar dates", 35),
      createLesson("4-zh-questions", "Asking Questions", "Form questions with 吗, 什么, 哪里", 40),
    ],
  },
  {
    id: "5-mandarin-grammar",
    title: "Mandarin Grammar",
    slug: "grammar",
    description: "Basic sentence structures",
    gradeLevel: 5,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.4.1"],
    lessons: [
      createLesson("5-zh-sentence", "Sentence Structure", "Subject-Verb-Object order", 40),
      createLesson("5-zh-measure", "Measure Words", "个, 本, 只 and other classifiers", 40),
      createLesson("5-zh-time", "Time Expressions", "Express time and dates", 35),
    ],
  },
];

const mandarinMiddleHigh: Unit[] = [
  {
    id: "6-mandarin-intermediate-1",
    title: "Intermediate Mandarin I",
    slug: "intermediate-1",
    description: "Build reading and writing fluency",
    gradeLevel: 6,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("6-zh-300-chars", "300 Characters", "Expand character recognition", 50),
      createLesson("6-zh-direction", "Direction Complements", "上, 下, 进, 出 with verbs", 45),
      createLesson("6-zh-comparison", "Comparisons", "Use 比 to compare", 45),
      createLesson("6-zh-culture", "Chinese Culture", "Festivals and traditions", 45),
    ],
  },
  {
    id: "7-mandarin-intermediate",
    title: "Intermediate Mandarin II",
    slug: "intermediate",
    description: "Expand vocabulary and grammar",
    gradeLevel: 7,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("7-zh-aspect", "Aspect Markers", "了, 过, 着 for tense/aspect", 50),
      createLesson("7-zh-complements", "Result Complements", "Verb compounds", 50),
      createLesson("7-zh-reading", "Reading Passages", "Short texts and stories", 50),
    ],
  },
  {
    id: "8-mandarin-advanced-grammar",
    title: "Advanced Grammar",
    slug: "advanced-grammar",
    description: "Master complex Mandarin structures",
    gradeLevel: 8,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("8-zh-ba-sentence", "把 Sentences", "Disposal construction", 55),
      createLesson("8-zh-bei-passive", "被 Passive", "Passive voice in Mandarin", 55),
      createLesson("8-zh-relative-clause", "Relative Clauses", "Complex sentence structures", 55),
      createLesson("8-zh-formal-informal", "Register", "Formal vs informal speech", 50),
    ],
  },
  {
    id: "9-mandarin-high-1",
    title: "Mandarin I High School",
    slug: "high-school-1",
    description: "High school Mandarin fundamentals",
    gradeLevel: 9,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("9-zh-500-chars", "500 Characters", "Expand to 500 character vocabulary", 55),
      createLesson("9-zh-writing", "Writing Skills", "Paragraph and essay structure", 55),
      createLesson("9-zh-conversation", "Conversation Practice", "Extended conversations", 50),
      createLesson("9-zh-media", "Chinese Media", "Films, music, and current events", 50),
    ],
  },
  {
    id: "10-mandarin-advanced",
    title: "Advanced Mandarin",
    slug: "advanced",
    description: "Complex grammar and cultural topics",
    gradeLevel: 10,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("10-zh-idioms", "Chengyu (成语)", "Four-character idioms", 55),
      createLesson("10-zh-literature", "Chinese Literature", "Classical and modern texts", 60),
      createLesson("10-zh-culture", "Chinese Culture", "Philosophy, history, arts", 55),
    ],
  },
  {
    id: "11-mandarin-literature",
    title: "Chinese Literature",
    slug: "literature",
    description: "Survey of Chinese literary traditions",
    gradeLevel: 11,
    standardsAlignment: ["ACTFL.3.2", "ACTFL.4.1"],
    lessons: [
      createLesson("11-zh-classical", "Classical Chinese", "Introduction to 文言文", 60),
      createLesson("11-zh-poetry", "Chinese Poetry", "Tang and Song dynasty poetry", 55),
      createLesson("11-zh-modern-lit", "Modern Literature", "20th century Chinese authors", 55),
      createLesson("11-zh-film", "Chinese Cinema", "Chinese film history and analysis", 55),
    ],
  },
  {
    id: "12-mandarin-capstone",
    title: "Chinese Capstone",
    slug: "capstone",
    description: "Advanced topics and real-world application",
    gradeLevel: 12,
    standardsAlignment: ["ACTFL.5.1", "ACTFL.5.2"],
    lessons: [
      createLesson("12-zh-current-events", "当前事件", "Discuss current events in Mandarin", 55),
      createLesson("12-zh-business", "商务汉语", "Business Mandarin", 55),
      createLesson("12-zh-history", "中国历史", "In-depth study of Chinese history", 55),
      createLesson("12-zh-capstone", "毕业项目", "Create a Mandarin portfolio and presentation", 60),
    ],
  },
];

export const mandarinCurriculum: Subject = {
  id: "mandarin",
  name: "Mandarin Chinese",
  slug: "mandarin",
  description: "Learn Mandarin Chinese, the world's most spoken language",
  icon: "Languages",
  color: "#F44336",
  grades: {
    0: mandarinKindergarten,
    1: mandarinElementary.filter(u => u.gradeLevel === 1),
    2: mandarinElementary.filter(u => u.gradeLevel === 2),
    3: mandarinElementary.filter(u => u.gradeLevel === 3),
    4: mandarinElementary.filter(u => u.gradeLevel === 4),
    5: mandarinElementary.filter(u => u.gradeLevel === 5),
    6: mandarinMiddleHigh.filter(u => u.gradeLevel === 6),
    7: mandarinMiddleHigh.filter(u => u.gradeLevel === 7),
    8: mandarinMiddleHigh.filter(u => u.gradeLevel === 8),
    9: mandarinMiddleHigh.filter(u => u.gradeLevel === 9),
    10: mandarinMiddleHigh.filter(u => u.gradeLevel === 10),
    11: mandarinMiddleHigh.filter(u => u.gradeLevel === 11),
    12: mandarinMiddleHigh.filter(u => u.gradeLevel === 12),
  },
};

// =============================================================================
// JAPANESE CURRICULUM
// =============================================================================

const japaneseKindergarten: Unit[] = [
  {
    id: "k-japanese-basics",
    title: "こんにちは! Japanese Basics",
    slug: "japanese-basics",
    description: "Introduction to Japanese language",
    gradeLevel: 0,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.1.2"],
    lessons: [
      createLesson("k-jp-greetings", "Greetings", "Learn こんにちは, さようなら", 20),
      createLesson("k-jp-sounds", "Japanese Sounds", "Introduction to Japanese phonetics", 20),
      createLesson("k-jp-numbers", "Numbers 1-10", "Count from いち to じゅう", 20),
    ],
  },
];

const japaneseElementary: Unit[] = [
  {
    id: "1-japanese-intro",
    title: "Introduction to Japanese",
    slug: "japanese-intro",
    description: "Basic vocabulary and sounds",
    gradeLevel: 1,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.2.1"],
    lessons: [
      createLesson("1-jp-intro-self", "Introducing Yourself", "わたしは...です, おなまえは?", 20),
      createLesson("1-jp-family", "My Family", "Learn かぞく family vocabulary", 20),
      createLesson("1-jp-colors", "Colors", "Learn いろ: あか, あお, きいろ", 20),
      createLesson("1-jp-animals", "Animals", "Learn どうぶつ animal names", 20),
    ],
  },
  {
    id: "2-japanese-daily",
    title: "Daily Life in Japanese",
    slug: "daily-life",
    description: "Vocabulary for everyday activities",
    gradeLevel: 2,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("2-jp-food", "Food & Meals", "Learn たべもの food vocabulary", 25),
      createLesson("2-jp-school", "At School", "Learn school vocabulary: がっこう, せんせい", 25),
      createLesson("2-jp-hiragana-start", "Hiragana Introduction", "Learn first 10 hiragana characters", 30),
      createLesson("2-jp-body", "Parts of the Body", "Learn body parts in Japanese", 25),
    ],
  },
  {
    id: "3-japanese-writing",
    title: "Japanese Writing Systems",
    slug: "writing-systems",
    description: "Learn Hiragana and Katakana",
    gradeLevel: 3,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("3-jp-hiragana", "Hiragana", "Master the 46 hiragana characters", 40),
      createLesson("3-jp-katakana", "Katakana", "Master the 46 katakana characters", 40),
      createLesson("3-jp-basic-kanji", "Basic Kanji", "First 50 kanji characters", 45),
    ],
  },
  {
    id: "4-japanese-reading",
    title: "Reading and Writing",
    slug: "reading-writing",
    description: "Develop reading fluency",
    gradeLevel: 4,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("4-jp-100-kanji", "100 Kanji", "Learn 100 essential kanji", 45),
      createLesson("4-jp-sentences", "Simple Sentences", "Read and write basic sentences", 40),
      createLesson("4-jp-time-dates", "Time and Dates", "Express time and calendar dates", 35),
      createLesson("4-jp-counters", "Counters", "Learn Japanese counting systems", 40),
    ],
  },
  {
    id: "5-japanese-grammar",
    title: "Japanese Grammar",
    slug: "grammar",
    description: "Basic sentence patterns",
    gradeLevel: 5,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.4.1"],
    lessons: [
      createLesson("5-jp-particles", "Particles", "は, が, を, に, で, and more", 45),
      createLesson("5-jp-verbs", "Verb Forms", "Dictionary, masu, and te-forms", 45),
      createLesson("5-jp-adjectives", "Adjectives", "い-adjectives and な-adjectives", 40),
    ],
  },
];

const japaneseMiddleHigh: Unit[] = [
  {
    id: "6-japanese-intermediate-1",
    title: "Intermediate Japanese I",
    slug: "intermediate-1",
    description: "Build intermediate skills",
    gradeLevel: 6,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("6-jp-200-kanji", "200 Kanji", "Expand kanji recognition", 50),
      createLesson("6-jp-te-form", "Te-form Applications", "Connecting sentences and requests", 45),
      createLesson("6-jp-casual", "Casual Speech", "Informal conversation patterns", 45),
      createLesson("6-jp-culture", "Japanese Culture", "Festivals and traditions", 45),
    ],
  },
  {
    id: "7-japanese-intermediate",
    title: "Intermediate Japanese II",
    slug: "intermediate",
    description: "Develop conversational fluency",
    gradeLevel: 7,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("7-jp-potential", "Potential Form", "Express ability (できる)", 50),
      createLesson("7-jp-volitional", "Volitional Form", "Express intention and suggestions", 50),
      createLesson("7-jp-keigo-intro", "Keigo Introduction", "Polite language basics", 50),
    ],
  },
  {
    id: "8-japanese-advanced-grammar",
    title: "Advanced Grammar",
    slug: "advanced-grammar",
    description: "Master complex Japanese structures",
    gradeLevel: 8,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("8-jp-passive", "Passive Form", "Express passive voice in Japanese", 55),
      createLesson("8-jp-causative", "Causative Form", "Express making/letting someone do", 55),
      createLesson("8-jp-conditionals", "Conditionals", "たら, ば, なら patterns", 55),
      createLesson("8-jp-media", "Japanese Media", "Anime, manga, and current events", 50),
    ],
  },
  {
    id: "9-japanese-high-1",
    title: "Japanese I High School",
    slug: "high-school-1",
    description: "High school Japanese fundamentals",
    gradeLevel: 9,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("9-jp-300-kanji", "300 Kanji", "Expand to 300 kanji vocabulary", 55),
      createLesson("9-jp-writing", "Writing Skills", "Paragraph and essay structure", 55),
      createLesson("9-jp-conversation", "Conversation Practice", "Extended conversations", 50),
      createLesson("9-jp-business", "Business Japanese", "Professional communication basics", 50),
    ],
  },
  {
    id: "10-japanese-advanced",
    title: "Advanced Japanese",
    slug: "advanced",
    description: "Complex grammar and cultural literacy",
    gradeLevel: 10,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("10-jp-keigo-adv", "Advanced Keigo", "Humble and honorific speech", 60),
      createLesson("10-jp-literature", "Japanese Literature", "Modern and classical texts", 60),
      createLesson("10-jp-culture", "Japanese Culture", "Traditions, anime, modern Japan", 55),
    ],
  },
  {
    id: "11-japanese-literature",
    title: "Japanese Literature",
    slug: "literature",
    description: "Survey of Japanese literary traditions",
    gradeLevel: 11,
    standardsAlignment: ["ACTFL.3.2", "ACTFL.4.1"],
    lessons: [
      createLesson("11-jp-classical", "Classical Japanese", "Introduction to 古文", 60),
      createLesson("11-jp-poetry", "Japanese Poetry", "Haiku, tanka, and modern poetry", 55),
      createLesson("11-jp-modern-lit", "Modern Literature", "Murakami, Kawabata, and contemporary authors", 55),
      createLesson("11-jp-film", "Japanese Cinema", "Japanese film history and analysis", 55),
    ],
  },
  {
    id: "12-japanese-capstone",
    title: "Japanese Capstone",
    slug: "capstone",
    description: "Advanced topics and real-world application",
    gradeLevel: 12,
    standardsAlignment: ["ACTFL.5.1", "ACTFL.5.2"],
    lessons: [
      createLesson("12-jp-current-events", "時事問題", "Discuss current events in Japanese", 55),
      createLesson("12-jp-advanced-business", "上級ビジネス日本語", "Advanced business Japanese", 55),
      createLesson("12-jp-history", "日本の歴史", "In-depth study of Japanese history", 55),
      createLesson("12-jp-capstone", "卒業プロジェクト", "Create a Japanese portfolio and presentation", 60),
    ],
  },
];

export const japaneseCurriculum: Subject = {
  id: "japanese",
  name: "Japanese",
  slug: "japanese",
  description: "Learn Japanese language and explore rich Japanese culture",
  icon: "Languages",
  color: "#9C27B0",
  grades: {
    0: japaneseKindergarten,
    1: japaneseElementary.filter(u => u.gradeLevel === 1),
    2: japaneseElementary.filter(u => u.gradeLevel === 2),
    3: japaneseElementary.filter(u => u.gradeLevel === 3),
    4: japaneseElementary.filter(u => u.gradeLevel === 4),
    5: japaneseElementary.filter(u => u.gradeLevel === 5),
    6: japaneseMiddleHigh.filter(u => u.gradeLevel === 6),
    7: japaneseMiddleHigh.filter(u => u.gradeLevel === 7),
    8: japaneseMiddleHigh.filter(u => u.gradeLevel === 8),
    9: japaneseMiddleHigh.filter(u => u.gradeLevel === 9),
    10: japaneseMiddleHigh.filter(u => u.gradeLevel === 10),
    11: japaneseMiddleHigh.filter(u => u.gradeLevel === 11),
    12: japaneseMiddleHigh.filter(u => u.gradeLevel === 12),
  },
};

// =============================================================================
// AMERICAN SIGN LANGUAGE (ASL) CURRICULUM
// =============================================================================

const aslKindergarten: Unit[] = [
  {
    id: "k-asl-basics",
    title: "Hello! ASL Basics",
    slug: "asl-basics",
    description: "Introduction to American Sign Language",
    gradeLevel: 0,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.1.2"],
    lessons: [
      createLesson("k-asl-alphabet", "Fingerspelling", "Learn the ASL alphabet A-Z", 20),
      createLesson("k-asl-greetings", "Greetings", "Signs for hello, goodbye, thank you", 15),
      createLesson("k-asl-numbers", "Numbers 1-10", "Count on your hands", 20),
      createLesson("k-asl-colors", "Colors", "Learn color signs", 15),
    ],
  },
];

const aslElementary: Unit[] = [
  {
    id: "1-asl-vocabulary",
    title: "Essential Vocabulary",
    slug: "vocabulary",
    description: "Build foundational ASL vocabulary",
    gradeLevel: 1,
    standardsAlignment: ["ACTFL.1.1", "ACTFL.2.1"],
    lessons: [
      createLesson("1-asl-family", "Family Signs", "Signs for family members", 25),
      createLesson("1-asl-feelings", "Feelings", "Express emotions in ASL", 25),
      createLesson("1-asl-questions", "Question Words", "Who, what, where, when, why", 25),
    ],
  },
  {
    id: "2-asl-daily",
    title: "Daily Life in ASL",
    slug: "daily-life",
    description: "Signs for everyday activities",
    gradeLevel: 2,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("2-asl-food", "Food Signs", "Signs for foods and meals", 25),
      createLesson("2-asl-school", "School Signs", "Classroom and school vocabulary", 25),
      createLesson("2-asl-animals", "Animal Signs", "Common animal signs", 25),
      createLesson("2-asl-time", "Time Signs", "Days, weeks, and time concepts", 25),
    ],
  },
  {
    id: "3-asl-grammar",
    title: "ASL Grammar",
    slug: "grammar",
    description: "Learn ASL sentence structure",
    gradeLevel: 3,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.4.1"],
    lessons: [
      createLesson("3-asl-structure", "Sentence Structure", "Topic-comment structure", 35),
      createLesson("3-asl-facial", "Facial Grammar", "Non-manual markers", 35),
      createLesson("3-asl-classifiers", "Classifiers Intro", "Handshape classifiers", 40),
    ],
  },
  {
    id: "4-asl-conversation",
    title: "Conversational ASL",
    slug: "conversation",
    description: "Develop conversational skills",
    gradeLevel: 4,
    standardsAlignment: ["ACTFL.1.2", "ACTFL.2.1"],
    lessons: [
      createLesson("4-asl-intros", "Introductions", "Introduce yourself and others", 35),
      createLesson("4-asl-descriptions", "Descriptions", "Describe people and places", 40),
      createLesson("4-asl-directions", "Directions", "Give and follow directions", 35),
      createLesson("4-asl-requests", "Requests", "Make polite requests in ASL", 35),
    ],
  },
  {
    id: "5-asl-culture",
    title: "Deaf Culture",
    slug: "deaf-culture",
    description: "Explore Deaf culture and history",
    gradeLevel: 5,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.3.1"],
    lessons: [
      createLesson("5-asl-history", "Deaf History", "History of the Deaf community", 40),
      createLesson("5-asl-community", "Deaf Community", "Values and cultural norms", 40),
      createLesson("5-asl-technology", "Technology & Accessibility", "Deaf-friendly technology", 35),
    ],
  },
];

const aslMiddleHigh: Unit[] = [
  {
    id: "6-asl-intermediate-1",
    title: "Intermediate ASL I",
    slug: "intermediate-1",
    description: "Build intermediate signing skills",
    gradeLevel: 6,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("6-asl-numbers-adv", "Advanced Numbers", "Numbers beyond 100 and money signs", 45),
      createLesson("6-asl-time-adv", "Time and Scheduling", "Complex time expressions", 45),
      createLesson("6-asl-locations", "Locations and Space", "Use of space for reference", 50),
      createLesson("6-asl-deaf-events", "Deaf Events", "Deaf community gatherings and events", 45),
    ],
  },
  {
    id: "7-asl-intermediate",
    title: "Intermediate ASL II",
    slug: "intermediate",
    description: "Develop fluent conversation skills",
    gradeLevel: 7,
    standardsAlignment: ["ACTFL.2.1", "ACTFL.2.2"],
    lessons: [
      createLesson("7-asl-classifiers-adv", "Advanced Classifiers", "Complex classifier predicates", 50),
      createLesson("7-asl-storytelling", "Storytelling", "Narrative techniques in ASL", 50),
      createLesson("7-asl-roleshift", "Role Shifting", "Perspective changes in signing", 50),
    ],
  },
  {
    id: "8-asl-advanced-grammar",
    title: "Advanced ASL Grammar",
    slug: "advanced-grammar",
    description: "Master complex ASL structures",
    gradeLevel: 8,
    standardsAlignment: ["ACTFL.2.2", "ACTFL.3.1"],
    lessons: [
      createLesson("8-asl-conditionals", "Conditionals", "If-then structures in ASL", 55),
      createLesson("8-asl-temporal", "Temporal Aspect", "Express duration and frequency", 55),
      createLesson("8-asl-comparison", "Comparisons", "Compare and contrast in ASL", 50),
      createLesson("8-asl-deaf-lit", "Deaf Literature", "ASL stories and folklore", 55),
    ],
  },
  {
    id: "9-asl-high-1",
    title: "ASL I High School",
    slug: "high-school-1",
    description: "High school ASL fundamentals",
    gradeLevel: 9,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("9-asl-review", "Comprehensive Review", "Solidify all ASL concepts", 55),
      createLesson("9-asl-discourse", "ASL Discourse", "Extended conversations and presentations", 55),
      createLesson("9-asl-education", "Deaf Education", "History of Deaf schools", 50),
      createLesson("9-asl-advocacy", "Self-Advocacy", "Advocating for accessibility", 50),
    ],
  },
  {
    id: "10-asl-advanced",
    title: "Advanced ASL",
    slug: "advanced",
    description: "Master ASL and interpreting basics",
    gradeLevel: 10,
    standardsAlignment: ["ACTFL.3.1", "ACTFL.3.2"],
    lessons: [
      createLesson("10-asl-poetry", "ASL Poetry & Art", "Visual vernacular and poetry", 55),
      createLesson("10-asl-interpret", "Interpreting Intro", "Basics of ASL interpreting", 60),
      createLesson("10-asl-deafhood", "Deafhood", "Identity and empowerment", 55),
    ],
  },
  {
    id: "11-asl-professional",
    title: "Professional ASL",
    slug: "professional",
    description: "ASL for professional contexts",
    gradeLevel: 11,
    standardsAlignment: ["ACTFL.3.2", "ACTFL.4.1"],
    lessons: [
      createLesson("11-asl-interpret-adv", "Advanced Interpreting", "Interpreting techniques and ethics", 60),
      createLesson("11-asl-medical", "Medical ASL", "Healthcare vocabulary and scenarios", 55),
      createLesson("11-asl-legal", "Legal ASL", "Legal vocabulary and scenarios", 55),
      createLesson("11-asl-careers", "Careers in ASL", "Career paths using ASL skills", 50),
    ],
  },
  {
    id: "12-asl-capstone",
    title: "ASL Capstone",
    slug: "capstone",
    description: "Advanced topics and community engagement",
    gradeLevel: 12,
    standardsAlignment: ["ACTFL.5.1", "ACTFL.5.2"],
    lessons: [
      createLesson("12-asl-linguistics", "ASL Linguistics", "Analyze ASL as a language", 55),
      createLesson("12-asl-research", "Deaf Studies Research", "Research Deaf history and culture", 55),
      createLesson("12-asl-service", "Community Service", "Volunteer with Deaf community", 55),
      createLesson("12-asl-capstone", "Capstone Project", "Create an ASL portfolio and presentation", 60),
    ],
  },
];

export const aslCurriculum: Subject = {
  id: "asl",
  name: "American Sign Language",
  slug: "asl",
  description: "Learn American Sign Language and explore Deaf culture",
  icon: "Hand",
  color: "#00BCD4",
  grades: {
    0: aslKindergarten,
    1: aslElementary.filter(u => u.gradeLevel === 1),
    2: aslElementary.filter(u => u.gradeLevel === 2),
    3: aslElementary.filter(u => u.gradeLevel === 3),
    4: aslElementary.filter(u => u.gradeLevel === 4),
    5: aslElementary.filter(u => u.gradeLevel === 5),
    6: aslMiddleHigh.filter(u => u.gradeLevel === 6),
    7: aslMiddleHigh.filter(u => u.gradeLevel === 7),
    8: aslMiddleHigh.filter(u => u.gradeLevel === 8),
    9: aslMiddleHigh.filter(u => u.gradeLevel === 9),
    10: aslMiddleHigh.filter(u => u.gradeLevel === 10),
    11: aslMiddleHigh.filter(u => u.gradeLevel === 11),
    12: aslMiddleHigh.filter(u => u.gradeLevel === 12),
  },
};

// =============================================================================
// EXPORT ALL LANGUAGE CURRICULA
// =============================================================================

export const languageCurricula = [
  spanishCurriculum,
  frenchCurriculum,
  germanCurriculum,
  mandarinCurriculum,
  japaneseCurriculum,
  aslCurriculum,
];
