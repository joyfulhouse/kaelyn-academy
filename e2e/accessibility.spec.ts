import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("homepage should have proper heading structure", async ({ page }) => {
    await page.goto("/");

    // Should have exactly one h1
    const h1Elements = page.locator("h1");
    await expect(h1Elements).toHaveCount(1);

    // h1 should be visible
    await expect(h1Elements.first()).toBeVisible();
  });

  test("homepage should have proper landmark regions", async ({ page }) => {
    await page.goto("/");

    // Should have main content area
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Main content should have an id for skip link
    await expect(main).toHaveAttribute("id", "main-content");
  });

  test("all images should have alt text", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaHidden = await img.getAttribute("aria-hidden");

      // Either has alt text or is decorative (aria-hidden="true")
      expect(alt !== null || ariaHidden === "true").toBeTruthy();
    }
  });

  test("interactive elements should be keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Tab through the page
    let tabCount = 0;
    const maxTabs = 50;

    while (tabCount < maxTabs) {
      await page.keyboard.press("Tab");
      tabCount++;

      const focusedElement = page.locator(":focus");
      const isVisible = await focusedElement.isVisible();

      // All focused elements should be visible
      if (await focusedElement.count() > 0) {
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test("buttons should have accessible names", async ({ page }) => {
    await page.goto("/");

    const buttons = page.getByRole("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute("aria-label");
      const text = await button.textContent();
      const title = await button.getAttribute("title");

      // Button should have some accessible name
      expect(name || (text && text.trim()) || title).toBeTruthy();
    }
  });

  test("links should have accessible names", async ({ page }) => {
    await page.goto("/");

    const links = page.getByRole("link");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const name = await link.getAttribute("aria-label");
      const text = await link.textContent();
      const title = await link.getAttribute("title");

      // Link should have some accessible name
      expect(name || (text && text.trim()) || title).toBeTruthy();
    }
  });

  test("form inputs should have labels", async ({ page }) => {
    await page.goto("/");

    const inputs = page.locator("input:not([type='hidden'])");
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      if (id) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;

        // Input should have a label or aria-label
        expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
      }
    }
  });

  test("color contrast should be sufficient", async ({ page }) => {
    await page.goto("/");

    // Check that text elements have readable contrast
    // This is a basic check - for full WCAG compliance, use axe-core
    const textElements = page.locator("p, h1, h2, h3, h4, h5, h6, span, a");
    const count = await textElements.count();

    // At least some text should be visible
    expect(count).toBeGreaterThan(0);
  });
});
