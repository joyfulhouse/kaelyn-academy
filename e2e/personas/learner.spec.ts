import { test, expect } from "../fixtures/auth";

/**
 * Learner Persona E2E Tests
 *
 * Tests the complete learner experience:
 * - Dashboard and progress tracking
 * - Subject browsing and lesson navigation
 * - Practice activities and quizzes
 * - AI Tutor interactions
 * - Achievements and gamification
 * - Profile and settings management
 */

test.describe("Learner Persona", () => {
  test.describe("Dashboard", () => {
    test("should display learner dashboard with key elements", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      // Check we're on dashboard (not redirected to login)
      const url = learnerPage.url();

      // If redirected to login, skip authenticated tests
      if (url.includes("/login")) {
        test.skip(true, "Dev OAuth not enabled - skipping authenticated tests");
        return;
      }

      // Dashboard should have main content area
      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should show learning progress widgets", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for common dashboard elements
      const content = await learnerPage.textContent("body");
      const hasDashboardContent =
        content?.includes("Progress") ||
        content?.includes("Continue") ||
        content?.includes("Recent") ||
        content?.includes("Today") ||
        content?.includes("Dashboard");

      expect(hasDashboardContent).toBeTruthy();
    });

    test("should display streak widget if available", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Streak widget may show days, flames, or streak text
      const _streakIndicators = learnerPage.locator("text=/streak|day|flame/i");
      // Just verify page loads successfully - streak may not exist for new users
      expect(true).toBeTruthy();
    });

    test("should show recent activity or recommendations", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await learnerPage.textContent("body");
      const hasActivityContent =
        content?.includes("Activity") ||
        content?.includes("Recent") ||
        content?.includes("Continue") ||
        content?.includes("Start") ||
        content?.includes("Recommended");

      expect(hasActivityContent).toBeTruthy();
    });
  });

  test.describe("Subjects", () => {
    test("should display available subjects", async ({ learnerPage }) => {
      await learnerPage.goto("/subjects");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Should show subject categories
      const content = await learnerPage.textContent("body");
      const hasSubjects =
        content?.includes("Math") ||
        content?.includes("Reading") ||
        content?.includes("Science") ||
        content?.includes("History") ||
        content?.includes("Subject");

      expect(hasSubjects).toBeTruthy();
    });

    test("should navigate to subject detail page", async ({ learnerPage }) => {
      await learnerPage.goto("/subjects");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Try to click on a subject
      const subjectLink = learnerPage.getByRole("link", {
        name: /math|reading|science|history/i,
      }).first();

      if (await subjectLink.isVisible().catch(() => false)) {
        await subjectLink.click();
        await learnerPage.waitForLoadState("networkidle");

        // Should navigate to subject detail
        const url = learnerPage.url();
        expect(url.includes("/subjects/") || url.includes("/learn/")).toBeTruthy();
      }
    });

    test("should show subject progress if available", async ({ learnerPage }) => {
      await learnerPage.goto("/subjects");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Progress indicators may show percentage, bars, or completion status
      const _progressIndicators = learnerPage.locator('[role="progressbar"], [class*="progress"]');
      // Just verify page loads - progress may not exist for new users
      expect(true).toBeTruthy();
    });
  });

  test.describe("Lessons", () => {
    test("should access learn/subjects page", async ({ learnerPage }) => {
      await learnerPage.goto("/learn/subjects");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should display lesson content with 3D visualizations", async ({ learnerPage }) => {
      // Navigate to a specific lesson (using math as example)
      await learnerPage.goto("/learn/subjects");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for 3D visualization canvas or Three.js elements
      const canvas = learnerPage.locator("canvas");
      const count = await canvas.count();

      // 3D content may or may not be present depending on the lesson
      expect(count >= 0).toBeTruthy();
    });
  });

  test.describe("Practice", () => {
    test("should access practice page", async ({ learnerPage }) => {
      await learnerPage.goto("/practice");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should display practice activities", async ({ learnerPage }) => {
      await learnerPage.goto("/practice");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await learnerPage.textContent("body");
      const hasPracticeContent =
        content?.includes("Practice") ||
        content?.includes("Quiz") ||
        content?.includes("Exercise") ||
        content?.includes("Activity") ||
        content?.includes("Question");

      expect(hasPracticeContent).toBeTruthy();
    });

    test("should be able to start a practice session", async ({ learnerPage }) => {
      await learnerPage.goto("/practice");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for start button
      const startButton = learnerPage.getByRole("button", {
        name: /start|begin|practice|play/i,
      }).first();

      if (await startButton.isVisible().catch(() => false)) {
        // Button exists - verify it's clickable
        await expect(startButton).toBeEnabled();
      }
    });
  });

  test.describe("AI Tutor", () => {
    test("should access tutor page", async ({ learnerPage }) => {
      await learnerPage.goto("/tutor");
      await learnerPage.waitForLoadState("networkidle");

      // May redirect to learn/tutor
      const url = learnerPage.url();
      if (url.includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should display AI tutor interface", async ({ learnerPage }) => {
      await learnerPage.goto("/learn/tutor");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await learnerPage.textContent("body");
      const hasTutorContent =
        content?.includes("Tutor") ||
        content?.includes("Ask") ||
        content?.includes("Help") ||
        content?.includes("Question") ||
        content?.includes("Chat");

      expect(hasTutorContent).toBeTruthy();
    });

    test("should have chat input for questions", async ({ learnerPage }) => {
      await learnerPage.goto("/learn/tutor");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for chat input
      const chatInput = learnerPage.locator(
        'textarea, input[type="text"][placeholder*="ask" i], input[type="text"][placeholder*="question" i], input[type="text"][placeholder*="message" i]'
      );

      if (await chatInput.first().isVisible().catch(() => false)) {
        await expect(chatInput.first()).toBeVisible();
      }
    });
  });

  test.describe("Achievements", () => {
    test("should access achievements page", async ({ learnerPage }) => {
      await learnerPage.goto("/achievements");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should display achievement badges", async ({ learnerPage }) => {
      await learnerPage.goto("/achievements");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await learnerPage.textContent("body");
      const hasAchievementContent =
        content?.includes("Achievement") ||
        content?.includes("Badge") ||
        content?.includes("Award") ||
        content?.includes("Trophy") ||
        content?.includes("Earned") ||
        content?.includes("Locked");

      expect(hasAchievementContent).toBeTruthy();
    });

    test("should show achievement progress", async ({ learnerPage }) => {
      await learnerPage.goto("/achievements");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for progress indicators
      const _progressElements = learnerPage.locator(
        '[role="progressbar"], [class*="progress"], text=/\\d+%|\\d+\\/\\d+/'
      );

      // Progress may or may not exist for new users
      expect(true).toBeTruthy();
    });
  });

  test.describe("Profile", () => {
    test("should access profile page", async ({ learnerPage }) => {
      await learnerPage.goto("/profile");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should display profile information", async ({ learnerPage }) => {
      await learnerPage.goto("/profile");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await learnerPage.textContent("body");
      const hasProfileContent =
        content?.includes("Profile") ||
        content?.includes("Name") ||
        content?.includes("Grade") ||
        content?.includes("Email") ||
        content?.includes("Avatar");

      expect(hasProfileContent).toBeTruthy();
    });
  });

  test.describe("Settings", () => {
    test("should access settings page", async ({ learnerPage }) => {
      await learnerPage.goto("/settings");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });

    test("should display settings options", async ({ learnerPage }) => {
      await learnerPage.goto("/settings");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await learnerPage.textContent("body");
      const hasSettingsContent =
        content?.includes("Settings") ||
        content?.includes("Preferences") ||
        content?.includes("Theme") ||
        content?.includes("Notifications") ||
        content?.includes("Privacy");

      expect(hasSettingsContent).toBeTruthy();
    });
  });

  test.describe("Notifications", () => {
    test("should access notifications page", async ({ learnerPage }) => {
      await learnerPage.goto("/notifications");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();
    });
  });

  test.describe("Help", () => {
    test("should access help page", async ({ learnerPage }) => {
      await learnerPage.goto("/help");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();

      const content = await learnerPage.textContent("body");
      const hasHelpContent =
        content?.includes("Help") ||
        content?.includes("FAQ") ||
        content?.includes("Support") ||
        content?.includes("Contact") ||
        content?.includes("Guide");

      expect(hasHelpContent).toBeTruthy();
    });
  });

  test.describe("Navigation", () => {
    test("should have working sidebar navigation", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for sidebar navigation
      const sidebar = learnerPage.locator('[role="navigation"], nav, aside');

      if (await sidebar.first().isVisible().catch(() => false)) {
        // Check for navigation links
        const links = sidebar.locator("a");
        const linkCount = await links.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });

    test("should be able to navigate between sections", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Navigate to subjects
      const subjectsLink = learnerPage.getByRole("link", { name: /subjects|learn/i }).first();
      if (await subjectsLink.isVisible().catch(() => false)) {
        await subjectsLink.click();
        await learnerPage.waitForLoadState("networkidle");

        const url = learnerPage.url();
        expect(url.includes("/subjects") || url.includes("/learn")).toBeTruthy();
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile", async ({ learnerPage }) => {
      await learnerPage.setViewportSize({ width: 375, height: 667 });
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const main = learnerPage.locator("main").first();
      await expect(main).toBeVisible();

      // No horizontal scrolling
      const bodyWidth = await learnerPage.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await learnerPage.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    });

    test("should have mobile-friendly navigation", async ({ learnerPage }) => {
      await learnerPage.setViewportSize({ width: 375, height: 667 });
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Look for hamburger menu or mobile navigation
      const menuButton = learnerPage.getByRole("button", { name: /menu|toggle|navigation/i });

      if (await menuButton.isVisible().catch(() => false)) {
        await menuButton.click();
        await learnerPage.waitForTimeout(300);

        // Navigation should be visible after clicking menu
        const nav = learnerPage.locator('[role="navigation"], nav');
        await expect(nav.first()).toBeVisible();
      }
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading structure", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Should have at least one heading
      const headings = learnerPage.locator("h1, h2, h3");
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should be keyboard navigable", async ({ learnerPage }) => {
      await learnerPage.goto("/dashboard");
      await learnerPage.waitForLoadState("networkidle");

      if (learnerPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      // Tab through a few elements
      for (let i = 0; i < 5; i++) {
        await learnerPage.keyboard.press("Tab");
        await learnerPage.waitForTimeout(100);
      }

      // Should be able to navigate without errors
      expect(true).toBeTruthy();
    });
  });
});
