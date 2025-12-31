import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull().default("family"), // family, school, district

  // White-label branding
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }),
  customDomain: varchar("custom_domain", { length: 255 }),

  // Settings
  settings: jsonb("settings").$type<{
    allowTeacherInvites?: boolean;
    maxLearners?: number;
    enabledSubjects?: string[];
    enabledGrades?: number[];
  }>(),

  // Subscription
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

/**
 * Custom domain verification status
 */
export type DomainVerificationStatus = "pending" | "verifying" | "verified" | "failed";

/**
 * Custom domains for white-label organizations
 * Supports multiple domains per organization with verification tracking
 */
export const organizationDomains = pgTable(
  "organization_domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),

    // Domain configuration
    domain: varchar("domain", { length: 255 }).notNull().unique(),
    isPrimary: boolean("is_primary").notNull().default(false),

    // Verification
    verificationStatus: varchar("verification_status", { length: 20 })
      .notNull()
      .default("pending")
      .$type<DomainVerificationStatus>(),
    verificationToken: varchar("verification_token", { length: 64 }),
    verificationMethod: varchar("verification_method", { length: 20 }).default("dns_txt"), // dns_txt, dns_cname, http_file
    verifiedAt: timestamp("verified_at"),
    lastVerificationAttempt: timestamp("last_verification_attempt"),
    verificationError: text("verification_error"),

    // SSL/TLS configuration
    sslEnabled: boolean("ssl_enabled").notNull().default(false),
    sslCertificateId: varchar("ssl_certificate_id", { length: 255 }), // Reference to external cert (e.g., Cloudflare, Let's Encrypt)
    sslExpiresAt: timestamp("ssl_expires_at"),
    autoRenewSsl: boolean("auto_renew_ssl").notNull().default(true),

    // Routing configuration
    routingEnabled: boolean("routing_enabled").notNull().default(false),
    redirectToWww: boolean("redirect_to_www").notNull().default(false),
    forceHttps: boolean("force_https").notNull().default(true),

    // Metadata
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_org_domains_org_id").on(table.organizationId),
    index("idx_org_domains_domain").on(table.domain),
    index("idx_org_domains_verification_status").on(table.verificationStatus),
  ]
);

export const organizationInvites = pgTable("organization_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("parent"),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  invites: many(organizationInvites),
  domains: many(organizationDomains),
}));

export const organizationInvitesRelations = relations(organizationInvites, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationInvites.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationDomainsRelations = relations(organizationDomains, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationDomains.organizationId],
    references: [organizations.id],
  }),
}));
