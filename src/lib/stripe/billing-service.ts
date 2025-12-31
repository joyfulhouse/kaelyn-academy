import { db } from "@/lib/db";
import {
  subscriptions,
  subscriptionPlans,
  invoices,
  paymentMethods,
  aiUsage,
  coupons,
  couponRedemptions,
} from "@/lib/db/schema/billing";
import { organizations } from "@/lib/db/schema/organizations";
import { getStripe, formatCurrency } from "./index";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

/**
 * Billing Service
 * Handles all subscription and billing operations
 */

// ============================================================================
// Plan Management
// ============================================================================

export interface PlanWithLimits {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  limits: {
    maxLearners: number;
    maxTeachers: number;
    maxAiRequestsPerMonth: number;
    maxStorageGb: number;
    features: string[];
  };
  isPopular: boolean;
  displayOrder: number;
}

/**
 * Get all active subscription plans
 */
export async function getActivePlans(): Promise<PlanWithLimits[]> {
  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.displayOrder);

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    limits: plan.limits,
    isPopular: plan.isPopular,
    displayOrder: plan.displayOrder,
  }));
}

/**
 * Get a plan by slug
 */
export async function getPlanBySlug(slug: string): Promise<PlanWithLimits | null> {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.slug, slug));

  if (!plan) return null;

  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    priceYearly: plan.priceYearly,
    limits: plan.limits,
    isPopular: plan.isPopular,
    displayOrder: plan.displayOrder,
  };
}

// ============================================================================
// Subscription Management
// ============================================================================

export interface SubscriptionInfo {
  id: string;
  organizationId: string;
  plan: PlanWithLimits;
  status: string;
  billingCycle: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
}

/**
 * Get organization subscription
 */
export async function getOrganizationSubscription(
  organizationId: string
): Promise<SubscriptionInfo | null> {
  const [subscription] = await db
    .select({
      id: subscriptions.id,
      organizationId: subscriptions.organizationId,
      status: subscriptions.status,
      billingCycle: subscriptions.billingCycle,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      plan: {
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        slug: subscriptionPlans.slug,
        description: subscriptionPlans.description,
        priceMonthly: subscriptionPlans.priceMonthly,
        priceYearly: subscriptionPlans.priceYearly,
        limits: subscriptionPlans.limits,
        isPopular: subscriptionPlans.isPopular,
        displayOrder: subscriptionPlans.displayOrder,
      },
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.organizationId, organizationId));

  if (!subscription) return null;

  return {
    id: subscription.id,
    organizationId: subscription.organizationId,
    plan: subscription.plan,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
  };
}

/**
 * Create or update a subscription for an organization
 */
export async function upsertSubscription(
  organizationId: string,
  planSlug: string,
  billingCycle: "monthly" | "yearly" = "monthly"
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    // Get the plan
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.slug, planSlug));

    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // Check if subscription exists
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId));

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));

    if (existing) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          planId: plan.id,
          billingCycle,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existing.id));

      return { success: true, subscriptionId: existing.id };
    } else {
      // Create new subscription
      const [newSub] = await db
        .insert(subscriptions)
        .values({
          organizationId,
          planId: plan.id,
          billingCycle,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        })
        .returning();

      return { success: true, subscriptionId: newSub.id };
    }
  } catch (error) {
    console.error("Error upserting subscription:", error);
    return { success: false, error: "Failed to update subscription" };
  }
}

// ============================================================================
// Stripe Checkout
// ============================================================================

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  organizationId: string,
  planSlug: string,
  billingCycle: "monthly" | "yearly",
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionUrl: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured" };
  }

  try {
    // Get the plan
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.slug, planSlug));

    if (!plan) {
      return { error: "Plan not found" };
    }

    const priceId = billingCycle === "yearly"
      ? plan.stripePriceIdYearly
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      return { error: "Stripe price not configured for this plan" };
    }

    // Get or create Stripe customer
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!org) {
      return { error: "Organization not found" };
    }

    // Get existing subscription to check for Stripe customer
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId));

    let customerId = existingSub?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: org.name,
        metadata: {
          organizationId,
          organizationSlug: org.slug,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId,
        planSlug,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          organizationId,
          planSlug,
        },
      },
    });

    return { sessionUrl: session.url || cancelUrl };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: "Failed to create checkout session" };
  }
}

/**
 * Create a Stripe billing portal session
 */
export async function createPortalSession(
  organizationId: string,
  returnUrl: string
): Promise<{ portalUrl: string } | { error: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured" };
  }

  try {
    // Get subscription with customer ID
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId));

    if (!subscription?.stripeCustomerId) {
      return { error: "No billing account found" };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return { portalUrl: session.url };
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error: "Failed to create portal session" };
  }
}

