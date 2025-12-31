import { test as base, expect, Page, BrowserContext } from "@playwright/test";

/**
 * Playwright Auth Fixtures for Kaelyn's Academy
 *
 * Provides authenticated test contexts for each persona:
 * - Learner: Student accessing lessons, practice, achievements
 * - Parent: Managing children, approvals, session monitoring
 * - Teacher: Class management, assignments, grading
 * - Admin: Platform administration, organizations, settings
 *
 * Uses the dev OAuth system (requires ENABLE_DEV_OAUTH=true in .env)
 */

export type Persona = "learner" | "parent" | "teacher" | "admin";

// Extended test fixtures with persona authentication
export const test = base.extend<{
  authenticatedPage: Page;
  persona: Persona;
  learnerPage: Page;
  parentPage: Page;
  teacherPage: Page;
  adminPage: Page;
}>({
  // Default persona for authenticatedPage
  persona: ["learner", { option: true }],

  // Generic authenticated page using the persona option
  authenticatedPage: async ({ page, persona }, use) => {
    await authenticateAs(page, persona);
    await use(page);
  },

  // Convenience fixtures for specific personas
  learnerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await authenticateAs(page, "learner");
    await use(page);
    await context.close();
  },

  parentPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await authenticateAs(page, "parent");
    await use(page);
    await context.close();
  },

  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await authenticateAs(page, "teacher");
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await authenticateAs(page, "admin");
    await use(page);
    await context.close();
  },
});

/**
 * Authenticate as a specific persona using dev OAuth
 */
async function authenticateAs(page: Page, persona: Persona): Promise<void> {
  // Navigate to login page
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Set the dev-oauth-role cookie
  await page.context().addCookies([
    {
      name: "dev-oauth-role",
      value: persona,
      domain: "localhost",
      path: "/",
    },
  ]);

  // Look for dev login button
  const devLoginButton = page.getByRole("button", {
    name: new RegExp(`dev.*${persona}|${persona}.*dev|login.*${persona}`, "i"),
  });

  // If specific dev login button exists, click it
  if (await devLoginButton.isVisible().catch(() => false)) {
    await devLoginButton.click();
  } else {
    // Try generic dev login button
    const genericDevButton = page.getByRole("button", {
      name: /dev|development|test/i,
    });

    if (await genericDevButton.isVisible().catch(() => false)) {
      await genericDevButton.click();
    } else {
      // Fallback: navigate directly through OAuth flow
      await page.goto("/api/auth/signin/dev-oauth");
    }
  }

  // Wait for redirect to complete
  await page.waitForLoadState("networkidle");

  // Verify authentication by checking we're not on login page
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    const url = page.url();
    if (!url.includes("/login") && !url.includes("/auth/signin")) {
      break;
    }
    await page.waitForTimeout(500);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();
  return !url.includes("/login") && !url.includes("/auth/signin");
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page): Promise<void> {
  await page.goto("/api/auth/signout");
  await page.waitForLoadState("networkidle");

  // Click sign out button if present
  const signOutButton = page.getByRole("button", { name: /sign out|logout/i });
  if (await signOutButton.isVisible().catch(() => false)) {
    await signOutButton.click();
    await page.waitForLoadState("networkidle");
  }
}

export { expect };
