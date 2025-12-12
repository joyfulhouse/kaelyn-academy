import crypto from 'crypto';
import { cookies } from 'next/headers';
import { apiError } from './apiUtils';
import type { NextResponse } from 'next/server';

const CSRF_COOKIE_NAME = 'kaelyn-academy-csrf';

/**
 * Ensure a CSRF token cookie exists and return it.
 * Uses a readable cookie (not httpOnly) for double-submit validation.
 */
export async function ensureCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (existing) return existing;

  const token = crypto.randomBytes(32).toString('hex');
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return token;
}

/**
 * Validate the CSRF token using double-submit: header must match cookie.
 */
export async function isCsrfValid(request: Request): Promise<boolean> {
  const headerToken = request.headers.get('x-csrf-token') || '';
  const cookieToken = (await cookies()).get(CSRF_COOKIE_NAME)?.value || '';

  if (!headerToken || !cookieToken || headerToken.length !== cookieToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken));
  } catch {
    return false;
  }
}

/**
 * Early-return helper for API routes to enforce CSRF.
 */
export async function requireCsrf(request: Request): Promise<NextResponse | void> {
  const valid = await isCsrfValid(request);
  if (!valid) {
    return apiError('Invalid or missing CSRF token', 403);
  }
}
