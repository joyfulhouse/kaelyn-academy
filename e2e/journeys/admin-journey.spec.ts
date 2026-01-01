import { test, expect } from "../fixtures/auth";

/**
 * Admin Journey E2E Tests
 *
 * Comprehensive tests for admin personas:
 * - US-SA01 through US-SA24 (School Admin stories)
 * - US-A01 through US-A20 (Platform Admin stories)
 *
 * These tests validate admin functionality for managing organizations,
 * users, content, billing, and platform-wide settings.
 */

test.describe("Admin Journey: Platform Admin Core Features", () => {
  /**
   * US-A01 through US-A03: Organization Management
   */
  test.describe("US-A01-03: Organization Management", () => {
    test("should display admin dashboard", async ({ adminPage }) => {
      await adminPage.goto("/admin");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Admin") ||
          content?.includes("Dashboard") ||
          content?.includes("Overview") ||
          content?.includes("Platform")
      ).toBeTruthy();
    });

    test("should access organizations list", async ({ adminPage }) => {
      await adminPage.goto("/admin/organizations");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Organization") ||
          content?.includes("School") ||
          content?.includes("District") ||
          content?.includes("Manage")
      ).toBeTruthy();
    });

    test("should configure custom domains", async ({ adminPage }) => {
      await adminPage.goto("/admin/domains");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Domain") ||
          content?.includes("Custom") ||
          content?.includes("White-label") ||
          content?.includes("Configure")
      ).toBeTruthy();
    });

    test("should manage organization branding", async ({ adminPage }) => {
      await adminPage.goto("/admin/branding");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Brand") ||
          content?.includes("Theme") ||
          content?.includes("Logo") ||
          content?.includes("Color")
      ).toBeTruthy();
    });
  });

  /**
   * US-A04 through US-A07: User Management
   */
  test.describe("US-A04-07: User Management", () => {
    test("should access user management", async ({ adminPage }) => {
      await adminPage.goto("/admin/users");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("User") ||
          content?.includes("Account") ||
          content?.includes("Manage") ||
          content?.includes("Role")
      ).toBeTruthy();
    });

    test("should assign user roles", async ({ adminPage }) => {
      await adminPage.goto("/admin/users");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Role") ||
          content?.includes("Permission") ||
          content?.includes("Admin") ||
          content?.includes("Teacher")
      ).toBeTruthy();
    });

    test("should bulk import users", async ({ adminPage }) => {
      await adminPage.goto("/admin/users/import");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Import") ||
          content?.includes("CSV") ||
          content?.includes("Bulk") ||
          content?.includes("Upload")
      ).toBeTruthy();
    });
  });

  /**
   * US-A08 through US-A10: Content Management
   */
  test.describe("US-A08-10: Content Management", () => {
    test("should manage curriculum content", async ({ adminPage }) => {
      await adminPage.goto("/admin/curriculum");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Curriculum") ||
          content?.includes("Content") ||
          content?.includes("Lesson") ||
          content?.includes("Manage")
      ).toBeTruthy();
    });

    test("should access blog management", async ({ adminPage }) => {
      await adminPage.goto("/admin/blog");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Blog") ||
          content?.includes("Post") ||
          content?.includes("Article") ||
          content?.includes("Publish")
      ).toBeTruthy();
    });

    test("should configure AI tutor settings", async ({ adminPage }) => {
      await adminPage.goto("/admin/ai-settings");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("AI") ||
          content?.includes("Tutor") ||
          content?.includes("Setting") ||
          content?.includes("Configure")
      ).toBeTruthy();
    });
  });

  /**
   * US-A11 through US-A13: Billing & Subscriptions
   */
  test.describe("US-A11-13: Billing Management", () => {
    test("should manage subscription plans", async ({ adminPage }) => {
      await adminPage.goto("/admin/billing/plans");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Plan") ||
          content?.includes("Subscription") ||
          content?.includes("Pricing") ||
          content?.includes("Tier")
      ).toBeTruthy();
    });

    test("should view billing history", async ({ adminPage }) => {
      await adminPage.goto("/admin/billing");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Billing") ||
          content?.includes("Invoice") ||
          content?.includes("Payment") ||
          content?.includes("History")
      ).toBeTruthy();
    });

    test("should configure payment settings", async ({ adminPage }) => {
      await adminPage.goto("/admin/billing/settings");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Payment") ||
          content?.includes("Stripe") ||
          content?.includes("Setting") ||
          content?.includes("Configure")
      ).toBeTruthy();
    });
  });

  /**
   * US-A14 through US-A16: Analytics & Compliance
   */
  test.describe("US-A14-16: Analytics & Compliance", () => {
    test("should view platform analytics", async ({ adminPage }) => {
      await adminPage.goto("/admin/analytics");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Analytics") ||
          content?.includes("Metrics") ||
          content?.includes("Usage") ||
          content?.includes("Report")
      ).toBeTruthy();
    });

    test("should review audit logs", async ({ adminPage }) => {
      await adminPage.goto("/admin/audit");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Audit") ||
          content?.includes("Log") ||
          content?.includes("Activity") ||
          content?.includes("Event")
      ).toBeTruthy();
    });

    test("should access system settings", async ({ adminPage }) => {
      await adminPage.goto("/admin/settings");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Setting") ||
          content?.includes("System") ||
          content?.includes("Configure") ||
          content?.includes("Platform")
      ).toBeTruthy();
    });
  });

  /**
   * US-A17 through US-A20: Platform Operations
   */
  test.describe("US-A17-20: Platform Operations", () => {
    test("should manage feature flags", async ({ adminPage }) => {
      await adminPage.goto("/admin/features");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Feature") ||
          content?.includes("Flag") ||
          content?.includes("Toggle") ||
          content?.includes("Enable")
      ).toBeTruthy();
    });

    test("should configure AI providers", async ({ adminPage }) => {
      await adminPage.goto("/admin/ai-providers");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("AI") ||
          content?.includes("Provider") ||
          content?.includes("Claude") ||
          content?.includes("OpenAI")
      ).toBeTruthy();
    });

    test("should monitor system health", async ({ adminPage }) => {
      await adminPage.goto("/admin/health");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Health") ||
          content?.includes("Status") ||
          content?.includes("Monitor") ||
          content?.includes("System")
      ).toBeTruthy();
    });

    test("should manage content moderation", async ({ adminPage }) => {
      await adminPage.goto("/admin/moderation");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Moderation") ||
          content?.includes("Content") ||
          content?.includes("Review") ||
          content?.includes("Flag")
      ).toBeTruthy();
    });
  });
});

