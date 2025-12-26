/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

import { z } from "zod";

// Server-side environment schema
const serverEnvSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth.js (required)
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),

  // OAuth providers (optional)
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_FACEBOOK_ID: z.string().optional(),
  AUTH_FACEBOOK_SECRET: z.string().optional(),
  AUTH_APPLE_ID: z.string().optional(),
  AUTH_APPLE_SECRET: z.string().optional(),
  AUTH_MICROSOFT_ENTRA_ID: z.string().optional(),
  AUTH_MICROSOFT_ENTRA_SECRET: z.string().optional(),

  // AI providers (at least one required for AI features)
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Client-side environment schema (exposed via NEXT_PUBLIC_*)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Kaelyn's Academy"),
  NEXT_PUBLIC_APP_DOMAIN: z.string().default("localhost"),
});

// Type definitions
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// Validation function for server environment
function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables. See console for details.");
  }

  // Warn if no AI provider is configured
  const env = parsed.data;
  if (!env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY && !env.GOOGLE_AI_API_KEY) {
    console.warn("Warning: No AI provider API key configured. AI features will not work.");
  }

  return env;
}

// Validation function for client environment
function validateClientEnv(): ClientEnv {
  const clientVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
  };

  const parsed = clientEnvSchema.safeParse(clientVars);

  if (!parsed.success) {
    console.error("Invalid client environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables.");
  }

  return parsed.data;
}

// Export validated environment
// Only validate on server (process.env is available)
export const serverEnv = typeof window === "undefined" ? validateServerEnv() : ({} as ServerEnv);
export const clientEnv = validateClientEnv();

// Helper to check if a specific AI provider is configured
export function isAIProviderConfigured(provider: "anthropic" | "openai" | "google"): boolean {
  if (typeof window !== "undefined") return false; // Can't check on client

  switch (provider) {
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "google":
      return !!process.env.GOOGLE_AI_API_KEY;
    default:
      return false;
  }
}

// Helper to get the best available AI provider
export function getBestAIProvider(): "anthropic" | "openai" | "google" | null {
  if (isAIProviderConfigured("anthropic")) return "anthropic";
  if (isAIProviderConfigured("openai")) return "openai";
  if (isAIProviderConfigured("google")) return "google";
  return null;
}
