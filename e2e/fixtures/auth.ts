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
 *
 * The login page has dev role buttons labeled "Learner", "Parent", "Teacher", "Admin"
 * Each button sets the dev-oauth-role cookie and submits the OAuth form
 */
async function authenticateAs(page: Page, persona: Persona): Promise<void> {
  // Navigate to login page
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Wait for providers to load (the login page fetches providers async)
  await page.waitForSelector('[class*="grid-cols-2"]', { timeout: 5000 }).catch(() => {
    // Grid might not appear if dev oauth isn't enabled
  });

  // Map persona to button label (capitalize first letter)
  const buttonLabel = persona.charAt(0).toUpperCase() + persona.slice(1);

  // Look for the dev role button by its label text
  // The buttons contain the role name as a span with font-medium class
  const devRoleButton = page.locator(`button:has-text("${buttonLabel}")`).first();

  if (await devRoleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Click the role button - it sets the cookie and submits the form
    await devRoleButton.click();
  } else {
    // Fallback: set cookie manually and navigate through OAuth flow
    await page.context().addCookies([
      {
        name: "dev-oauth-role",
        value: persona,
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/api/auth/signin/dev-oauth");
  }

  // Wait for OAuth redirect flow to complete
  await page.waitForLoadState("networkidle");

  // Wait for authentication to complete (should redirect away from login)
  await page.waitForFunction(
    () => !window.location.href.includes("/login") && !window.location.href.includes("/auth/signin"),
    { timeout: 10000 }
  ).catch(() => {
    // If still on login, auth may have failed
  });
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
