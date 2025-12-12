import { NextResponse } from 'next/server';
import { getSessionState, setSessionState } from '@/lib/session';
import { safeParseJson, apiError, filterAllowedKeys, ALLOWED_SESSION_KEYS, ALLOWED_MODULE_PROGRESS_KEYS } from '@/lib/apiUtils';
import { ensureCsrfToken, requireCsrf } from '@/lib/csrf';
import type { SessionState } from '@/types';

/**
 * GET /api/state - Get current session state
 */
export async function GET() {
  try {
    await ensureCsrfToken();
    const state = await getSessionState();
    // Re-sign and normalize the cookie on read
    await setSessionState(state);
    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error('Error getting session state:', error);
    return apiError('Failed to get session state', 500);
  }
}

/**
 * POST /api/state - Update session state with partial updates
 */
export async function POST(request: Request) {
  try {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    const body = await safeParseJson(request);
    if (!body) {
      return apiError('Invalid JSON body');
    }

    // Filter to only allowed top-level keys
    const updates = filterAllowedKeys(body, ALLOWED_SESSION_KEYS) as Partial<SessionState>;
    const state = await getSessionState();

    // Type-safe merge of updates into state
    for (const [key, value] of Object.entries(updates)) {
      const stateKey = key as keyof SessionState;
      const currentValue = state[stateKey];

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        currentValue !== null &&
        typeof currentValue === 'object' &&
        !Array.isArray(currentValue)
      ) {
        // Filter nested object to only allowed module progress keys
        const filteredValue = filterAllowedKeys(
          value as unknown as Record<string, unknown>,
          ALLOWED_MODULE_PROGRESS_KEYS
        );
        // Deep merge for nested objects
        Object.assign(currentValue, filteredValue);
      } else if (stateKey in state) {
        // Direct assignment for primitives and arrays
        (state as unknown as Record<string, unknown>)[stateKey] = value;
      }
    }

    await setSessionState(state);
    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error('Error updating session state:', error);
    return apiError('Failed to update session state', 500);
  }
}
