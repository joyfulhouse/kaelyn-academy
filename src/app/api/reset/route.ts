import { NextResponse } from 'next/server';
import { clearSession, getDefaultSessionState, setSessionState } from '@/lib/session';
import { apiError } from '@/lib/apiUtils';
import { requireCsrf } from '@/lib/csrf';

/**
 * POST /api/reset - Reset session state (development only)
 */
export async function POST(request: Request) {
  // Block this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return apiError('Reset endpoint is disabled in production', 403);
  }

  try {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await clearSession();
    const state = getDefaultSessionState();
    await setSessionState(state);

    return NextResponse.json({
      success: true,
      message: 'Session reset',
      state,
    });
  } catch (error) {
    console.error('Error resetting session:', error);
    return apiError('Failed to reset session', 500);
  }
}