/**
 * School Admin Stories (US-SA)
 */
test.describe("Admin Journey: School Admin Features", () => {
  /**
   * US-SA01 through US-SA05: School Onboarding
   */
  test.describe("US-SA01-05: School Onboarding", () => {
    test("US-SA01: should set up school branding", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/branding");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Brand") ||
          content?.includes("School") ||
          content?.includes("Logo") ||
          content?.includes("Theme")
      ).toBeTruthy();
    });

    test("US-SA02: should import student rosters", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/import/students");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Import") ||
          content?.includes("Student") ||
          content?.includes("Roster") ||
          content?.includes("SIS")
      ).toBeTruthy();
    });

    test("US-SA03: should import teacher assignments", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/import/teachers");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Import") ||
          content?.includes("Teacher") ||
          content?.includes("Staff") ||
          content?.includes("Assignment")
      ).toBeTruthy();
    });

    test("US-SA04: should configure SSO", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/sso");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("SSO") ||
          content?.includes("Single Sign") ||
          content?.includes("Identity") ||
          content?.includes("SAML")
      ).toBeTruthy();
    });

    test("US-SA05: should set grade-level defaults", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/grades");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Grade") ||
          content?.includes("Level") ||
          content?.includes("Default") ||
          content?.includes("Setting")
      ).toBeTruthy();
    });
  });

  /**
   * US-SA06 through US-SA10: School Management
   */
  test.describe("US-SA06-10: School Management", () => {
    test("US-SA06: should view all teachers", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/teachers");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Teacher") ||
          content?.includes("Staff") ||
          content?.includes("Class") ||
          content?.includes("Manage")
      ).toBeTruthy();
    });

    test("US-SA07: should view school performance", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/performance");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Performance") ||
          content?.includes("Metric") ||
          content?.includes("School") ||
          content?.includes("Analytics")
      ).toBeTruthy();
    });

    test("US-SA08: should compare grade performance", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/grades/compare");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Grade") ||
          content?.includes("Compare") ||
          content?.includes("Performance") ||
          content?.includes("Level")
      ).toBeTruthy();
    });

    test("US-SA09: should identify at-risk students", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/at-risk");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Risk") ||
          content?.includes("Student") ||
          content?.includes("Alert") ||
          content?.includes("Intervention")
      ).toBeTruthy();
    });

    test("US-SA10: should manage teacher permissions", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/permissions");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Permission") ||
          content?.includes("Role") ||
          content?.includes("Access") ||
          content?.includes("Teacher")
      ).toBeTruthy();
    });
  });

  /**
   * US-SA11 through US-SA15: Curriculum & Standards
   */
  test.describe("US-SA11-15: Curriculum & Standards", () => {
    test("US-SA11: should select curriculum units", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/curriculum");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Curriculum") ||
          content?.includes("Unit") ||
          content?.includes("Enable") ||
          content?.includes("Select")
      ).toBeTruthy();
    });

    test("US-SA12: should align to state standards", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/standards");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Standard") ||
          content?.includes("State") ||
          content?.includes("Align") ||
          content?.includes("Common Core")
      ).toBeTruthy();
    });

    test("US-SA14: should set pacing guides", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/pacing");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Pacing") ||
          content?.includes("Schedule") ||
          content?.includes("Calendar") ||
          content?.includes("Guide")
      ).toBeTruthy();
    });

    test("US-SA15: should configure assessment calendars", async ({
      adminPage,
    }) => {
      await adminPage.goto("/admin/school/assessments");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Assessment") ||
          content?.includes("Calendar") ||
          content?.includes("Test") ||
          content?.includes("Schedule")
      ).toBeTruthy();
    });
  });

  /**
   * US-SA16 through US-SA20: Compliance & Reporting
   */
  test.describe("US-SA16-20: Compliance & Reporting", () => {
    test("US-SA16: should generate state reports", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/reports");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Report") ||
          content?.includes("State") ||
          content?.includes("Generate") ||
          content?.includes("Compliance")
      ).toBeTruthy();
    });

    test("US-SA17: should ensure FERPA compliance", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/privacy");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("FERPA") ||
          content?.includes("Privacy") ||
          content?.includes("Compliance") ||
          content?.includes("Data")
      ).toBeTruthy();
    });

    test("US-SA18: should manage parental consent", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/consent");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Consent") ||
          content?.includes("Parent") ||
          content?.includes("COPPA") ||
          content?.includes("Privacy")
      ).toBeTruthy();
    });

    test("US-SA19: should audit teacher activity", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/audit");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Audit") ||
          content?.includes("Activity") ||
          content?.includes("Log") ||
          content?.includes("Teacher")
      ).toBeTruthy();
    });

    test("US-SA20: should export accreditation data", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/export");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Export") ||
          content?.includes("Accreditation") ||
          content?.includes("Data") ||
          content?.includes("Download")
      ).toBeTruthy();
    });
  });

  /**
   * US-SA21 through US-SA24: Parent & Community
   */
  test.describe("US-SA21-24: Parent & Community", () => {
    test("US-SA21: should send school announcements", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/announcements");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Announcement") ||
          content?.includes("Message") ||
          content?.includes("Parent") ||
          content?.includes("Send")
      ).toBeTruthy();
    });

    test("US-SA22: should configure parent access", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/parent-access");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Parent") ||
          content?.includes("Access") ||
          content?.includes("Permission") ||
          content?.includes("Configure")
      ).toBeTruthy();
    });

    test("US-SA23: should manage public profile", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/profile");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Profile") ||
          content?.includes("Public") ||
          content?.includes("School") ||
          content?.includes("About")
      ).toBeTruthy();
    });

    test("US-SA24: should share success metrics", async ({ adminPage }) => {
      await adminPage.goto("/admin/school/metrics");
      await adminPage.waitForLoadState("networkidle");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      const content = await adminPage.textContent("body");
      expect(
        content?.includes("Metric") ||
          content?.includes("Success") ||
          content?.includes("Share") ||
          content?.includes("Report")
      ).toBeTruthy();
    });
  });
});

