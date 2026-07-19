import { AxeBuilder } from "@axe-core/playwright";

import { expect, gotoTestMode, test } from "./base-fixtures.js";

const MOUNTED_COUNT = 1;

const runAccessibilityCheck = (): void => {
  test("root route has no accessibility violations", async ({ page }) => {
    await gotoTestMode(page);

    const axeBuilder = new AxeBuilder({ page });
    const accessibilityScanResults = await axeBuilder.analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("tools route has no accessibility violations", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.locator("tool-sigil")).toHaveCount(MOUNTED_COUNT);

    const axeBuilder = new AxeBuilder({ page });
    const accessibilityScanResults = await axeBuilder.analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("quilt tools route has no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/tools-map");
    await expect(page.locator("tool-quilt")).toHaveCount(MOUNTED_COUNT);

    const axeBuilder = new AxeBuilder({ page });
    const accessibilityScanResults = await axeBuilder.analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
};

test.describe("dark scheme", () => {
  test.use({ colorScheme: "dark" });
  runAccessibilityCheck();
});

test.describe("light scheme", () => {
  test.use({ colorScheme: "light" });
  runAccessibilityCheck();
});
