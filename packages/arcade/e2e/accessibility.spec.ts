import { expect, gotoTestMode, test } from "./base-fixtures.js";
import { AxeBuilder } from "@axe-core/playwright";

const runAccessibilityCheck = (): void => {
  test("has no accessibility violations", async ({ page }) => {
    await gotoTestMode(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
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
