import type { Page } from "@playwright/test";

import { expect, gotoTestMode, test } from "./base-fixtures.js";

test("captures the static HUD region @snapshot", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const hud = page.locator("bruff-game").locator("#bruff-hud");

  await expect(hud).toBeVisible();
  await expect(hud).toHaveScreenshot("hud.png");
});
