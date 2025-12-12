/**
 * Sight Word Lists for Early Readers
 * Supports multiple curricula: Dolch (thematic) and SIPPS (lesson-based)
 */

export type SightWordCurriculum = 'dolch' | 'sipps';

export interface SightWordLevel {
  level: number;
  name: string;
  words: string[];
}

export interface CurriculumConfig {
  id: SightWordCurriculum;
  name: string;
  description: string;
  levels: SightWordLevel[];
}

// Dolch-based thematic word lists (Pre-K / Kindergarten)
const DOLCH_LEVELS: SightWordLevel[] = [
  {
    level: 1,
    name: 'First Words',
    words: ['a', 'I', 'the', 'to', 'and', 'is', 'it', 'you', 'my', 'we'],
  },
  {
    level: 2,
    name: 'Color Words',
    words: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown'],
  },
  {
    level: 3,
    name: 'Action Words',
    words: ['go', 'see', 'look', 'come', 'run', 'play', 'like', 'can', 'said', 'went'],
  },
  {
    level: 4,
    name: 'People Words',
    words: ['he', 'she', 'me', 'we', 'they', 'him', 'her', 'mom', 'dad', 'friend'],
  },
  {
    level: 5,
    name: 'Question Words',
    words: ['what', 'where', 'who', 'when', 'why', 'how', 'are', 'was', 'were', 'do'],
  },
  {
    level: 6,
    name: 'Everyday Words',
    words: ['up', 'down', 'in', 'out', 'on', 'off', 'big', 'little', 'good', 'day'],
  },
  {
    level: 7,
    name: 'More Words',
    words: ['this', 'that', 'here', 'there', 'all', 'some', 'one', 'two', 'three', 'no'],
  },
  {
    level: 8,
    name: 'Story Words',
    words: ['have', 'has', 'had', 'make', 'made', 'want', 'help', 'find', 'say', 'yes'],
  },
];

// SIPPS Beginning Level words organized by lesson groups
// Based on Collaborative Classroom's SIPPS curriculum sequence
const SIPPS_LEVELS: SightWordLevel[] = [
  {
    level: 1,
    name: 'Lessons 1-10',
    words: ['see', 'I', 'the', 'you', 'can', 'me', 'and', 'we', 'on', 'is'],
  },
  {
    level: 2,
    name: 'Lessons 11-20',
    words: ['yes', 'are', 'no', 'he', 'she', 'get', 'under', 'to', 'a', 'for'],
  },
  {
    level: 3,
    name: 'Lessons 21-30',
    words: ['go', 'down', 'saw', 'my', 'where', 'here', 'by', 'they', 'little', 'put'],
  },
  {
    level: 4,
    name: 'Lessons 31-40',
    words: ['what', 'do', 'like', 'have', 'home', 'said', 'her', 'of', 'out', 'name'],
  },
  {
    level: 5,
    name: 'Lessons 41-50',
    words: ['some', 'come', 'find', 'people', 'again', 'many', 'your', 'very', 'were', 'could'],
  },
  {
    level: 6,
    name: 'Lessons 51-60',
    words: ['should', 'would', 'one', 'two', 'both', 'good', 'does', 'other', 'every', 'from'],
  },
  {
    level: 7,
    name: 'Lessons 61-70',
    words: ['give', 'live', 'has', 'look', 'make', 'play', 'say', 'says', 'their', 'there'],
  },
  {
    level: 8,
    name: 'Lessons 71-81',
    words: ['around', 'be', 'children', 'heard', 'over', 'was', 'water', 'work', 'world', 'write'],
  },
];

// Curriculum configurations
export const CURRICULA: CurriculumConfig[] = [
  {
    id: 'dolch',
    name: 'Dolch Words',
    description: 'Thematic word groups based on Dolch sight word lists',
    levels: DOLCH_LEVELS,
  },
  {
    id: 'sipps',
    name: 'SIPPS',
    description: 'Lesson-based progression from SIPPS Beginning Level',
    levels: SIPPS_LEVELS,
  },
];

// Default curriculum for backwards compatibility
let activeCurriculum: SightWordCurriculum = 'dolch';

export function setActiveCurriculum(curriculum: SightWordCurriculum): void {
  activeCurriculum = curriculum;
}

export function getActiveCurriculum(): SightWordCurriculum {
  return activeCurriculum;
}

export function getCurriculumConfig(curriculum?: SightWordCurriculum): CurriculumConfig {
  const id = curriculum ?? activeCurriculum;
  return CURRICULA.find((c) => c.id === id) ?? CURRICULA[0];
}

// Get levels for a curriculum (or active curriculum if not specified)
export function getSightWordLevels(curriculum?: SightWordCurriculum): SightWordLevel[] {
  return getCurriculumConfig(curriculum).levels;
}

// Legacy export for backwards compatibility
export const SIGHT_WORD_LEVELS = DOLCH_LEVELS;

// Get all words up to a certain level
export function getWordsUpToLevel(level: number, curriculum?: SightWordCurriculum): string[] {
  const levels = getSightWordLevels(curriculum);
  return levels
    .filter((l) => l.level <= level)
    .flatMap((l) => l.words);
}

// Get words for a specific level
export function getWordsForLevel(level: number, curriculum?: SightWordCurriculum): string[] {
  const levels = getSightWordLevels(curriculum);
  const levelData = levels.find((l) => l.level === level);
  return levelData?.words ?? [];
}

// Get level info
export function getLevelInfo(level: number, curriculum?: SightWordCurriculum): SightWordLevel | undefined {
  const levels = getSightWordLevels(curriculum);
  return levels.find((l) => l.level === level);
}

// Get a random word from a level range
export function getRandomWord(minLevel: number = 1, maxLevel: number = 1, curriculum?: SightWordCurriculum): string {
  const levels = getSightWordLevels(curriculum);
  const words = levels
    .filter((l) => l.level >= minLevel && l.level <= maxLevel)
    .flatMap((l) => l.words);
  return words[Math.floor(Math.random() * words.length)];
}

// Get multiple random words (without duplicates)
export function getRandomWords(count: number, minLevel: number = 1, maxLevel: number = 1, curriculum?: SightWordCurriculum): string[] {
  const levels = getSightWordLevels(curriculum);
  const words = levels
    .filter((l) => l.level >= minLevel && l.level <= maxLevel)
    .flatMap((l) => l.words);

  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getTotalLevels(curriculum?: SightWordCurriculum): number {
  return getSightWordLevels(curriculum).length;
}

// Legacy export
export const TOTAL_LEVELS = DOLCH_LEVELS.length;
