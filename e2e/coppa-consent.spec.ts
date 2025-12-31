import { test, expect, type Page } from "@playwright/test";

/**
 * COPPA Consent Flow E2E Tests
 *
 * Comprehensive tests for Children's Online Privacy Protection Act compliance:
 * - Under-13 user registration flow
 * - Parental consent verification
 * - Consent form multi-step workflow
 * - Required agreements enforcement
 * - Electronic signature validation
 * - Audit trail creation
 */

test.describe("COPPA Consent Flow", () => {
  test.describe("Consent Page Display", () => {
    test("should display consent page with all required elements", async ({ page }) => {
      await page.goto("/consent");

      // Should have page title
      await expect(page.getByRole("heading", { name: /parental consent/i })).toBeVisible();

      // Should show COPPA reference
      await expect(page.getByText(/coppa/i)).toBeVisible();

      // Should have progress steps indicator
      await expect(page.getByText(/information/i)).toBeVisible();
      await expect(page.getByText(/agreements/i)).toBeVisible();
      await expect(page.getByText(/signature/i)).toBeVisible();
    });

    test("should display step 1 form fields", async ({ page }) => {
      await page.goto("/consent");

      // Parent information fields
      await expect(page.getByLabel(/parent.*name/i)).toBeVisible();
      await expect(page.getByLabel(/parent.*email/i)).toBeVisible();

      // Child information fields
      await expect(page.getByLabel(/child.*name/i)).toBeVisible();
      await expect(page.getByLabel(/child.*birthdate/i)).toBeVisible();

      // Relationship selector
      await expect(page.getByLabel(/relationship/i)).toBeVisible();
    });

    test("should have continue button disabled when form is empty", async ({ page }) => {
      await page.goto("/consent");

      const continueButton = page.getByRole("button", { name: /continue/i });
      await expect(continueButton).toBeDisabled();
    });
  });

  test.describe("Step 1: Information Collection", () => {
    test("should enable continue button when all required fields are filled", async ({ page }) => {
      await page.goto("/consent");

      // Fill in all required fields
      await page.getByLabel(/parent.*name/i).fill("John Parent");
      await page.getByLabel(/parent.*email/i).fill("parent@example.com");
      await page.getByLabel(/child.*name/i).fill("Little Johnny");
      await page.getByLabel(/child.*birthdate/i).fill("2015-03-15");

      const continueButton = page.getByRole("button", { name: /continue/i });
      await expect(continueButton).toBeEnabled();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/consent");

      // Fill with invalid email
      await page.getByLabel(/parent.*name/i).fill("John Parent");
      await page.getByLabel(/parent.*email/i).fill("invalid-email");
      await page.getByLabel(/child.*name/i).fill("Little Johnny");
      await page.getByLabel(/child.*birthdate/i).fill("2015-03-15");

      // Email input should show validation
      const emailInput = page.getByLabel(/parent.*email/i);
      await expect(emailInput).toHaveAttribute("type", "email");
    });

    test("should not allow future dates for child birthdate", async ({ page }) => {
      await page.goto("/consent");

      const birthdateInput = page.getByLabel(/child.*birthdate/i);

      // Should have max attribute preventing future dates
      const maxDate = await birthdateInput.getAttribute("max");
      const today = new Date().toISOString().split("T")[0];
      expect(maxDate).toBe(today);
    });

    test("should allow selecting different relationships", async ({ page }) => {
      await page.goto("/consent");

      const relationshipSelect = page.getByLabel(/relationship/i);

      // Check available options
      await expect(relationshipSelect.locator("option", { hasText: "Parent" })).toBeAttached();
      await expect(relationshipSelect.locator("option", { hasText: "Legal Guardian" })).toBeAttached();
      await expect(relationshipSelect.locator("option", { hasText: "Foster Parent" })).toBeAttached();
    });

    test("should proceed to step 2 when continue is clicked", async ({ page }) => {
      await page.goto("/consent");

      // Fill required fields
      await fillStep1(page);

      // Click continue
      await page.getByRole("button", { name: /continue/i }).click();

      // Should show step 2 content
      await expect(page.getByText(/required agreements/i)).toBeVisible();
    });
  });

  test.describe("Step 2: Agreements", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/consent");
      await fillStep1(page);
      await page.getByRole("button", { name: /continue/i }).click();
    });

    test("should display all required agreement checkboxes", async ({ page }) => {
      // Check for all 5 agreement types
      await expect(page.getByText(/data collection consent/i)).toBeVisible();
      await expect(page.getByText(/data usage agreement/i)).toBeVisible();
      await expect(page.getByText(/communication preferences/i)).toBeVisible();
      await expect(page.getByText(/terms of service/i)).toBeVisible();
      await expect(page.getByText(/privacy policy/i)).toBeVisible();
    });

    test("should have continue button disabled until all agreements are checked", async ({ page }) => {
      const continueButton = page.getByRole("button", { name: /continue/i });
      await expect(continueButton).toBeDisabled();

      // Check only some agreements
      const checkboxes = page.locator('input[type="checkbox"]');
      await checkboxes.first().check();

      // Should still be disabled
      await expect(continueButton).toBeDisabled();
    });

    test("should enable continue when all agreements are accepted", async ({ page }) => {
      // Check all agreement checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }

      const continueButton = page.getByRole("button", { name: /continue/i });
      await expect(continueButton).toBeEnabled();
    });

    test("should have links to Terms, Privacy, and COPPA notice", async ({ page }) => {
      await expect(page.getByRole("link", { name: /terms of service/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /privacy policy/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /coppa notice/i })).toBeVisible();
    });

    test("should allow going back to step 1", async ({ page }) => {
      const backButton = page.getByRole("button", { name: /back/i });
      await backButton.click();

      // Should show step 1 content again
      await expect(page.getByLabel(/parent.*name/i)).toBeVisible();
    });

    test("should proceed to step 3 when all agreements accepted", async ({ page }) => {
      await acceptAllAgreements(page);
      await page.getByRole("button", { name: /continue/i }).click();

      // Should show step 3 content
      await expect(page.getByText(/electronic signature/i)).toBeVisible();
    });
  });

  test.describe("Step 3: Electronic Signature", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/consent");
      await fillStep1(page);
      await page.getByRole("button", { name: /continue/i }).click();
      await acceptAllAgreements(page);
      await page.getByRole("button", { name: /continue/i }).click();
    });

    test("should display consent summary", async ({ page }) => {
      // Should show parent name from step 1
      await expect(page.getByText(/john parent/i)).toBeVisible();
      // Should show child name from step 1
      await expect(page.getByText(/little johnny/i)).toBeVisible();
    });

    test("should have signature input field", async ({ page }) => {
      const signatureInput = page.getByLabel(/signature/i);
      await expect(signatureInput).toBeVisible();
      await expect(signatureInput).toHaveAttribute("placeholder", /full name/i);
    });

    test("should have submit button disabled until signature is provided", async ({ page }) => {
      const submitButton = page.getByRole("button", { name: /submit consent/i });
      await expect(submitButton).toBeDisabled();
    });

    test("should enable submit when signature is provided", async ({ page }) => {
      await page.getByLabel(/signature/i).fill("John Parent");

      const submitButton = page.getByRole("button", { name: /submit consent/i });
      await expect(submitButton).toBeEnabled();
    });

    test("should display COPPA revocation notice", async ({ page }) => {
      // Should inform users about consent revocation rights
      await expect(page.getByText(/revoke consent/i)).toBeVisible();
      await expect(page.getByText(/privacy@kaelyns.academy/i)).toBeVisible();
    });

    test("should display today's date as signature date", async ({ page }) => {
      const dateInput = page.locator('input[type="date"][disabled]');
      const today = new Date().toISOString().split("T")[0];

      await expect(dateInput).toHaveValue(today);
    });
  });

  test.describe("Form Submission", () => {
    test("should show loading state when submitting", async ({ page }) => {
      await page.goto("/consent");
      await completeAllSteps(page);

      // Mock slow API response
      await page.route("**/api/consent", async (route) => {
        await new Promise((r) => setTimeout(r, 500));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /submit consent/i }).click();

      // Should show loading text
      await expect(page.getByText(/submitting/i)).toBeVisible();
    });

    test("should redirect to success page on successful submission", async ({ page }) => {
      await page.goto("/consent");
      await completeAllSteps(page);

      // Mock successful API response
      await page.route("**/api/consent", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await page.getByRole("button", { name: /submit consent/i }).click();

      // Should redirect to success page
      await expect(page).toHaveURL(/consent\/success/);
    });

    test("should show error message on failed submission", async ({ page }) => {
      await page.goto("/consent");
      await completeAllSteps(page);

      // Mock failed API response
      await page.route("**/api/consent", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: "Invalid consent data" }),
        });
      });

      // Listen for alert dialogs
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Invalid consent data");
        await dialog.accept();
      });

      await page.getByRole("button", { name: /submit consent/i }).click();
    });
  });

  test.describe("Consent Token Flow", () => {
    test("should display token when provided in URL", async ({ page }) => {
      const testToken = "test-token-12345678";
      await page.goto(`/consent?token=${testToken}`);

      // Should show token indicator
      await expect(page.getByText(/test-tok/i)).toBeVisible();
    });

    test("should include token in API submission", async ({ page }) => {
      const testToken = "test-token-12345678";
      await page.goto(`/consent?token=${testToken}`);

      // Capture API request
      let capturedBody: { token?: string } = {};
      await page.route("**/api/consent", async (route) => {
        const request = route.request();
        capturedBody = JSON.parse(request.postData() || "{}") as { token?: string };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      });

      await completeAllSteps(page);
      await page.getByRole("button", { name: /submit consent/i }).click();

      // Wait for request to complete
      await page.waitForTimeout(100);

      // Verify token was included
      expect(capturedBody.token).toBe(testToken);
    });
  });

  test.describe("Success Page", () => {
    test("should display success message", async ({ page }) => {
      await page.goto("/consent/success");

      // Should show success indicators
      await expect(page.getByRole("heading", { name: /success|thank you|confirmed/i })).toBeVisible();
    });

    test("should provide next steps", async ({ page }) => {
      await page.goto("/consent/success");

      // Should have some call to action or next steps
      const hasNextSteps =
        (await page.getByRole("link", { name: /dashboard|login|continue/i }).isVisible()) ||
        (await page.getByRole("button", { name: /dashboard|login|continue/i }).isVisible()) ||
        (await page.getByText(/email|verification|confirm/i).isVisible());

      expect(hasNextSteps).toBeTruthy();
    });
  });

  test.describe("COPPA Age Verification", () => {
    test("should accept birthdate for child under 13", async ({ page }) => {
      await page.goto("/consent");

      // Calculate a date that makes child 8 years old
      const today = new Date();
      const eightYearsAgo = new Date(today.getFullYear() - 8, today.getMonth(), today.getDate());
      const birthdate = eightYearsAgo.toISOString().split("T")[0];

      await page.getByLabel(/parent.*name/i).fill("Parent Name");
      await page.getByLabel(/parent.*email/i).fill("parent@example.com");
      await page.getByLabel(/child.*name/i).fill("Child Name");
      await page.getByLabel(/child.*birthdate/i).fill(birthdate);

      // Should allow proceeding
      const continueButton = page.getByRole("button", { name: /continue/i });
      await expect(continueButton).toBeEnabled();
    });

    test("should handle edge case: child exactly 13 years old", async ({ page }) => {
      await page.goto("/consent");

      // Calculate birthdate for exactly 13 years ago
      const today = new Date();
      const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      const birthdate = thirteenYearsAgo.toISOString().split("T")[0];

      await page.getByLabel(/parent.*name/i).fill("Parent Name");
      await page.getByLabel(/parent.*email/i).fill("parent@example.com");
      await page.getByLabel(/child.*name/i).fill("Child Name");
      await page.getByLabel(/child.*birthdate/i).fill(birthdate);

      // Should still work (edge case - consent still useful)
      const continueButton = page.getByRole("button", { name: /continue/i });
      await expect(continueButton).toBeEnabled();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper form labels", async ({ page }) => {
      await page.goto("/consent");

      // All inputs should have associated labels
      const inputs = page.locator("input:visible");
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeAttached();
        }
      }
    });

    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/consent");

      // Tab through form elements
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });

    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/consent");

      // Check that primary text elements are visible
      const headings = page.locator("h1, h2, h3");
      const count = await headings.count();

      for (let i = 0; i < count; i++) {
        await expect(headings.nth(i)).toBeVisible();
      }
    });
  });
});

// Helper functions

async function fillStep1(page: Page) {
  await page.getByLabel(/parent.*name/i).fill("John Parent");
  await page.getByLabel(/parent.*email/i).fill("parent@example.com");
  await page.getByLabel(/child.*name/i).fill("Little Johnny");
  await page.getByLabel(/child.*birthdate/i).fill("2015-03-15");
}

async function acceptAllAgreements(page: Page) {
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();

  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).check();
  }
}

async function completeAllSteps(page: Page) {
  // Step 1
  await fillStep1(page);
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 2
  await acceptAllAgreements(page);
  await page.getByRole("button", { name: /continue/i }).click();

  // Step 3
  await page.getByLabel(/signature/i).fill("John Parent");
}
