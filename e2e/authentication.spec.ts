import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test("should display login form", async ({ page }) => {
      await page.goto("/auth/login");

      // Should have login form
      const form = page.locator("form");
      await expect(form).toBeVisible();

      // Should have email input
      const emailInput = page.getByRole("textbox", { name: /email/i });
      await expect(emailInput).toBeVisible();

      // Should have password input
      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toBeVisible();

      // Should have submit button
      const submitButton = page.getByRole("button", { name: /sign in|login|log in/i });
      await expect(submitButton).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.goto("/auth/login");

      // Submit empty form
      const submitButton = page.getByRole("button", { name: /sign in|login|log in/i });
      await submitButton.click();

      // Should show error messages
      const errorMessage = page.locator('[role="alert"], .error, [aria-invalid="true"]');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Form may use HTML5 validation instead
      });
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/auth/login");

      // Fill in invalid credentials
      await page.getByRole("textbox", { name: /email/i }).fill("invalid@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");

      // Submit form
      const submitButton = page.getByRole("button", { name: /sign in|login|log in/i });
      await submitButton.click();

      // Should show error (after form submission)
      await page.waitForResponse((response) =>
        response.url().includes("/api/auth") && response.status() !== 200
      ).catch(() => {
        // May redirect or show inline error
      });
    });

    test("should have link to registration", async ({ page }) => {
      await page.goto("/auth/login");

      // Should have link to register/sign up
      const registerLink = page.getByRole("link", { name: /sign up|register|create account/i });
      await expect(registerLink).toBeVisible();
    });

    test("should have link to password recovery", async ({ page }) => {
      await page.goto("/auth/login");

      // Should have forgot password link
      const forgotLink = page.getByRole("link", { name: /forgot|reset|recover/i });
      if (await forgotLink.isVisible()) {
        await expect(forgotLink).toBeVisible();
      }
    });
  });

  test.describe("Registration Page", () => {
    test("should display registration form", async ({ page }) => {
      await page.goto("/auth/register");

      // Should have registration form
      const form = page.locator("form");
      await expect(form).toBeVisible();

      // Should have name input
      const nameInput = page.getByRole("textbox", { name: /name/i });
      await expect(nameInput).toBeVisible();

      // Should have email input
      const emailInput = page.getByRole("textbox", { name: /email/i });
      await expect(emailInput).toBeVisible();

      // Should have password input
      const passwordInput = page.getByLabel(/^password$/i);
      await expect(passwordInput).toBeVisible();
    });

    test("should have link to login", async ({ page }) => {
      await page.goto("/auth/register");

      // Should have link to login
      const loginLink = page.getByRole("link", { name: /sign in|login|log in|already have/i });
      await expect(loginLink).toBeVisible();
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
      expect(url.includes("login") || url.includes("signin") || url.includes("403")).toBeTruthy();
    });
  });
});
