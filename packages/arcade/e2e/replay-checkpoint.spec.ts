/* eslint-disable no-magic-numbers, no-underscore-dangle, unicorn/prefer-global-this -- E2E replay setup uses fixed fixture frame constants and the browser test API. */
import type { Page } from "@playwright/test";

import canonicalFixture from "../../game/tests/fixtures/canonical-replay.json" with { type: "json" };
import { expect, gotoTestMode, test } from "./base-fixtures.js";

type ReplayCheckpointFixture = Readonly<{
  frames: ReadonlyArray<
    Readonly<{
      frame: number;
      input: string;
    }>
  >;
  initialCanvas: Readonly<{
    height: number;
    width: number;
  }>;
  seed: number;
  totalFrames: number;
}>;

test("freezes a replay checkpoint for a stable canvas screenshot @snapshot", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const isFrozen = await page.evaluate(
    async (fixture: ReplayCheckpointFixture) => {
      const testApi = window.__bruffTestApi;
      if (testApi === undefined) {
        return false;
      }

      const state = testApi.getState();
      testApi.loadState({
        ...state,
        canvas: fixture.initialCanvas,
        frameIndex: 0,
        seed: fixture.seed,
      });

      Array.from({ length: fixture.totalFrames }, (_unused, frameOffset) => {
        const frame = frameOffset + 1;
        fixture.frames
          .filter((replayFrame) => replayFrame.frame === frame)
          .reduce((dispatchedCount, replayFrame) => {
            testApi.dispatchInput(replayFrame.input);
            return dispatchedCount + 1;
          }, 0);
        testApi.stepFrames(1);
        return frame;
      });

      await testApi.freezeForSnapshot();
      return true;
    },
    canonicalFixture,
  );

  expect(isFrozen).toBe(true);

  const canvas = page.locator("bruff-game").locator("canvas");

  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveScreenshot("replay-checkpoint-canvas.png");
});
