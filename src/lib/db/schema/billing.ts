import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";

/**
 * Subscription Plans
 * Defines the available subscription tiers with their limits and features
 */
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Plan identifiers
  name: varchar("name", { length: 100 }).notNull(), // "Free", "Basic", "Premium"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // "free", "basic", "premium"
  description: text("description"),

  // Pricing (in cents)
  priceMonthly: integer("price_monthly").notNull().default(0), // Monthly price in cents
  priceYearly: integer("price_yearly").notNull().default(0), // Yearly price in cents (discounted)

  // Stripe integration
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
  stripePriceIdYearly: varchar("stripe_price_id_yearly", { length: 255 }),

  // Plan limits
  limits: jsonb("limits").$type<{
    maxLearners: number; // Maximum learners per organization
    maxTeachers: number; // Maximum teachers per organization
    maxAiRequestsPerMonth: number; // AI tutoring request limit
    maxStorageGb: number; // Storage limit in GB
    features: string[]; // List of enabled features
  }>().notNull(),

  // Display
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Organization Subscriptions
 * Tracks the subscription status for each organization
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }).unique(),
  planId: uuid("plan_id").notNull().references(() => subscriptionPlans.id),

  // Stripe subscription data
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),

  // Subscription status
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, canceled, past_due, trialing, incomplete
  billingCycle: varchar("billing_cycle", { length: 20 }).notNull().default("monthly"), // monthly, yearly

  // Dates
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Billing History / Invoices
 * Records of all billing transactions
 */
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),

  // Stripe invoice data
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),

  // Invoice details
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, open, paid, void, uncollectible
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),

  // Amounts (in cents)
  subtotal: integer("subtotal").notNull().default(0),
  tax: integer("tax").notNull().default(0),
  total: integer("total").notNull().default(0),
  amountPaid: integer("amount_paid").notNull().default(0),
  amountDue: integer("amount_due").notNull().default(0),

  // Line items
  lineItems: jsonb("line_items").$type<Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    amount: number;
  }>>(),

  // Dates
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),

  // PDF
  invoicePdfUrl: text("invoice_pdf_url"),
  hostedInvoiceUrl: text("hosted_invoice_url"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * AI Usage Tracking
 * Tracks AI API usage for billing purposes (usage-based billing)
 */
export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Usage period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),

  // Usage metrics
  totalRequests: integer("total_requests").notNull().default(0),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),

  // Cost tracking (in cents)
  estimatedCost: integer("estimated_cost").notNull().default(0),
  billedAmount: integer("billed_amount").default(0),

  // Provider breakdown
  usageByProvider: jsonb("usage_by_provider").$type<Record<string, {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>>(),

  // Feature breakdown
  usageByFeature: jsonb("usage_by_feature").$type<Record<string, {
    requests: number;
    inputTokens: number;
    outputTokens: number;
  }>>(),

  // Status
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, closed, billed

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Payment Methods
 * Stores payment method metadata (actual card data stored in Stripe)
 */
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),

  // Stripe data
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }).notNull().unique(),

  // Display info (safe to store)
  type: varchar("type", { length: 50 }).notNull().default("card"), // card, bank_account
  brand: varchar("brand", { length: 50 }), // visa, mastercard, amex, etc.
  last4: varchar("last4", { length: 4 }),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),

  // Status
  isDefault: boolean("is_default").notNull().default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Billing Webhook Events
 * Log of all Stripe webhook events for debugging and audit
 */
export const billingWebhookEvents = pgTable("billing_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Stripe event data
  stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),

  // Processing status
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processed, failed
  errorMessage: text("error_message"),

  // Event payload (for debugging)
  payload: jsonb("payload"),

  // Timestamps
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Coupon/Discount Codes
 * Promotional discounts for subscriptions
 */
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Coupon details
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),

  // Discount type
  discountType: varchar("discount_type", { length: 20 }).notNull().default("percent"), // percent, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),

  // Restrictions
  maxRedemptions: integer("max_redemptions"),
  timesRedeemed: integer("times_redeemed").notNull().default(0),
  applicablePlans: jsonb("applicable_plans").$type<string[]>(), // Plan slugs, null = all plans

  // Validity
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),

  // Stripe integration
  stripeCouponId: varchar("stripe_coupon_id", { length: 255 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Coupon Redemptions
 * Tracks which organizations have used which coupons
 */
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),

  // Discount applied (in cents)
  discountApplied: integer("discount_applied").notNull().default(0),

  // Timestamps
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
});

// Relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  invoices: many(invoices),
  couponRedemptions: many(couponRedemptions),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  organization: one(organizations, {
    fields: [invoices.organizationId],
    references: [organizations.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiUsage.organizationId],
    references: [organizations.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  organization: one(organizations, {
    fields: [paymentMethods.organizationId],
    references: [organizations.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  redemptions: many(couponRedemptions),
}));

export const couponRedemptionsRelations = relations(couponRedemptions, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponRedemptions.couponId],
    references: [coupons.id],
  }),
  organization: one(organizations, {
    fields: [couponRedemptions.organizationId],
    references: [organizations.id],
  }),
  subscription: one(subscriptions, {
    fields: [couponRedemptions.subscriptionId],
    references: [subscriptions.id],
  }),
}));
