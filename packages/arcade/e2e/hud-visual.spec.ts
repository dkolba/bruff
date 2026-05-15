import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";

test("captures the static HUD region", async ({ page }: { page: Page }) => {
  await gotoTestMode(page);

  const hud = page.locator("bruff-game").locator("#bruff-hud");

  await expect(hud).toBeVisible();
  await hud.screenshot();
});
