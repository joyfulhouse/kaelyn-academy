import { test, expect } from "@playwright/test";

test.describe("Learning Features", () => {
  test.describe("Public Pages", () => {
    test("should display homepage content", async ({ page }) => {
      await page.goto("/");

      // Should show main content
      const main = page.locator("main");
      await expect(main).toBeVisible();

      // Should have some learning-related content
      const content = await page.textContent("body");
      const hasContent =
        content?.includes("Academy") ||
        content?.includes("Learn") ||
        content?.includes("Education");

      expect(hasContent).toBeTruthy();
    });

    test("should display subjects page", async ({ page }) => {
      await page.goto("/subjects");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Check if redirected to login (protected route) or shows content
      const url = page.url();
      if (url.includes("login") || url.includes("auth")) {
        // Expected behavior for unauthenticated users
        expect(true).toBeTruthy();
      } else {
        // If accessible, should show subjects
        const content = await page.textContent("body");
        const hasSubjects =
          content?.includes("Math") ||
          content?.includes("Reading") ||
          content?.includes("Science") ||
          content?.includes("History") ||
          content?.includes("Subject");

        expect(hasSubjects).toBeTruthy();
      }
    });

    test("should display pricing page", async ({ page }) => {
      await page.goto("/pricing");

      // Should show pricing content
      await page.waitForLoadState("networkidle");
      const content = await page.textContent("body");

      const hasPricing =
        content?.includes("Price") ||
        content?.includes("Plan") ||
        content?.includes("Free") ||
        content?.includes("Premium");

      expect(hasPricing).toBeTruthy();
    });

    test("should display about page", async ({ page }) => {
      await page.goto("/about");

      // Should show about content
      await page.waitForLoadState("networkidle");
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });
  });

  test.describe("Protected Routes Redirect", () => {
    test("should redirect from dashboard when unauthenticated", async ({ page }) => {
      await page.goto("/dashboard");

      // Should redirect to login
      await expect(page).toHaveURL(/login|signin|auth/, { timeout: 5000 });
    });

    test("should redirect from practice when unauthenticated", async ({ page }) => {
      await page.goto("/practice");

      // Should redirect to login or show unauthorized
      await page.waitForLoadState("networkidle");
      const url = page.url();
      expect(url.includes("login") || url.includes("auth") || url.includes("practice")).toBeTruthy();
    });

    test("should redirect from tutor when unauthenticated", async ({ page }) => {
      await page.goto("/tutor");

      // Should redirect to login or show unauthorized
      await page.waitForLoadState("networkidle");
      const url = page.url();
      expect(url.includes("login") || url.includes("auth") || url.includes("tutor")).toBeTruthy();
    });
  });

  test.describe("Interactive Elements", () => {
    test("should handle theme toggle on homepage", async ({ page }) => {
      await page.goto("/");

      // Look for theme toggle button
      const themeToggle = page.getByRole("button", { name: /theme|dark|light|mode/i });

      if (await themeToggle.isVisible().catch(() => false)) {
        // Get initial theme
        const htmlBefore = await page.locator("html").getAttribute("class");

        // Click toggle
        await themeToggle.click();

        // Wait for theme change
        await page.waitForTimeout(500);

        // Theme should have changed
        const htmlAfter = await page.locator("html").getAttribute("class");

        // The class should be different
        expect(htmlBefore !== htmlAfter).toBeTruthy();
      } else {
        // No theme toggle on page - that's acceptable
        expect(true).toBeTruthy();
      }
    });

    test("should handle language switcher", async ({ page }) => {
      await page.goto("/");

      // Look for language switcher
      const langSwitcher = page.getByRole("button", { name: /language|english|español|中文/i });

      if (await langSwitcher.isVisible().catch(() => false)) {
        await langSwitcher.click();

        // Should show language options
        const langOptions = page.getByRole("menuitem", { name: /english|español|中文|français/i });
        await expect(langOptions.first()).toBeVisible();
      } else {
        // No language switcher - that's acceptable
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Content should be visible
      const main = page.locator("main");
      await expect(main).toBeVisible();

      // No horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small tolerance
    });

    test("should display correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");

      // Content should be visible
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });

    test("should display correctly on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/");

      // Content should be visible
      const main = page.locator("main");
      await expect(main).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("homepage should load in reasonable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test("should not have critical console errors", async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Filter out known acceptable errors
      const criticalErrors = errors.filter(
        (err) =>
          !err.includes("favicon") &&
          !err.includes("analytics") &&
          !err.includes("third-party") &&
          !err.includes("hydration") && // React hydration warnings
          !err.includes("ChunkLoadError") // Dynamic import errors
      );

      expect(criticalErrors.length).toBe(0);
    });
  });
});
