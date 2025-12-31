/**
 * Seed default subscription plans
 *
 * Run with: bun run src/lib/db/seeds/subscription-plans.ts
 */

import { config } from "dotenv";
config();

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { subscriptionPlans } from "../schema/billing";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const defaultPlans = [
  {
    name: "Free",
    slug: "free",
    description: "Perfect for trying out Kaelyn's Academy",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      maxLearners: 2,
      maxTeachers: 1,
      maxAiRequestsPerMonth: 100,
      maxStorageGb: 1,
      features: ["basic_curriculum", "progress_tracking"],
    },
    displayOrder: 0,
    isActive: true,
    isPopular: false,
  },
  {
    name: "Basic",
    slug: "basic",
    description: "Great for families with multiple children",
    priceMonthly: 999, // $9.99
    priceYearly: 9588, // $95.88 (20% off)
    limits: {
      maxLearners: 5,
      maxTeachers: 2,
      maxAiRequestsPerMonth: 1000,
      maxStorageGb: 5,
      features: [
        "basic_curriculum",
        "progress_tracking",
        "ai_tutoring",
        "adaptive_learning",
        "parent_dashboard",
      ],
    },
    displayOrder: 1,
    isActive: true,
    isPopular: true,
  },
  {
    name: "Premium",
    slug: "premium",
    description: "Best for schools and power users",
    priceMonthly: 2999, // $29.99
    priceYearly: 28788, // $287.88 (20% off)
    limits: {
      maxLearners: 50,
      maxTeachers: 10,
      maxAiRequestsPerMonth: 10000,
      maxStorageGb: 50,
      features: [
        "basic_curriculum",
        "progress_tracking",
        "ai_tutoring",
        "adaptive_learning",
        "parent_dashboard",
        "teacher_dashboard",
        "classroom_management",
        "advanced_analytics",
        "custom_content",
        "priority_support",
      ],
    },
    displayOrder: 2,
    isActive: true,
    isPopular: false,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom solutions for districts and large organizations",
    priceMonthly: 9999, // $99.99 (placeholder - custom pricing)
    priceYearly: 95988, // $959.88 (20% off)
    limits: {
      maxLearners: 1000,
      maxTeachers: 100,
      maxAiRequestsPerMonth: 100000,
      maxStorageGb: 500,
      features: [
        "basic_curriculum",
        "progress_tracking",
        "ai_tutoring",
        "adaptive_learning",
        "parent_dashboard",
        "teacher_dashboard",
        "classroom_management",
        "advanced_analytics",
        "custom_content",
        "priority_support",
        "white_label",
        "sso",
        "api_access",
        "dedicated_support",
      ],
    },
    displayOrder: 3,
    isActive: true,
    isPopular: false,
  },
];

async function seed() {
  console.log("Seeding subscription plans...");

  for (const plan of defaultPlans) {
    try {
      await db
        .insert(subscriptionPlans)
        .values(plan)
        .onConflictDoUpdate({
          target: subscriptionPlans.slug,
          set: {
            name: plan.name,
            description: plan.description,
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            limits: plan.limits,
            displayOrder: plan.displayOrder,
            isActive: plan.isActive,
            isPopular: plan.isPopular,
            updatedAt: new Date(),
          },
        });
      console.log(`  - ${plan.name} plan created/updated`);
    } catch (error) {
      console.error(`  - Error creating ${plan.name} plan:`, error);
    }
  }

  console.log("Done seeding subscription plans!");
}

seed().catch(console.error);
