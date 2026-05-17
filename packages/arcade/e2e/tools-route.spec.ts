import { expect, test } from "./base-fixtures.js";

const MOUNTED_COUNT = 1;
const ABSENT_COUNT = 0;

test("mounts the game element on the root route", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("bruff-game")).toHaveCount(MOUNTED_COUNT);
  await expect(page.locator("tool-sigil")).toHaveCount(ABSENT_COUNT);
});

test("mounts the sigil tool on the dev tools route", async ({ page }) => {
  await page.goto("/tools");

  await expect(page.locator("tool-sigil")).toHaveCount(MOUNTED_COUNT);
  await expect(page.locator("bruff-game")).toHaveCount(ABSENT_COUNT);
});

test("falls back to the game element on unknown routes", async ({ page }) => {
  await page.goto("/unknown-route");

  await expect(page.locator("bruff-game")).toHaveCount(MOUNTED_COUNT);
  await expect(page.locator("tool-sigil")).toHaveCount(ABSENT_COUNT);
});
