import type { SessionState } from '@/types';

/**
 * Default session state for new users.
 * Kept in a standalone module so it can be shared by client and server code.
 */
export function getDefaultSessionState(): SessionState {
  return {
    userName: 'Kaelyn',
    lessonsVisited: [],
    lessonsCompleted: [],
    numberPlaces: {
      questionsAttempted: 0,
      questionsCorrect: 0,
      bestStreak: 0,
      highestNumber: 0,
    },
    stackedMath: {
      additionAttempted: 0,
      additionCorrect: 0,
      subtractionAttempted: 0,
      subtractionCorrect: 0,
    },
    multiplication: {
      questionsAttempted: 0,
      questionsCorrect: 0,
      tablesCompleted: [],
      bestStreak: 0,
    },
    division: {
      questionsAttempted: 0,
      questionsCorrect: 0,
      bestStreak: 0,
    },
    carryOver: {
      questionsAttempted: 0,
      questionsCorrect: 0,
      bestStreak: 0,
    },
    borrowing: {
      questionsAttempted: 0,
      questionsCorrect: 0,
      bestStreak: 0,
    },
    practice: {
      totalSessions: 0,
      totalProblems: 0,
      totalCorrect: 0,
      bestScore: 0,
      recentScores: [],
    },
    totalStars: 0,
    achievements: [],
    lastActive: new Date().toISOString(),
  };
}
