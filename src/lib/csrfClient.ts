'use client';

/**
 * Read the CSRF token from the double-submit cookie.
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const entry = document.cookie
    .split('; ')
    .find((part) => part.startsWith('kaelyn-academy-csrf='));

  return entry ? decodeURIComponent(entry.split('=')[1]) : null;
}

/**
 * Merge the CSRF token into existing headers for fetch calls.
 */
export function withCsrf(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfToken();
  if (!token) return headers;

  const merged = new Headers(headers);
  merged.set('X-CSRF-Token', token);
  return merged;
}
