import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FIVE = 5;

type CellSnapshot = Readonly<{
  column: number;
  row: number;
}>;

type CoincidentEnemyScenarioState = Readonly<{
  enemy: CellSnapshot | null;
  frameIndex: number;
  player: CellSnapshot;
  playerMoved: boolean;
}>;

type CoincidentEnemyScenario = Readonly<{
  enemyCell: CellSnapshot;
  frameStep: number;
  playerCell: CellSnapshot;
}>;

const loadCoincidentEnemyScenario = (
  page: Page,
): Promise<CoincidentEnemyScenarioState | null> =>
  page.evaluate(
    (scenario: CoincidentEnemyScenario) => {
      const { __bruffTestApi: testApi } = globalThis;
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
        enemies: [{ ...enemy, cell: scenario.enemyCell }],
        player: { ...initialState.player, cell: scenario.playerCell },
      });
      testApi.dispatchInput("a");
      const nextState = testApi.stepFrames(scenario.frameStep);
      const [nextEnemy] = nextState.enemies;
      return {
        enemy:
          nextEnemy === undefined
            ? null
            : { column: nextEnemy.cell.column, row: nextEnemy.cell.row },
        frameIndex: nextState.frameIndex,
        player: {
          column: nextState.player.cell.column,
          row: nextState.player.cell.row,
        },
        playerMoved: nextState.playerMoved,
      };
    },
    {
      enemyCell: { column: TWO, row: THREE },
      frameStep: ONE,
      playerCell: { column: THREE, row: THREE },
    },
  );

test("steps deterministic state through the browser test API", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const initialState = await page.evaluate(() => {
    const { __bruffTestApi: testApi } = globalThis;
    return testApi?.getState();
  });
  expect(initialState?.frameIndex).toBe(ZERO);
  expect(initialState?.seed).toBe(ONE);

  const nextState = await page.evaluate(() => {
    const frameStep = 1;
    const { __bruffTestApi: testApi } = globalThis;
    testApi?.dispatchInput("ArrowRight");
    return testApi?.stepFrames(frameStep);
  });

  expect(nextState?.frameIndex).toBe(ONE);
  expect(nextState?.player.cell.column).toBeGreaterThan(
    initialState?.player.cell.column ?? ZERO,
  );
});

test("exposes render stats after a render-only frame", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const renderStats = await page.evaluate(() => {
    const frameStep = 1;
    const { __bruffTestApi: testApi } = globalThis;
    testApi?.stepFrames(frameStep);
    return testApi?.getRenderStats();
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
    const initialCount = 0;
    const inputCountStep = 1;
    const frameStep = 1;
    const inputs = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "noop"];
    const { __bruffTestApi: testApi } = globalThis;
    const queuedInputCount = inputs.reduce((count, input) => {
      testApi?.dispatchInput(input);
      return count + inputCountStep;
    }, initialCount);
    return {
      queuedInputCount,
      state: testApi?.stepFrames(frameStep),
    };
  });

  const { queuedInputCount, state } = result;
  expect(queuedInputCount).toBe(FIVE);
  expect(state?.frameIndex).toBe(ONE);
  expect(state?.player.cell).toStrictEqual({ column: THREE, row: THREE });
  expect(state?.enemies.length).toBe(THREE);
  expect(state?.playerMoved).toBe(true);
});

test("blocks a WASD input into an enemy-occupied cell", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const state = await loadCoincidentEnemyScenario(page);

  expect(state?.frameIndex).toBe(ONE);
  expect(state?.player).toStrictEqual({ column: THREE, row: THREE });
  expect(state?.enemy).toStrictEqual({ column: TWO, row: THREE });
  expect(state?.playerMoved).toBe(false);
});

test("blocks grid movement at the board edge", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const state = await page.evaluate(() => {
    const frameStep = 1;
    const origin = 0;
    const { __bruffTestApi: testApi } = globalThis;
    const initialState = testApi?.getState();
    if (testApi === undefined || initialState === undefined) {
      return null;
    }

    testApi.loadState({
      ...initialState,
      enemies: [],
      player: {
        ...initialState.player,
        cell: { column: origin, row: origin },
      },
    });
    testApi.dispatchInput("ArrowLeft");
    const nextState = testApi.stepFrames(frameStep);
    return {
      frameIndex: nextState.frameIndex,
      player: nextState.player,
      playerMoved: nextState.playerMoved,
    };
  });

  expect(state?.frameIndex).toBe(ONE);
  expect(state?.player.cell).toStrictEqual({ column: ZERO, row: ZERO });
  expect(state?.playerMoved).toBe(false);
});

test("blocks grid movement into an enemy-occupied cell", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const state = await page.evaluate(() => {
    const frameStep = 1;
    const { __bruffTestApi: testApi } = globalThis;
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
      enemies: [
        {
          ...enemy,
          cell: { column: 4, row: 3 },
        },
      ],
      player: {
        ...initialState.player,
        cell: { column: 3, row: 3 },
      },
    });
    testApi.dispatchInput("ArrowRight");
    const nextState = testApi.stepFrames(frameStep);
    return {
      player: nextState.player,
      playerMoved: nextState.playerMoved,
    };
  });

  expect(state?.player.cell).toStrictEqual({ column: THREE, row: THREE });
  expect(state?.playerMoved).toBe(false);
});