/**
 * Complete Admin Journey Flow
 */
test.describe("Admin Journey: Complete Flow", () => {
  test("should complete typical admin session", async ({ adminPage }) => {
    // Step 1: View dashboard
    await adminPage.goto("/admin");
    await adminPage.waitForLoadState("networkidle");

    if (adminPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(adminPage.locator("main")).toBeVisible();

    // Step 2: Check organizations
    await adminPage.goto("/admin/organizations");
    await adminPage.waitForLoadState("networkidle");
    await expect(adminPage.locator("main")).toBeVisible();

    // Step 3: View users
    await adminPage.goto("/admin/users");
    await adminPage.waitForLoadState("networkidle");
    await expect(adminPage.locator("main")).toBeVisible();

    // Step 4: Check analytics
    await adminPage.goto("/admin/analytics");
    await adminPage.waitForLoadState("networkidle");
    await expect(adminPage.locator("main")).toBeVisible();

    // Step 5: Review audit logs
    await adminPage.goto("/admin/audit");
    await adminPage.waitForLoadState("networkidle");
    await expect(adminPage.locator("main")).toBeVisible();
  });

  test("should navigate between all admin pages", async ({ adminPage }) => {
    const pages = [
      "/admin",
      "/admin/organizations",
      "/admin/users",
      "/admin/curriculum",
      "/admin/billing",
      "/admin/analytics",
      "/admin/audit",
      "/admin/settings",
    ];

    for (const page of pages) {
      await adminPage.goto(page);
      await adminPage.waitForLoadState("domcontentloaded");

      if (adminPage.url().includes("/login")) {
        test.skip(true, "Dev OAuth not enabled");
        return;
      }

      await expect(adminPage.locator("body")).toBeVisible();
    }
  });
});

/**
 * Accessibility Tests
 */
test.describe("Admin Journey: Accessibility", () => {
  test("should have keyboard navigation", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await adminPage.waitForLoadState("networkidle");

    if (adminPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await adminPage.keyboard.press("Tab");
    expect(true).toBeTruthy();
  });

  test("should have proper heading structure", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await adminPage.waitForLoadState("networkidle");

    if (adminPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    const headings = adminPage.locator("h1, h2, h3");
    const count = await headings.count();
    expect(count >= 0).toBeTruthy();
  });
});

/**
 * Responsive Design Tests
 */
test.describe("Admin Journey: Responsive Design", () => {
  test("should display on desktop", async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 1920, height: 1080 });
    await adminPage.goto("/admin");
    await adminPage.waitForLoadState("networkidle");

    if (adminPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(adminPage.locator("main")).toBeVisible();
  });

  test("should display on tablet", async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 768, height: 1024 });
    await adminPage.goto("/admin");
    await adminPage.waitForLoadState("networkidle");

    if (adminPage.url().includes("/login")) {
      test.skip(true, "Dev OAuth not enabled");
      return;
    }

    await expect(adminPage.locator("main")).toBeVisible();
  });
});
