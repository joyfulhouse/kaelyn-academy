/**
 * Pagination Validation Utilities
 *
 * SECURITY: Validates pagination parameters to prevent:
 * - Memory exhaustion from very large limits
 * - Slow queries from very large offsets
 * - Unexpected behavior from negative values
 */

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationConfig {
  /** Default limit if not specified (default: 20) */
  defaultLimit?: number;
  /** Maximum allowed limit (default: 100) */
  maxLimit?: number;
  /** Maximum allowed offset (default: 10000) */
  maxOffset?: number;
}

const DEFAULT_CONFIG: Required<PaginationConfig> = {
  defaultLimit: 20,
  maxLimit: 100,
  maxOffset: 10000,
};

/**
 * Parse and validate pagination parameters from query string
 *
 * @param searchParams - URLSearchParams from request
 * @param config - Optional pagination config overrides
 * @returns Validated pagination parameters
 *
 * @example
 * const { limit, offset } = validatePagination(request.nextUrl.searchParams);
 */
export function validatePagination(
  searchParams: URLSearchParams,
  config: PaginationConfig = {}
): PaginationParams {
  const { defaultLimit, maxLimit, maxOffset } = { ...DEFAULT_CONFIG, ...config };

  // Parse limit
  let limit = parseInt(searchParams.get("limit") || String(defaultLimit), 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  limit = Math.min(limit, maxLimit);

  // Parse offset
  let offset = parseInt(searchParams.get("offset") || "0", 10);
  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }
  offset = Math.min(offset, maxOffset);

  return { limit, offset };
}

/**
 * Parse and validate page-based pagination
 *
 * @param searchParams - URLSearchParams from request
 * @param config - Optional pagination config overrides
 * @returns Validated pagination parameters (converted to limit/offset)
 */
export function validatePagePagination(
  searchParams: URLSearchParams,
  config: PaginationConfig = {}
): PaginationParams {
  const { defaultLimit, maxLimit, maxOffset } = { ...DEFAULT_CONFIG, ...config };

  // Parse page (1-indexed)
  let page = parseInt(searchParams.get("page") || "1", 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Parse perPage (limit)
  let perPage = parseInt(searchParams.get("perPage") || String(defaultLimit), 10);
  if (isNaN(perPage) || perPage < 1) {
    perPage = defaultLimit;
  }
  perPage = Math.min(perPage, maxLimit);

  // Calculate offset
  let offset = (page - 1) * perPage;
  offset = Math.min(offset, maxOffset);

  return { limit: perPage, offset };
}

/**
 * Preset pagination configs for common use cases
 */
export const PAGINATION_PRESETS = {
  /** Standard API pagination (default: 20, max: 100) */
  standard: { defaultLimit: 20, maxLimit: 100, maxOffset: 10000 },
  /** Admin panel (default: 50, max: 200) */
  admin: { defaultLimit: 50, maxLimit: 200, maxOffset: 50000 },
  /** Public listings (default: 12, max: 48) */
  public: { defaultLimit: 12, maxLimit: 48, maxOffset: 5000 },
  /** Search results (default: 10, max: 50) */
  search: { defaultLimit: 10, maxLimit: 50, maxOffset: 1000 },
} as const;
