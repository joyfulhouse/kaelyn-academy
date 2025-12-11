import { cookies } from 'next/headers';
import type { SessionState } from '@/types';
import { getDefaultSessionState } from './sessionDefaults';

export { getDefaultSessionState };

const SESSION_COOKIE_NAME = 'kaelyn-math-session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get the current session state from cookies
 */
export async function getSessionState(): Promise<SessionState> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    try {
      const state = JSON.parse(sessionCookie.value) as SessionState;
      return state;
    } catch {
      // Invalid JSON, return default
      return getDefaultSessionState();
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
  state.lastActive = new Date().toISOString();

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(state), {
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
}
