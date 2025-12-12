import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { SessionState } from '@/types';
import { getDefaultSessionState } from './sessionDefaults';

export { getDefaultSessionState };

const SESSION_COOKIE_NAME = 'kaelyn-academy-session';
const SESSION_SIG_COOKIE_NAME = 'kaelyn-academy-session-sig';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const MAX_SESSION_BYTES = 3800; // stay under 4KB header limit
const MAX_LESSON_ENTRIES = 50;
const MAX_ACHIEVEMENTS = 50;
const MAX_RECENT_SCORES = 10;

let warnedAboutSecret = false;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET || '';
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production environment');
    }
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn('SESSION_SECRET is not set; using development fallback (unsafe for production)');
    }
    return 'development-session-secret';
  }
  return secret;
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

function isSignatureValid(payload: string, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = signPayload(payload);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function enforceSessionLimits(state: SessionState): SessionState {
  return {
    ...state,
    lessonsVisited: state.lessonsVisited.slice(-MAX_LESSON_ENTRIES),
    lessonsCompleted: state.lessonsCompleted.slice(-MAX_LESSON_ENTRIES),
    achievements: state.achievements.slice(-MAX_ACHIEVEMENTS),
    practice: {
      ...state.practice,
      recentScores: state.practice.recentScores.slice(-MAX_RECENT_SCORES),
    },
  };
}

/**
 * Get the current session state from cookies
 */
export async function getSessionState(): Promise<SessionState> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const signatureCookie = cookieStore.get(SESSION_SIG_COOKIE_NAME);

  if (sessionCookie?.value && signatureCookie?.value && isSignatureValid(sessionCookie.value, signatureCookie.value)) {
    try {
      const state = JSON.parse(sessionCookie.value) as SessionState;
      return enforceSessionLimits(state);
    } catch {
      // Invalid JSON, fall through to default
    }
  }

  return getDefaultSessionState();
}

/**
 * Save session state to cookies
 */
export async function setSessionState(state: SessionState): Promise<void> {
  const cookieStore = await cookies();

  // Update lastActive timestamp
  const limitedState = enforceSessionLimits({
    ...state,
    lastActive: new Date().toISOString(),
  });

  let payload = JSON.stringify(limitedState);
  if (payload.length > MAX_SESSION_BYTES) {
    console.warn('Session payload exceeded size limit; resetting to defaults.');
    const fallbackState = enforceSessionLimits(getDefaultSessionState());
    payload = JSON.stringify(fallbackState);
  }

  const signature = signPayload(payload);

  cookieStore.set(SESSION_COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  cookieStore.set(SESSION_SIG_COOKIE_NAME, signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the session (for testing/reset)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(SESSION_SIG_COOKIE_NAME);
}
