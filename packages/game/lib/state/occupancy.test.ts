import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  ONE,
  PLAYER_SIZE,
  TWO,
  ZERO,
} from "../core/constants.js";
import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import type { Enemy, GameState, GridCell } from "../core/types.ts";
import { isCellOccupiedByActor, isCellOccupiedByEnemy } from "./occupancy.js";

const PLAYER_CELL: GridCell = { column: ONE, row: ONE };
const ENEMY_CELL: GridCell = { column: TWO, row: ONE };
const EMPTY_CELL: GridCell = { column: TWO, row: TWO };

const createEnemy = (cell: GridCell): Enemy => ({
  cell,
  id: brand<"EnemyId">("test-enemy"),
  size: ENEMY_SIZE,
  spawnOrder: ZERO,
});

const createState = (): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: 700, width: 700 },
  enemies: [createEnemy(ENEMY_CELL)],
  frameIndex: ZERO,
  input: [],
  player: {
    cell: PLAYER_CELL,
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
  },
  playerMoved: false,
  prng: createPrng(ONE),
  seed: ONE,
  stateVersion: CURRENT_STATE_VERSION,
});

describe("isCellOccupiedByEnemy", () => {
  it("returns true when an enemy occupies the cell", () => {
    expect(isCellOccupiedByEnemy(ENEMY_CELL, createState().enemies)).toBe(true);
  });

  it("returns false when no enemy occupies the cell", () => {
    expect(isCellOccupiedByEnemy(EMPTY_CELL, createState().enemies)).toBe(
      false,
    );
  });
});

describe("isCellOccupiedByActor", () => {
  it("returns true when the player occupies the cell", () => {
    expect(isCellOccupiedByActor(PLAYER_CELL, createState())).toBe(true);
  });

  it("returns true when an enemy occupies the cell", () => {
    expect(isCellOccupiedByActor(ENEMY_CELL, createState())).toBe(true);
  });

  it("returns false when no actor occupies the cell", () => {
    expect(isCellOccupiedByActor(EMPTY_CELL, createState())).toBe(false);
  });
});