// ============================================================================
// Invoice Management
// ============================================================================

export interface InvoiceInfo {
  id: string;
  invoiceNumber: string | null;
  status: string;
  total: number;
  totalFormatted: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  paidAt: Date | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
}

/**
 * Get organization invoices
 */
export async function getOrganizationInvoices(
  organizationId: string,
  limit = 10
): Promise<InvoiceInfo[]> {
  const results = await db
    .select()
    .from(invoices)
    .where(eq(invoices.organizationId, organizationId))
    .orderBy(desc(invoices.createdAt))
    .limit(limit);

  return results.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    total: inv.total,
    totalFormatted: formatCurrency(inv.total, inv.currency),
    periodStart: inv.periodStart,
    periodEnd: inv.periodEnd,
    paidAt: inv.paidAt,
    hostedInvoiceUrl: inv.hostedInvoiceUrl,
    invoicePdfUrl: inv.invoicePdfUrl,
  }));
}

// ============================================================================
// AI Usage Tracking
// ============================================================================

export interface UsageInfo {
  periodStart: Date;
  periodEnd: Date;
  totalRequests: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  estimatedCostFormatted: string;
  limitUsedPercent: number;
}

/**
 * Get current period AI usage for organization
 */
export async function getCurrentAiUsage(
  organizationId: string
): Promise<UsageInfo | null> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [usage] = await db
    .select()
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.organizationId, organizationId),
        gte(aiUsage.periodStart, startOfMonth),
        lte(aiUsage.periodEnd, endOfMonth)
      )
    );

  if (!usage) {
    return null;
  }

  // Get subscription to calculate limit percent
  const subscription = await getOrganizationSubscription(organizationId);
  const limit = subscription?.plan.limits.maxAiRequestsPerMonth || 1000;
  const limitUsedPercent = Math.min(100, (usage.totalRequests / limit) * 100);

  return {
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
    totalRequests: usage.totalRequests,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    estimatedCost: usage.estimatedCost,
    estimatedCostFormatted: formatCurrency(usage.estimatedCost),
    limitUsedPercent,
  };
}

/**
 * Track AI usage for an organization
 */
export async function trackAiUsage(
  organizationId: string,
  inputTokens: number,
  outputTokens: number,
  provider: string,
  feature: string
): Promise<void> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Estimate cost (simplified pricing)
  const inputCostPer1k = 0.015; // $0.015 per 1k input tokens
  const outputCostPer1k = 0.06; // $0.06 per 1k output tokens
  const estimatedCost = Math.round(
    ((inputTokens / 1000) * inputCostPer1k + (outputTokens / 1000) * outputCostPer1k) * 100
  ); // In cents

  // Try to update existing record
  const [existing] = await db
    .select()
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.organizationId, organizationId),
        gte(aiUsage.periodStart, startOfMonth),
        lte(aiUsage.periodEnd, endOfMonth),
        eq(aiUsage.status, "active")
      )
    );

  if (existing) {
    // Update existing usage record
    const currentByProvider = existing.usageByProvider || {};
    const currentByFeature = existing.usageByFeature || {};

    // Update provider breakdown
    if (!currentByProvider[provider]) {
      currentByProvider[provider] = { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
    }
    currentByProvider[provider].requests += 1;
    currentByProvider[provider].inputTokens += inputTokens;
    currentByProvider[provider].outputTokens += outputTokens;
    currentByProvider[provider].cost += estimatedCost;

    // Update feature breakdown
    if (!currentByFeature[feature]) {
      currentByFeature[feature] = { requests: 0, inputTokens: 0, outputTokens: 0 };
    }
    currentByFeature[feature].requests += 1;
    currentByFeature[feature].inputTokens += inputTokens;
    currentByFeature[feature].outputTokens += outputTokens;

    await db
      .update(aiUsage)
      .set({
        totalRequests: existing.totalRequests + 1,
        inputTokens: existing.inputTokens + inputTokens,
        outputTokens: existing.outputTokens + outputTokens,
        estimatedCost: existing.estimatedCost + estimatedCost,
        usageByProvider: currentByProvider,
        usageByFeature: currentByFeature,
        updatedAt: now,
      })
      .where(eq(aiUsage.id, existing.id));
  } else {
    // Create new usage record
    await db.insert(aiUsage).values({
      organizationId,
      periodStart: startOfMonth,
      periodEnd: endOfMonth,
      totalRequests: 1,
      inputTokens,
      outputTokens,
      estimatedCost,
      usageByProvider: {
        [provider]: { requests: 1, inputTokens, outputTokens, cost: estimatedCost },
      },
      usageByFeature: {
        [feature]: { requests: 1, inputTokens, outputTokens },
      },
      status: "active",
    });
  }
}

