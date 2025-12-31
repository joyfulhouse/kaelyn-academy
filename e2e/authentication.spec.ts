import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test("should display OAuth login options", async ({ page }) => {
      await page.goto("/login");

      // Should have welcome heading
      await expect(page.getByText("Welcome to Kaelyn's Academy")).toBeVisible();

      // Should have OAuth provider buttons (wait for providers to load)
      await page.waitForTimeout(2000); // Wait for provider fetch

      // Check for provider buttons or dev login buttons
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test("should display terms and privacy links", async ({ page }) => {
      await page.goto("/login");

      // Should have terms link
      const termsLink = page.getByRole("link", { name: /terms/i });
      await expect(termsLink).toBeVisible();

      // Should have privacy link
      const privacyLink = page.getByRole("link", { name: /privacy/i });
      await expect(privacyLink).toBeVisible();
    });

    test("should display support link", async ({ page }) => {
      await page.goto("/login");

      // Should have support link
      const supportLink = page.getByRole("link", { name: /support/i });
      await expect(supportLink).toBeVisible();
    });

    test("should show error message when error param is present", async ({ page }) => {
      await page.goto("/login?error=OAuthSignin");

      // Should show error alert
      const errorText = page.getByText(/error|try again/i);
      await expect(errorText).toBeVisible();
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated users from dashboard", async ({ page }) => {
      await page.goto("/dashboard");

      // Should redirect to login or show login prompt
      await expect(page).toHaveURL(/login|signin|auth/);
    });

    test("should redirect unauthenticated users from admin", async ({ page }) => {
      await page.goto("/admin");

      // Should redirect to login or show 403
      const url = page.url();
      expect(url.includes("login") || url.includes("signin") || url.includes("403") || url.includes("unauthorized")).toBeTruthy();
    });

    test("should redirect unauthenticated users from teacher dashboard", async ({ page }) => {
      await page.goto("/teacher");

      // Should redirect to login
      await expect(page).toHaveURL(/login|signin|auth/);
    });

    test("should redirect unauthenticated users from parent dashboard", async ({ page }) => {
      await page.goto("/parent");

      // Should redirect to login
      await expect(page).toHaveURL(/login|signin|auth/);
    });
  });

  test.describe("Auth Error Page", () => {
    test("should display error page with message", async ({ page }) => {
      await page.goto("/auth/error");

      // Should show some error indication - CardTitle renders as h3 or div
      const errorContent = page.getByText(/error|problem|try again/i);
      await expect(errorContent.first()).toBeVisible();
    });
  });
});
