/**
 * Domain Service
 *
 * Handles custom domain verification, lookup, and management for white-label organizations.
 * Supports DNS TXT record verification and SSL certificate tracking.
 */

import { db } from "@/lib/db";
import {
  organizations,
  organizationDomains,
  type DomainVerificationStatus,
} from "@/lib/db/schema/organizations";
import { eq, and, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";

// ============================================================================
// Types
// ============================================================================

export interface DomainConfig {
  id: string;
  domain: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  isPrimary: boolean;
  verificationStatus: DomainVerificationStatus;
  routingEnabled: boolean;
  sslEnabled: boolean;
  forceHttps: boolean;
  redirectToWww: boolean;
  primaryColor: string | null;
  logoUrl: string | null;
}

export interface DomainVerificationResult {
  success: boolean;
  status: DomainVerificationStatus;
  message: string;
  dnsRecords?: {
    type: string;
    name: string;
    value: string;
    found: boolean;
  }[];
}

export interface CreateDomainInput {
  organizationId: string;
  domain: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface UpdateDomainInput {
  isPrimary?: boolean;
  routingEnabled?: boolean;
  redirectToWww?: boolean;
  forceHttps?: boolean;
  notes?: string;
}

// ============================================================================
// Domain Lookup (for middleware routing)
// ============================================================================

/**
 * Cache for domain lookups to reduce database queries
 * TTL: 5 minutes
 */
const domainCache = new Map<string, { config: DomainConfig | null; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Look up organization by custom domain
 * Used by middleware to route requests to the correct organization context
 */
export async function lookupDomainConfig(domain: string): Promise<DomainConfig | null> {
  // Normalize domain (lowercase, no trailing dots)
  const normalizedDomain = normalizeDomain(domain);

  // Check cache first
  const cached = domainCache.get(normalizedDomain);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.config;
  }

  // Query database
  const result = await db
    .select({
      id: organizationDomains.id,
      domain: organizationDomains.domain,
      organizationId: organizationDomains.organizationId,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      isPrimary: organizationDomains.isPrimary,
      verificationStatus: organizationDomains.verificationStatus,
      routingEnabled: organizationDomains.routingEnabled,
      sslEnabled: organizationDomains.sslEnabled,
      forceHttps: organizationDomains.forceHttps,
      redirectToWww: organizationDomains.redirectToWww,
      primaryColor: organizations.primaryColor,
      logoUrl: organizations.logoUrl,
    })
    .from(organizationDomains)
    .innerJoin(organizations, eq(organizationDomains.organizationId, organizations.id))
    .where(
      and(
        eq(organizationDomains.domain, normalizedDomain),
        isNull(organizationDomains.deletedAt),
        isNull(organizations.deletedAt)
      )
    )
    .limit(1);

  const config = result[0] || null;

  // Cache the result
  domainCache.set(normalizedDomain, {
    config,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return config;
}

/**
 * Invalidate cache for a specific domain
 */
export function invalidateDomainCache(domain: string): void {
  const normalizedDomain = normalizeDomain(domain);
  domainCache.delete(normalizedDomain);
}

/**
 * Clear all domain cache entries
 */
export function clearDomainCache(): void {
  domainCache.clear();
}

// ============================================================================
// Domain Management
// ============================================================================

/**
 * Add a new custom domain to an organization
 */
export async function addDomain(input: CreateDomainInput): Promise<{
  domain: typeof organizationDomains.$inferSelect;
  verificationToken: string;
}> {
  const normalizedDomain = normalizeDomain(input.domain);

  // Validate domain format
  if (!isValidDomain(normalizedDomain)) {
    throw new Error("Invalid domain format");
  }

  // Check if domain is already in use
  const existing = await db
    .select({ id: organizationDomains.id })
    .from(organizationDomains)
    .where(
      and(
        eq(organizationDomains.domain, normalizedDomain),
        isNull(organizationDomains.deletedAt)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Domain is already registered");
  }

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // If setting as primary, unset existing primary
  if (input.isPrimary) {
    await db
      .update(organizationDomains)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(
        and(
          eq(organizationDomains.organizationId, input.organizationId),
          isNull(organizationDomains.deletedAt)
        )
      );
  }

  // Create domain record
  const [domain] = await db
    .insert(organizationDomains)
    .values({
      organizationId: input.organizationId,
      domain: normalizedDomain,
      isPrimary: input.isPrimary ?? false,
      verificationToken,
      verificationMethod: "dns_txt",
      verificationStatus: "pending",
      notes: input.notes,
    })
    .returning();

  return { domain, verificationToken };
}

/**
 * Update domain settings
 */
export async function updateDomain(
  domainId: string,
  input: UpdateDomainInput
): Promise<typeof organizationDomains.$inferSelect> {
  // Get current domain to check organization
  const [current] = await db
    .select({ organizationId: organizationDomains.organizationId })
    .from(organizationDomains)
    .where(eq(organizationDomains.id, domainId));

  if (!current) {
    throw new Error("Domain not found");
  }

  // If setting as primary, unset existing primary for this org
  if (input.isPrimary) {
    await db
      .update(organizationDomains)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(
        and(
          eq(organizationDomains.organizationId, current.organizationId),
          isNull(organizationDomains.deletedAt)
        )
      );
  }

  // Update the domain
  const [updated] = await db
    .update(organizationDomains)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(organizationDomains.id, domainId))
    .returning();

  // Invalidate cache
  invalidateDomainCache(updated.domain);

  return updated;
}

/**
 * Remove a domain (soft delete)
 */
export async function removeDomain(domainId: string): Promise<void> {
  const [domain] = await db
    .update(organizationDomains)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
      routingEnabled: false,
    })
    .where(eq(organizationDomains.id, domainId))
    .returning({ domain: organizationDomains.domain });

  if (domain) {
    invalidateDomainCache(domain.domain);
  }
}

/**
 * Get all domains for an organization
 */
export async function getOrganizationDomains(
  organizationId: string
): Promise<(typeof organizationDomains.$inferSelect)[]> {
  return db
    .select()
    .from(organizationDomains)
    .where(
      and(
        eq(organizationDomains.organizationId, organizationId),
        isNull(organizationDomains.deletedAt)
      )
    )
    .orderBy(organizationDomains.isPrimary, organizationDomains.createdAt);
}

/**
 * Get a single domain by ID
 */
export async function getDomain(
  domainId: string
): Promise<typeof organizationDomains.$inferSelect | null> {
  const [domain] = await db
    .select()
    .from(organizationDomains)
    .where(
      and(
        eq(organizationDomains.id, domainId),
        isNull(organizationDomains.deletedAt)
      )
    );

  return domain || null;
}

// ============================================================================
// Domain Verification
// ============================================================================

/**
 * Get verification instructions for a domain
 */
export function getVerificationInstructions(
  domain: string,
  verificationToken: string,
  method: string = "dns_txt"
): {
  instructions: string;
  records: { type: string; name: string; value: string }[];
} {
  const normalizedDomain = normalizeDomain(domain);

  if (method === "dns_txt") {
    return {
      instructions: `Add a TXT record to your DNS configuration to verify ownership of ${normalizedDomain}`,
      records: [
        {
          type: "TXT",
          name: `_kaelyns-verify.${normalizedDomain}`,
          value: `kaelyns-verification=${verificationToken}`,
        },
      ],
    };
  }

  if (method === "dns_cname") {
    return {
      instructions: `Add a CNAME record to point your domain to Kaelyn's Academy`,
      records: [
        {
          type: "CNAME",
          name: normalizedDomain,
          value: `${verificationToken}.verify.kaelyns.academy`,
        },
      ],
    };
  }

  // HTTP file method
  return {
    instructions: `Upload a verification file to your website`,
    records: [
      {
        type: "FILE",
        name: `https://${normalizedDomain}/.well-known/kaelyns-verification.txt`,
        value: verificationToken,
      },
    ],
  };
}

/**
 * Verify domain ownership via DNS TXT record
 */
export async function verifyDomain(
  domainId: string
): Promise<DomainVerificationResult> {
  // Get domain details
  const [domain] = await db
    .select()
    .from(organizationDomains)
    .where(eq(organizationDomains.id, domainId));

  if (!domain) {
    return {
      success: false,
      status: "failed",
      message: "Domain not found",
    };
  }

  // Update verification attempt timestamp
  await db
    .update(organizationDomains)
    .set({
      lastVerificationAttempt: new Date(),
      verificationStatus: "verifying",
      updatedAt: new Date(),
    })
    .where(eq(organizationDomains.id, domainId));

  try {
    const result = await performDnsVerification(
      domain.domain,
      domain.verificationToken ?? ""
    );

    // Update domain status based on result
    await db
      .update(organizationDomains)
      .set({
        verificationStatus: result.success ? "verified" : "pending",
        verifiedAt: result.success ? new Date() : null,
        verificationError: result.success ? null : result.message,
        routingEnabled: result.success, // Enable routing when verified
        updatedAt: new Date(),
      })
      .where(eq(organizationDomains.id, domainId));

    // Invalidate cache on status change
    invalidateDomainCache(domain.domain);

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Verification failed";

    await db
      .update(organizationDomains)
      .set({
        verificationStatus: "failed",
        verificationError: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(organizationDomains.id, domainId));

    invalidateDomainCache(domain.domain);

    return {
      success: false,
      status: "failed",
      message: errorMessage,
    };
  }
}

/**
 * Perform DNS TXT record verification
 * Uses Node.js dns module with promises
 */
async function performDnsVerification(
  domain: string,
  expectedToken: string
): Promise<DomainVerificationResult> {
  // Use dynamic import for dns/promises to work in Edge runtime
  const { resolveTxt } = await import("dns/promises");

  const txtRecordName = `_kaelyns-verify.${domain}`;
  const expectedValue = `kaelyns-verification=${expectedToken}`;

  try {
    const records = await resolveTxt(txtRecordName);

    // Flatten the array of arrays that resolveTxt returns
    const flatRecords = records.map((record) => record.join(""));

    const found = flatRecords.some((record) => record === expectedValue);

    return {
      success: found,
      status: found ? "verified" : "pending",
      message: found
        ? "Domain verified successfully"
        : "Verification record not found. Please check your DNS settings.",
      dnsRecords: [
        {
          type: "TXT",
          name: txtRecordName,
          value: expectedValue,
          found,
        },
      ],
    };
  } catch (error) {
    // NXDOMAIN or other DNS errors
    const errorMessage =
      error instanceof Error
        ? error.message
        : "DNS lookup failed";

    return {
      success: false,
      status: "pending",
      message: `DNS lookup failed: ${errorMessage}. Please ensure the TXT record is correctly configured.`,
      dnsRecords: [
        {
          type: "TXT",
          name: txtRecordName,
          value: expectedValue,
          found: false,
        },
      ],
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize domain name (lowercase, remove protocol and trailing dots)
 */
export function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
    .trim();
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex =
    /^(?!-)([a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Check if a domain is a subdomain of the platform domain
 */
export function isPlatformSubdomain(domain: string): boolean {
  const platformDomains = ["kaelyns.academy", "kaelynacademy.com"];
  return platformDomains.some(
    (pd) => domain === pd || domain.endsWith(`.${pd}`)
  );
}

/**
 * Generate a random verification token
 */
function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Check if domain is reserved/blacklisted
 */
export function isReservedDomain(domain: string): boolean {
  const reserved = [
    // Platform domains
    "kaelyns.academy",
    "kaelynacademy.com",
    // Common reserved subdomains
    "www",
    "mail",
    "ftp",
    "api",
    "admin",
    "portal",
    "app",
    "dashboard",
  ];

  const normalized = normalizeDomain(domain);
  return reserved.some((r) => normalized === r || normalized.startsWith(`${r}.`));
}
