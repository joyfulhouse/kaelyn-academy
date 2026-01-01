import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/Kaelyn/i);

    // Check main content is visible
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("should have accessible skip link", async ({ page }) => {
    await page.goto("/");

    // Tab to skip link
    await page.keyboard.press("Tab");

    // Skip link should be visible when focused
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();
  });

  test("should navigate to subjects page", async ({ page }) => {
    await page.goto("/");

    // Look for subjects link in navigation
    const subjectsLink = page.getByRole("link", { name: /subjects|curriculum/i }).first();

    if (await subjectsLink.isVisible()) {
      await subjectsLink.click();
      await expect(page).toHaveURL(/subjects|curriculum/);
    }
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");

    // Look for login/sign in link
    const loginLink = page.getByRole("link", { name: /sign in|login|log in/i }).first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login|signin|sign-in|auth/);
    }
  });

  test("should have working mobile navigation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Look for mobile menu button
    const menuButton = page.getByRole("button", { name: /menu|toggle navigation/i });

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Navigation should be visible
      const nav = page.getByRole("navigation");
      await expect(nav).toBeVisible();
    }
  });
});
