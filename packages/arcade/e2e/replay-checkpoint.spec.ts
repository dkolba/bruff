/* eslint-disable no-magic-numbers, no-underscore-dangle, unicorn/prefer-global-this -- E2E replay setup uses fixed fixture frame constants and the browser test API. */
import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";
import canonicalFixture from "../../game/tests/fixtures/canonical-replay.json" with { type: "json" };

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

test("freezes a replay checkpoint for a stable canvas screenshot", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const frozen = await page.evaluate(
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

  expect(frozen).toBe(true);

  const gameElement = page.locator("bruff-game");

  await expect(gameElement).toBeVisible();
  await gameElement.screenshot();
});
