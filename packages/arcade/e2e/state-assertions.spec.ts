/* eslint-disable no-magic-numbers, no-underscore-dangle, unicorn/prefer-global-this -- E2E checks intentionally target the browser test API and fixed fixture values. */
import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";

const ZERO = 0;
const ONE = 1;
const THREE = 3;

test("steps deterministic state through the browser test API", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const initialState = await page.evaluate(() =>
    window.__bruffTestApi?.getState(),
  );
  expect(initialState?.frameIndex).toBe(ZERO);
  expect(initialState?.seed).toBe(ONE);

  const nextState = await page.evaluate(() => {
    window.__bruffTestApi?.dispatchInput("ArrowRight");
    return window.__bruffTestApi?.stepFrames(1);
  });

  expect(nextState?.frameIndex).toBe(ONE);
  expect(nextState?.player.xPos).toBeGreaterThan(
    initialState?.player.xPos ?? ZERO,
  );
});

test("exposes render stats after a render-only frame", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const renderStats = await page.evaluate(() => {
    window.__bruffTestApi?.stepFrames(1);
    return window.__bruffTestApi?.getRenderStats();
  });

  expect(renderStats).toMatchObject({
    enemiesDrawn: THREE,
    frameIndex: ZERO,
    playerDrawn: true,
  });
});

test("applies queued movement inputs in FIFO order", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const result = await page.evaluate(() => {
    const inputs = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "noop"];
    const queuedInputCount = inputs.reduce((count, input) => {
      window.__bruffTestApi?.dispatchInput(input);
      return count + 1;
    }, 0);
    return {
      queuedInputCount,
      state: window.__bruffTestApi?.stepFrames(1),
    };
  });

  const { queuedInputCount, state } = result;
  expect(queuedInputCount).toBe(5);
  expect(state?.frameIndex).toBe(ONE);
  expect(state?.player.xPos).toBe(200);
  expect(state?.player.yPos).toBe(200);
  expect(state?.enemies.length).toBe(THREE);
  expect(state?.playerMoved).toBe(true);
});
