import { expect, type Page } from "@playwright/test";
import { gotoTestMode, test } from "./base-fixtures.js";

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const SEVEN = 7;

type CellSnapshot = Readonly<{
  column: number;
  row: number;
}>;

type SourceEnemyIndex = typeof ZERO | typeof ONE;

type EnemyScenarioSnapshot = Readonly<{
  cell: CellSnapshot;
  sourceIndex: SourceEnemyIndex;
  spawnOrder: number;
}>;

type GridEnemyScenario = Readonly<{
  enemies: ReadonlyArray<EnemyScenarioSnapshot>;
  expectedEnemies: ReadonlyArray<CellSnapshot>;
  name: string;
  playerCell: CellSnapshot;
}>;

type GridEnemyBrowserContext = Readonly<{
  boardSize: number;
  firstEnemyIndex: SourceEnemyIndex;
  frameStep: number;
  stateVersion: number;
}>;

type GridEnemyBrowserPayload = Readonly<{
  constants: GridEnemyBrowserContext;
  scenario: GridEnemyScenario;
}>;

const GRID_ENEMY_BROWSER_CONTEXT: GridEnemyBrowserContext = {
  boardSize: SEVEN,
  firstEnemyIndex: ZERO,
  frameStep: ONE,
  stateVersion: THREE,
};

const GRID_ENEMY_SCENARIOS: ReadonlyArray<GridEnemyScenario> = [
  {
    enemies: [
      {
        cell: { column: TWO, row: ZERO },
        sourceIndex: ZERO,
        spawnOrder: ZERO,
      },
    ],
    expectedEnemies: [{ column: THREE, row: ZERO }],
    name: "accepts movement into an open cell",
    playerCell: { column: FOUR, row: ONE },
  },
  {
    enemies: [
      {
        cell: { column: THREE, row: ZERO },
        sourceIndex: ZERO,
        spawnOrder: ZERO,
      },
    ],
    expectedEnemies: [{ column: THREE, row: ZERO }],
    name: "blocks movement into the player cell",
    playerCell: { column: FOUR, row: ONE },
  },
  {
    enemies: [
      {
        cell: { column: TWO, row: ZERO },
        sourceIndex: ZERO,
        spawnOrder: ZERO,
      },
      {
        cell: { column: THREE, row: ZERO },
        sourceIndex: ONE,
        spawnOrder: ONE,
      },
    ],
    expectedEnemies: [
      { column: TWO, row: ZERO },
      { column: THREE, row: ZERO },
    ],
    name: "blocks movement into an occupied enemy cell",
    playerCell: { column: FOUR, row: ONE },
  },
  {
    enemies: [
      {
        cell: { column: TWO, row: TWO },
        sourceIndex: ZERO,
        spawnOrder: ZERO,
      },
      {
        cell: { column: ONE, row: ONE },
        sourceIndex: ONE,
        spawnOrder: ONE,
      },
    ],
    expectedEnemies: [
      { column: TWO, row: ONE },
      { column: ONE, row: ONE },
    ],
    name: "blocks movement into a reserved enemy cell",
    playerCell: { column: TWO, row: ONE },
  },
  {
    enemies: [
      {
        cell: { column: TWO, row: ZERO },
        sourceIndex: ZERO,
        spawnOrder: ZERO,
      },
    ],
    expectedEnemies: [{ column: TWO, row: ZERO }],
    name: "keeps enemies still when the player does not move",
    playerCell: { column: FOUR, row: ZERO },
  },
];

const resolveGridEnemyScenario = (
  payload: GridEnemyBrowserPayload,
): ReadonlyArray<CellSnapshot> | null => {
  const { __bruffTestApi: testApi } = globalThis;
  const initialState = testApi?.getState();
  const [enemyZero, enemyOne] = initialState?.enemies ?? [];
  if (
    testApi === undefined ||
    initialState === undefined ||
    enemyZero === undefined ||
    enemyOne === undefined
  ) {
    return null;
  }

  const enemies = payload.scenario.enemies.map((enemySnapshot) => ({
    ...(enemySnapshot.sourceIndex === payload.constants.firstEnemyIndex
      ? enemyZero
      : enemyOne),
    cell: enemySnapshot.cell,
    spawnOrder: enemySnapshot.spawnOrder,
  }));

  testApi.loadState({
    ...initialState,
    board: {
      columns: payload.constants.boardSize,
      rows: payload.constants.boardSize,
    },
    enemies,
    player: {
      ...initialState.player,
      cell: payload.scenario.playerCell,
    },
    playerMoved: false,
    stateVersion: payload.constants.stateVersion,
  });
  testApi.dispatchInput("ArrowUp");
  return testApi
    .stepFrames(payload.constants.frameStep)
    .enemies.map((enemy) => ({
      column: enemy.cell.column,
      row: enemy.cell.row,
    }));
};

const loadGridEnemyScenario = (
  page: Page,
  scenario: GridEnemyScenario,
): Promise<ReadonlyArray<CellSnapshot> | null> =>
  page.evaluate(resolveGridEnemyScenario, {
    constants: GRID_ENEMY_BROWSER_CONTEXT,
    scenario,
  });

for (const scenario of GRID_ENEMY_SCENARIOS) {
  test(`resolves version 3 grid enemy movement: ${scenario.name}`, async ({
    page,
  }: {
    page: Page;
  }) => {
    await gotoTestMode(page);

    const snapshots = await loadGridEnemyScenario(page, scenario);

    expect(snapshots).toStrictEqual(scenario.expectedEnemies);
  });
}
