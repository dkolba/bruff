import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
} from "../core/constants.js";
import type { Enemy, GameState, GridCell } from "../core/types.ts";
import { projectRenderCommands } from "./project-render-commands.js";

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FIVE = 5;
const ENEMY_SIZE = 20;
const GRID_CANVAS_HEIGHT = 350;
const GRID_CANVAS_WIDTH = 700;
const GRID_CELL_HEIGHT = 50;
const GRID_CELL_WIDTH = 100;
const PLAYER_SIZE = 20;
const TEST_SEED = 1;

type EnemyInput = Readonly<{
  cell: GridCell;
  id: string;
  spawnOrder: number;
}>;

type FillRectCommand = Readonly<{
  color: string;
  height: number;
  type: "fill-rect";
  width: number;
  xPos: number;
  yPos: number;
}>;

const createEnemy = (enemyInput: EnemyInput): Enemy => ({
  cell: enemyInput.cell,
  id: brand<"EnemyId">(enemyInput.id),
  size: ENEMY_SIZE,
  spawnOrder: enemyInput.spawnOrder,
});

const createState = (enemies: ReadonlyArray<Enemy>): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: 600, width: 800 },
  enemies,
  frameIndex: 0,
  input: [],
  player: {
    cell: { column: THREE, row: TWO },
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

const createGridState = (): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: GRID_CANVAS_HEIGHT, width: GRID_CANVAS_WIDTH },
  enemies: [
    createEnemy({
      cell: { column: ONE, row: FIVE },
      id: "test-enemy-0",
      spawnOrder: ZERO,
    }),
  ],
  frameIndex: 0,
  input: [],
  player: {
    cell: { column: THREE, row: TWO },
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

const playerCommandForState = (state: GameState): FillRectCommand => ({
  color: "blue",
  height: state.canvas.height / state.board.rows,
  type: "fill-rect",
  width: state.canvas.width / state.board.columns,
  xPos: state.player.cell.column * (state.canvas.width / state.board.columns),
  yPos: state.player.cell.row * (state.canvas.height / state.board.rows),
});

const enemyCommandForEnemy =
  (state: GameState) =>
  (enemy: Enemy): FillRectCommand => ({
    color: "red",
    height: state.canvas.height / state.board.rows,
    type: "fill-rect",
    width: state.canvas.width / state.board.columns,
    xPos: enemy.cell.column * (state.canvas.width / state.board.columns),
    yPos: enemy.cell.row * (state.canvas.height / state.board.rows),
  });

describe("projectRenderCommands", () => {
  it("emits one blue fill-rect command for the player", () => {
    const state = createState([]);

    const commands = projectRenderCommands(state);

    expect(commands[ZERO]).toStrictEqual(playerCommandForState(state));
  });

  it("emits only the player command when there are zero enemies", () => {
    const state = createState([]);

    expect(projectRenderCommands(state)).toStrictEqual([
      playerCommandForState(state),
    ]);
  });
});

describe("projectRenderCommands enemy commands", () => {
  it("emits red enemy commands in array order after the player", () => {
    const state = createState([
      createEnemy({
        cell: { column: ONE, row: ONE },
        id: "test-enemy-0",
        spawnOrder: ZERO,
      }),
      createEnemy({
        cell: { column: TWO, row: TWO },
        id: "test-enemy-1",
        spawnOrder: ONE,
      }),
    ]);
    const firstEnemy = state.enemies[ZERO];
    const secondEnemy = state.enemies[ONE];

    expect(projectRenderCommands(state)).toStrictEqual([
      playerCommandForState(state),
      firstEnemy === undefined
        ? undefined
        : enemyCommandForEnemy(state)(firstEnemy),
      secondEnemy === undefined
        ? undefined
        : enemyCommandForEnemy(state)(secondEnemy),
    ]);
  });

  it("returns deterministic commands for the same state", () => {
    const state = createState([
      createEnemy({
        cell: { column: ONE, row: ONE },
        id: "test-enemy-0",
        spawnOrder: ZERO,
      }),
      createEnemy({
        cell: { column: TWO, row: TWO },
        id: "test-enemy-1",
        spawnOrder: ONE,
      }),
    ]);

    expect(projectRenderCommands(state)).toStrictEqual(
      projectRenderCommands(state),
    );
  });
});

describe("projectRenderCommands grid rectangles", () => {
  it("derives player and enemy rectangles from board cells", () => {
    const state = createGridState();

    expect(projectRenderCommands(state)).toStrictEqual([
      {
        color: "blue",
        height: GRID_CELL_HEIGHT,
        type: "fill-rect",
        width: GRID_CELL_WIDTH,
        xPos: THREE * GRID_CELL_WIDTH,
        yPos: TWO * GRID_CELL_HEIGHT,
      },
      {
        color: "red",
        height: GRID_CELL_HEIGHT,
        type: "fill-rect",
        width: GRID_CELL_WIDTH,
        xPos: GRID_CELL_WIDTH,
        yPos: FIVE * GRID_CELL_HEIGHT,
      },
    ]);
  });
});