/**
 * Check if organization has exceeded AI usage limit
 */
export async function checkAiUsageLimit(organizationId: string): Promise<{
  withinLimit: boolean;
  used: number;
  limit: number;
  percentUsed: number;
}> {
  const subscription = await getOrganizationSubscription(organizationId);
  const limit = subscription?.plan.limits.maxAiRequestsPerMonth || 100; // Default free tier

  const usage = await getCurrentAiUsage(organizationId);
  const used = usage?.totalRequests || 0;

  return {
    withinLimit: used < limit,
    used,
    limit,
    percentUsed: Math.min(100, (used / limit) * 100),
  };
}

// ============================================================================
// Payment Methods
// ============================================================================

/**
 * Get organization payment methods
 */
export async function getPaymentMethods(
  organizationId: string
): Promise<Array<{
  id: string;
  type: string;
  brand: string | null;
  last4: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean;
}>> {
  const methods = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.organizationId, organizationId))
    .orderBy(desc(paymentMethods.isDefault));

  return methods.map((m) => ({
    id: m.id,
    type: m.type,
    brand: m.brand,
    last4: m.last4,
    expiryMonth: m.expiryMonth,
    expiryYear: m.expiryYear,
    isDefault: m.isDefault,
  }));
}

// ============================================================================
// Coupon Management
// ============================================================================

/**
 * Validate and apply a coupon code
 */
export async function applyCoupon(
  code: string,
  organizationId: string,
  planSlug: string
): Promise<{ valid: boolean; discount?: number; discountType?: string; error?: string }> {
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)));

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  const now = new Date();

  // Check validity period
  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, error: "Coupon is not yet active" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, error: "Coupon has expired" };
  }

  // Check redemption limit
  if (coupon.maxRedemptions && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { valid: false, error: "Coupon redemption limit reached" };
  }

  // Check applicable plans
  if (coupon.applicablePlans && !coupon.applicablePlans.includes(planSlug)) {
    return { valid: false, error: "Coupon not valid for this plan" };
  }

  // Check if already redeemed by this organization
  const [existingRedemption] = await db
    .select()
    .from(couponRedemptions)
    .where(
      and(
        eq(couponRedemptions.couponId, coupon.id),
        eq(couponRedemptions.organizationId, organizationId)
      )
    );

  if (existingRedemption) {
    return { valid: false, error: "Coupon already used" };
  }

  return {
    valid: true,
    discount: Number(coupon.discountValue),
    discountType: coupon.discountType,
  };
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Get billing stats for admin dashboard
 */
export async function getBillingStats(): Promise<{
  totalRevenue: number;
  totalRevenueFormatted: string;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialSubscriptions: number;
  planBreakdown: Record<string, number>;
}> {
  // Get subscription counts by status
  const statusCounts = await db
    .select({
      status: subscriptions.status,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .groupBy(subscriptions.status);

  const active = statusCounts.find((s) => s.status === "active")?.count || 0;
  const canceled = statusCounts.find((s) => s.status === "canceled")?.count || 0;
  const trialing = statusCounts.find((s) => s.status === "trialing")?.count || 0;

  // Get plan breakdown
  const planCounts = await db
    .select({
      planName: subscriptionPlans.name,
      count: sql<number>`count(*)::int`,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptionPlans.name);

  const planBreakdown: Record<string, number> = {};
  for (const p of planCounts) {
    planBreakdown[p.planName] = p.count;
  }

  // Get total revenue from paid invoices
  const [revenue] = await db
    .select({
      total: sql<number>`coalesce(sum(${invoices.amountPaid}), 0)::int`,
    })
    .from(invoices)
    .where(eq(invoices.status, "paid"));

  return {
    totalRevenue: revenue?.total || 0,
    totalRevenueFormatted: formatCurrency(revenue?.total || 0),
    activeSubscriptions: active,
    canceledSubscriptions: canceled,
    trialSubscriptions: trialing,
    planBreakdown,
  };
}

/**
 * Get all subscriptions with organization info (for admin)
 */
export async function getAllSubscriptions(
  limit = 50,
  offset = 0
): Promise<{
  subscriptions: Array<{
    id: string;
    organizationName: string;
    organizationSlug: string;
    planName: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }>;
  total: number;
}> {
  const results = await db
    .select({
      id: subscriptions.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      planName: subscriptionPlans.name,
      status: subscriptions.status,
      billingCycle: subscriptions.billingCycle,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(subscriptions)
    .innerJoin(organizations, eq(subscriptions.organizationId, organizations.id))
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptions);

  return {
    subscriptions: results,
    total: countResult?.count || 0,
  };
}
