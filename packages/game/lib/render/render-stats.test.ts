import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
} from "../core/constants.js";
import type { Enemy, GameState } from "../core/types.ts";
import { renderStatsForState } from "./render-stats.js";

const ZERO = 0;
const ONE = 1;
const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 800;
const ENEMY_SIZE = 20;
const PLAYER_SIZE = 20;
const TEST_SEED = 1;
const FRAME_INDEX = 7;

const createEnemy = (id: string, spawnOrder: number): Enemy => ({
  cell: { column: spawnOrder, row: spawnOrder },
  id: brand<"EnemyId">(id),
  size: ENEMY_SIZE,
  spawnOrder,
});

const createState = (
  enemies: ReadonlyArray<Enemy>,
  frameIndex: number,
): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: CANVAS_HEIGHT, width: CANVAS_WIDTH },
  enemies,
  frameIndex,
  input: [],
  player: {
    cell: { column: ONE, row: ONE },
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

describe("renderStatsForState", () => {
  it("uses the initial frame index from state", () => {
    const state = createState([], ZERO);

    expect(renderStatsForState(state)).toStrictEqual({
      enemiesDrawn: ZERO,
      frameIndex: ZERO,
      playerDrawn: true,
    });
  });

  it("reports zero enemies for a state with no enemies", () => {
    const state = createState([], FRAME_INDEX);

    expect(renderStatsForState(state)).toStrictEqual({
      enemiesDrawn: ZERO,
      frameIndex: FRAME_INDEX,
      playerDrawn: true,
    });
  });

  it("reports nonzero enemies from state", () => {
    const state = createState(
      [createEnemy("test-enemy-0", ZERO), createEnemy("test-enemy-1", ONE)],
      FRAME_INDEX,
    );

    expect(renderStatsForState(state)).toStrictEqual({
      enemiesDrawn: state.enemies.length,
      frameIndex: FRAME_INDEX,
      playerDrawn: true,
    });
  });

  it("always reports that the player is drawn", () => {
    const state = createState([createEnemy("test-enemy-0", ZERO)], FRAME_INDEX);

    expect(renderStatsForState(state).playerDrawn).toBe(true);
  });
});
