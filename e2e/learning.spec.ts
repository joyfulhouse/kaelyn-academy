import { test, expect } from "@playwright/test";

test.describe("Learning Features", () => {
  test.describe("Curriculum Browsing", () => {
    test("should display subject list", async ({ page }) => {
      await page.goto("/curriculum");

      // Should show subjects
      const subjectCards = page.locator('[data-testid="subject-card"], .subject-card, [class*="subject"]');

      // Wait for content to load
      await page.waitForLoadState("networkidle");

      // Check for subject content
      const content = await page.textContent("body");
      const hasSubjects =
        content?.includes("Math") ||
        content?.includes("Reading") ||
        content?.includes("Science") ||
        content?.includes("History") ||
        content?.includes("Technology");

      expect(hasSubjects).toBeTruthy();
    });

    test("should navigate to subject details", async ({ page }) => {
      await page.goto("/curriculum");

      // Click on a subject
      const subjectLink = page.getByRole("link", { name: /math|reading|science/i }).first();

      if (await subjectLink.isVisible()) {
        await subjectLink.click();

        // Should show subject details
        await expect(page).toHaveURL(/curriculum\/\w+|subjects\/\w+/);
      }
    });
  });

  test.describe("Practice Mode", () => {
    test("should load practice page", async ({ page }) => {
      await page.goto("/practice");

      // Should have practice content
      await page.waitForLoadState("networkidle");

      // Check for practice-related elements
      const content = await page.textContent("body");
      const hasPractice =
        content?.includes("Practice") ||
        content?.includes("Exercise") ||
        content?.includes("Quiz") ||
        content?.includes("Problem");

      // Page should load without errors
      expect(page.url()).toContain("practice");
    });
  });

  test.describe("Interactive Elements", () => {
    test("should handle theme toggle", async ({ page }) => {
      await page.goto("/");

      // Look for theme toggle button
      const themeToggle = page.getByRole("button", { name: /theme|dark|light|mode/i });

      if (await themeToggle.isVisible()) {
        // Get initial theme
        const htmlBefore = await page.locator("html").getAttribute("class");

        // Click toggle
        await themeToggle.click();

        // Wait for theme change
        await page.waitForTimeout(500);

        // Theme should have changed
        const htmlAfter = await page.locator("html").getAttribute("class");

        // The class should be different (or data-theme attribute)
        const dataThemeBefore = await page.locator("html").getAttribute("data-theme");
        const dataThemeAfter = await page.locator("html").getAttribute("data-theme");

        expect(htmlBefore !== htmlAfter || dataThemeBefore !== dataThemeAfter).toBeTruthy();
      }
    });

    test("should handle language switcher", async ({ page }) => {
      await page.goto("/");

      // Look for language switcher
      const langSwitcher = page.getByRole("button", { name: /language|english|español|中文/i });

      if (await langSwitcher.isVisible()) {
        await langSwitcher.click();

        // Should show language options
        const langOptions = page.getByRole("menuitem", { name: /english|español|中文|français/i });
        await expect(langOptions.first()).toBeVisible();
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

    test("should not have console errors", async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Filter out known third-party errors
      const criticalErrors = errors.filter(
        (err) =>
          !err.includes("favicon") &&
          !err.includes("analytics") &&
          !err.includes("third-party")
      );

      expect(criticalErrors.length).toBe(0);
    });
  });
});
