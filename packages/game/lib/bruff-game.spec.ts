import { expect, test } from "../e2e/base-fixtures.js";
import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "@playwright/test";

test.beforeEach(async ({ page }: { page: Page }) => {
  await page.goto("/");
});

const runbruffGameTests = () => {
  test("should find custom game element", async ({ page }) => {
    const customElementCountdown = page.locator("bruff-game").first();

    // Move the player
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");

    await expect(customElementCountdown).toBeVisible();
  });

  test("should not have accessibility issues", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
};

test.describe("Game in dark mode", () => {
  test.use({
    colorScheme: "dark",
  });
  runbruffGameTests();
});

test.describe("Game in light mode", () => {
  test.use({
    colorScheme: "light",
  });
  runbruffGameTests();
});
