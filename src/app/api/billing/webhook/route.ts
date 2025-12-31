import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  subscriptions,
  subscriptionPlans,
  invoices,
  paymentMethods,
  billingWebhookEvents,
} from "@/lib/db/schema/billing";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

// Type helpers for Stripe objects - handle API version differences
type StripeSubscription = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

type StripeInvoice = Stripe.Invoice & {
  subscription?: string | null;
  payment_intent?: string | null;
  tax?: number | null;
};

type StripeInvoiceLineItem = Stripe.InvoiceLineItem & {
  unit_amount_excluding_tax?: string | null;
};

/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // Verify and construct the event
  const event = constructWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Log the event - cast to unknown first for safety
  const eventPayload = event.data.object as unknown as Record<string, unknown>;
  const [webhookLog] = await db
    .insert(billingWebhookEvents)
    .values({
      stripeEventId: event.id,
      eventType: event.type,
      payload: eventPayload,
      status: "pending",
    })
    .onConflictDoNothing()
    .returning();

  try {
    // Process the event based on type
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as StripeSubscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as StripeSubscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as StripeInvoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as StripeInvoice);
        break;

      case "payment_method.attached":
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case "payment_method.detached":
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
        break;

      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    if (webhookLog) {
      await db
        .update(billingWebhookEvents)
        .set({ status: "processed", processedAt: new Date() })
        .where(eq(billingWebhookEvents.id, webhookLog.id));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Mark event as failed
    if (webhookLog) {
      await db
        .update(billingWebhookEvents)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          processedAt: new Date(),
        })
        .where(eq(billingWebhookEvents.id, webhookLog.id));
    }

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdate(subscription: StripeSubscription) {
  const organizationId = subscription.metadata?.organizationId;
  const planSlug = subscription.metadata?.planSlug;

  if (!organizationId) {
    console.error("No organizationId in subscription metadata");
    return;
  }

  // Get the plan
  const [plan] = planSlug
    ? await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, planSlug))
    : await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.stripeProductId, subscription.items.data[0]?.price.product as string));

  if (!plan) {
    console.error("Plan not found for subscription");
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  const billingCycle = plan.stripePriceIdYearly === priceId ? "yearly" : "monthly";

  // Get period dates - use type-safe access with fallback
  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : new Date();
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Upsert subscription
  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId));

  if (existingSub.length > 0) {
    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        planId: plan.id,
        status: subscription.status,
        billingCycle,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.organizationId, organizationId));
  } else {
    await db.insert(subscriptions).values({
      organizationId,
      planId: plan.id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: priceId,
      status: subscription.status,
      billingCycle,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    });
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: StripeSubscription) {
  const stripeSubscriptionId = subscription.id;

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: StripeInvoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) {
    console.error("No subscription ID in invoice");
    return;
  }

  // Get the subscription to find the organization
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  if (!sub) {
    console.error("Subscription not found for invoice");
    return;
  }

  // Upsert invoice
  const existingInvoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.stripeInvoiceId, invoice.id));

  const invoiceData = {
    organizationId: sub.organizationId,
    subscriptionId: sub.id,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: (invoice.payment_intent as string | null) ?? null,
    invoiceNumber: invoice.number,
    status: "paid" as const,
    currency: invoice.currency ?? "usd",
    subtotal: invoice.subtotal ?? 0,
    tax: invoice.tax ?? 0,
    total: invoice.total ?? 0,
    amountPaid: invoice.amount_paid ?? 0,
    amountDue: invoice.amount_due ?? 0,
    lineItems: invoice.lines?.data.map((line: StripeInvoiceLineItem) => ({
      description: line.description || "",
      quantity: line.quantity || 1,
      unitAmount: line.unit_amount_excluding_tax ? parseInt(line.unit_amount_excluding_tax) : 0,
      amount: line.amount,
    })) ?? [],
    periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
    periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
    paidAt: new Date(),
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    invoicePdfUrl: invoice.invoice_pdf,
    updatedAt: new Date(),
  };

  if (existingInvoice.length > 0) {
    await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.stripeInvoiceId, invoice.id));
  } else {
    await db.insert(invoices).values(invoiceData);
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: StripeInvoice) {
  // Update subscription status to past_due
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  await db
    .update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  // Update or create invoice record
  const existingInvoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.stripeInvoiceId, invoice.id));

  if (existingInvoice.length > 0) {
    await db
      .update(invoices)
      .set({
        status: "open",
        updatedAt: new Date(),
      })
      .where(eq(invoices.stripeInvoiceId, invoice.id));
  }
}

/**
 * Handle payment method attached
 */
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  const customerId = paymentMethod.customer as string;

  // Find the subscription with this customer
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId));

  if (!sub) {
    console.error("Subscription not found for customer");
    return;
  }

  // Check if this is the first payment method (make it default)
  const existingMethods = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.organizationId, sub.organizationId));

  const isDefault = existingMethods.length === 0;

  // Insert payment method
  await db.insert(paymentMethods).values({
    organizationId: sub.organizationId,
    stripePaymentMethodId: paymentMethod.id,
    type: paymentMethod.type,
    brand: paymentMethod.card?.brand || null,
    last4: paymentMethod.card?.last4 || null,
    expiryMonth: paymentMethod.card?.exp_month || null,
    expiryYear: paymentMethod.card?.exp_year || null,
    isDefault,
  });
}

/**
 * Handle payment method detached
 */
async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  await db
    .delete(paymentMethods)
    .where(eq(paymentMethods.stripePaymentMethodId, paymentMethod.id));
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // The subscription webhook will handle the actual subscription creation
  // This is just for logging/analytics
  console.log("Checkout completed:", session.id);

  // If there's a subscription, ensure it's processed
  if (session.subscription) {
    const stripe = getStripe();
    if (stripe) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      await handleSubscriptionUpdate(subscription as StripeSubscription);
    }
  }
}
