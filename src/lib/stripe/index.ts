import Stripe from "stripe";

/**
 * Stripe client singleton
 *
 * Uses lazy initialization to avoid issues when Stripe keys are not configured
 */

let stripeClient: Stripe | null = null;

/**
 * Get the Stripe client instance
 * @returns Stripe client or null if not configured
 */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Stripe: STRIPE_SECRET_KEY is not configured");
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
      appInfo: {
        name: "Kaelyn's Academy",
        version: "1.0.0",
        url: "https://kaelyns.academy",
      },
    });
  }

  return stripeClient;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}

/**
 * Stripe webhook signature verification
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const stripe = getStripe();
  if (!stripe) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("Stripe: STRIPE_WEBHOOK_SECRET is not configured");
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return null;
  }
}

/**
 * Format amount from cents to display currency
 */
export function formatCurrency(amountInCents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

/**
 * Convert dollars to cents for Stripe
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function toDollars(cents: number): number {
  return cents / 100;
}

export { Stripe };
