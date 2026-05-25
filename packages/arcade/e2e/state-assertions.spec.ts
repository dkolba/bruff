/* eslint-disable max-lines, max-lines-per-function, max-statements, no-magic-numbers, no-underscore-dangle, unicorn/prefer-global-this -- E2E checks intentionally target the browser test API and fixed fixture values. */
import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";

const ZERO = 0;
const ONE = 1;
const THREE = 3;

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
      enemies: [{ ...enemy, cell: { column: 2, row: 3 } }],
      player: { ...initialState.player, cell: { column: 3, row: 3 } },
    });
    testApi.dispatchInput("a");
    const nextState = testApi.stepFrames(1);
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
  expect(state?.enemy).toStrictEqual({ column: 2, row: THREE });
  expect(state?.playerMoved).toBe(false);
});

test("blocks grid movement at the board edge", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const state = await page.evaluate(() => {
    const testApi = window.__bruffTestApi;
    const initialState = testApi?.getState();
    if (testApi === undefined || initialState === undefined) {
      return null;
    }

    testApi.loadState({
      ...initialState,
      enemies: [],
      player: {
        ...initialState.player,
        cell: { column: 0, row: 0 },
        xPos: 0,
        yPos: 0,
      },
    });
    testApi.dispatchInput("ArrowLeft");
    const nextState = testApi.stepFrames(1);
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
      enemies: [
        {
          ...enemy,
          cell: { column: 4, row: 3 },
          xPos: 205,
          yPos: 200,
        },
      ],
      player: {
        ...initialState.player,
        cell: { column: 3, row: 3 },
        xPos: 200,
        yPos: 200,
      },
    });
    testApi.dispatchInput("ArrowRight");
    const nextState = testApi.stepFrames(1);
    return {
      player: nextState.player,
      playerMoved: nextState.playerMoved,
    };
  });

  expect(state?.player.cell).toStrictEqual({ column: THREE, row: THREE });
  expect(state?.playerMoved).toBe(false);
});

test("resolves version 3 grid enemy movement through the browser test API", async ({
  page,
}: {
  page: Page;
}) => {
  await gotoTestMode(page);

  const snapshots = await page.evaluate(() => {
    const testApi = window.__bruffTestApi;
    const initialState = testApi?.getState();
    const [enemy0, enemy1] = initialState?.enemies ?? [];
    if (
      testApi === undefined ||
      initialState === undefined ||
      enemy0 === undefined ||
      enemy1 === undefined
    ) {
      return null;
    }

    const loadScenario = (
      enemies: typeof initialState.enemies,
      playerCell: { column: number; row: number },
    ): ReadonlyArray<{ column: number; row: number } | undefined> => {
      testApi.loadState({
        ...initialState,
        board: { columns: 7, rows: 7 },
        enemies,
        player: {
          ...initialState.player,
          cell: playerCell,
          xPos: playerCell.column,
          yPos: playerCell.row,
        },
        playerMoved: false,
        stateVersion: 3,
      });
      testApi.dispatchInput("ArrowUp");
      return testApi.stepFrames(1).enemies.map((enemy) => ({
        column: enemy.cell.column,
        row: enemy.cell.row,
      }));
    };

    const accepted = loadScenario(
      [
        {
          ...enemy0,
          cell: { column: 2, row: 0 },
          spawnOrder: 0,
        },
      ],
      { column: 4, row: 1 },
    );

    const playerBlocked = loadScenario(
      [
        {
          ...enemy0,
          cell: { column: 3, row: 0 },
          spawnOrder: 0,
        },
      ],
      { column: 4, row: 1 },
    );

    const enemyBlocked = loadScenario(
      [
        {
          ...enemy0,
          cell: { column: 2, row: 0 },
          spawnOrder: 0,
        },
        {
          ...enemy1,
          cell: { column: 3, row: 0 },
          spawnOrder: 1,
        },
      ],
      { column: 4, row: 1 },
    );

    const reservedBlocked = loadScenario(
      [
        {
          ...enemy0,
          cell: { column: 2, row: 2 },
          spawnOrder: 0,
        },
        {
          ...enemy1,
          cell: { column: 1, row: 1 },
          spawnOrder: 1,
        },
      ],
      { column: 2, row: 1 },
    );

    const noAcceptedPlayerMove = loadScenario(
      [
        {
          ...enemy0,
          cell: { column: 2, row: 0 },
          spawnOrder: 0,
        },
      ],
      { column: 4, row: 0 },
    );

    return {
      accepted,
      enemyBlocked,
      noAcceptedPlayerMove,
      playerBlocked,
      reservedBlocked,
    };
  });

  expect(snapshots?.accepted).toStrictEqual([{ column: 3, row: 0 }]);
  expect(snapshots?.playerBlocked).toStrictEqual([{ column: 3, row: 0 }]);
  expect(snapshots?.enemyBlocked).toStrictEqual([
    { column: 2, row: 0 },
    { column: 3, row: 0 },
  ]);
  expect(snapshots?.reservedBlocked).toStrictEqual([
    { column: 2, row: 1 },
    { column: 1, row: 1 },
  ]);
  expect(snapshots?.noAcceptedPlayerMove).toStrictEqual([
    { column: 2, row: 0 },
  ]);
});
