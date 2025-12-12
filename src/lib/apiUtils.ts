import { NextResponse } from 'next/server';

/**
 * Standard API error response
 */
export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

/**
 * Dangerous property names that could enable prototype pollution
 */
const DANGEROUS_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/**
 * Check if an object contains dangerous property names (recursively)
 */
export function hasDangerousKeys(obj: unknown, depth: number = 0): boolean {
  // Prevent infinite recursion
  if (depth > 10) return true;

  if (typeof obj !== 'object' || obj === null) return false;

  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.has(key)) return true;
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null) {
      if (hasDangerousKeys(value, depth + 1)) return true;
    }
  }
  return false;
}

/**
 * Allowed top-level keys for SessionState updates
 */
export const ALLOWED_SESSION_KEYS = new Set([
  'userName',
  'lessonsVisited',
  'lessonsCompleted',
  'numberPlaces',
  'stackedMath',
  'multiplication',
  'division',
  'carryOver',
  'borrowing',
  'setsPairs',
  'practice',
  'sightWords',
  'letters',
  'phonics',
  'totalStars',
  'achievements',
  'lastActive',
]);

/**
 * Allowed keys for ModuleProgress updates
 */
export const ALLOWED_MODULE_PROGRESS_KEYS = new Set([
  'questionsAttempted',
  'questionsCorrect',
  'bestStreak',
  'highestNumber',
  'tablesCompleted',
  'additionAttempted',
  'additionCorrect',
  'subtractionAttempted',
  'subtractionCorrect',
  'totalSessions',
  'totalProblems',
  'totalCorrect',
  'bestScore',
  'recentScores',
  'wordsLearned',
  'currentLevel',
  'lettersLearned',
  'uppercaseComplete',
  'lowercaseComplete',
  'phonemesLearned',
  'wordsBlended',
  'currentUnit',
  'unitsCompleted',
]);

/**
 * Filter an object to only include allowed keys
 */
export function filterAllowedKeys<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: Set<string>
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj)) {
    if (allowedKeys.has(key)) {
      result[key as keyof T] = obj[key] as T[keyof T];
    }
  }
  return result;
}

/**
 * Safely parse JSON from request body
 * Returns null if parsing fails or body contains dangerous keys
 */
export async function safeParseJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return null;
    }
    if (hasDangerousKeys(body)) {
      console.warn('Rejected request with dangerous property names');
      return null;
    }
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
