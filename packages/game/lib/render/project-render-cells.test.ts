import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
} from "../core/constants.js";
import type { Enemy, GameState, GridCell } from "../core/types.ts";
import { projectRenderCells } from "./project-render-cells.js";

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const ENEMY_SIZE = 20;
const PLAYER_SIZE = 20;
const TEST_SEED = 1;

type EnemyInput = Readonly<{
  cell: GridCell;
  id: string;
  spawnOrder: number;
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

describe("projectRenderCells", () => {
  it("projects the player before enemies", () => {
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

    expect(projectRenderCells(state)).toStrictEqual([
      { cell: state.player.cell, entity: "player" },
      {
        cell: { column: ONE, row: ONE },
        entity: "enemy",
        spawnOrder: ZERO,
      },
      {
        cell: { column: TWO, row: TWO },
        entity: "enemy",
        spawnOrder: ONE,
      },
    ]);
  });

  it("keeps renderer-neutral cells independent of canvas dimensions", () => {
    const state = createState([]);

    expect(projectRenderCells(state)).toStrictEqual([
      { cell: { column: THREE, row: TWO }, entity: "player" },
    ]);
  });
});
