/* eslint-disable no-magic-numbers, no-underscore-dangle, unicorn/prefer-global-this -- E2E checks intentionally target the browser test API and fixed fixture values. */
import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";

const ZERO = 0;
const ONE = 1;
const THREE = 3;
const PLAYER_Y_POS = 200;
const POST_MOVE_X_POS = 195;

type PositionSnapshot = Readonly<{
  xPos: number;
  yPos: number;
}>;

type CoincidentEnemyScenarioState = Readonly<{
  enemy: PositionSnapshot | null;
  frameIndex: number;
  player: PositionSnapshot;
}>;

const loadCoincidentEnemyScenario = (
  page: Page,
): Promise<CoincidentEnemyScenarioState | null> =>
  page.evaluate((): CoincidentEnemyScenarioState | null => {
    const testApi = window.__bruffTestApi;
    const initialState = testApi?.getState();
    const [enemy] = initialState?.enemies ?? [];
    if (
      testApi === undefined ||
      initialState === undefined ||
      enemy === undefined
    ) {
      return null;
    }

    testApi.loadState({
      ...initialState,
      enemies: [{ ...enemy, xPos: 195, yPos: 200 }],
      player: { ...initialState.player, xPos: 200, yPos: 200 },
    });
    testApi.dispatchInput("a");
    const nextState = testApi.stepFrames(1);
    const [nextEnemy] = nextState.enemies;
    return {
      enemy:
        nextEnemy === undefined
          ? null
          : { xPos: nextEnemy.xPos, yPos: nextEnemy.yPos },
      frameIndex: nextState.frameIndex,
      player: { xPos: nextState.player.xPos, yPos: nextState.player.yPos },
    };
  });

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

test("keeps an enemy still when a WASD input moves the player onto it", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const state = await loadCoincidentEnemyScenario(page);

  expect(state?.frameIndex).toBe(ONE);
  expect(state?.player.xPos).toBe(POST_MOVE_X_POS);
  expect(state?.player.yPos).toBe(PLAYER_Y_POS);
  expect(state?.enemy).toStrictEqual({
    xPos: POST_MOVE_X_POS,
    yPos: PLAYER_Y_POS,
  });
});
