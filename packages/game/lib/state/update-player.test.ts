/* eslint-disable max-lines-per-function -- Movement cases stay grouped for readability. */
import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import type { GameAction } from "../core/actions.ts";
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
import type { GameState, GridCell } from "../core/types.ts";
import updatePlayer from "./update-player.js";

const TEST_SEED = 1;
const TEST_PLAYER_CELL: GridCell = { column: TWO, row: TWO };

const createBaseState = (): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: 600, width: 800 },
  enemies: [],
  frameIndex: 0,
  input: [],
  player: {
    cell: TEST_PLAYER_CELL,
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

const MOVEMENT_TEST_CASES: ReadonlyArray<{
  action: GameAction;
  direction: string;
  expected: {
    cell: GridCell;
  };
}> = [
  {
    action: { type: "move-up" },
    direction: "up",
    expected: {
      cell: {
        column: TEST_PLAYER_CELL.column,
        row: TEST_PLAYER_CELL.row - ONE,
      },
    },
  },
  {
    action: { type: "move-down" },
    direction: "down",
    expected: {
      cell: {
        column: TEST_PLAYER_CELL.column,
        row: TEST_PLAYER_CELL.row + ONE,
      },
    },
  },
  {
    action: { type: "move-left" },
    direction: "left",
    expected: {
      cell: {
        column: TEST_PLAYER_CELL.column - ONE,
        row: TEST_PLAYER_CELL.row,
      },
    },
  },
  {
    action: { type: "move-right" },
    direction: "right",
    expected: {
      cell: {
        column: TEST_PLAYER_CELL.column + ONE,
        row: TEST_PLAYER_CELL.row,
      },
    },
  },
];

describe("updatePlayer", () => {
  it("leaves the player unchanged on a tick action", () => {
    const baseState = createBaseState();
    const updatedState = updatePlayer(baseState, { type: "tick" });
    expect(updatedState.player).toEqual(baseState.player);
    expect(updatedState.playerMoved).toBe(false);
  });

  it.each(MOVEMENT_TEST_CASES)(
    "moves the player $direction",
    ({ action, expected }) => {
      const baseState = createBaseState();
      const updatedState = updatePlayer(baseState, action);
      expect(updatedState.player.cell).toStrictEqual(expected.cell);
      expect(updatedState.playerMoved).toBe(true);
    },
  );

  it("clamps the player position to the canvas boundaries", () => {
    const baseState = createBaseState();
    const cornered: GameState = {
      ...baseState,
      player: {
        ...baseState.player,
        cell: { column: ZERO, row: ZERO },
      },
    };
    const afterUp = updatePlayer(cornered, { type: "move-up" });
    const afterLeft = updatePlayer(afterUp, { type: "move-left" });
    expect(afterLeft.player.cell).toStrictEqual({ column: ZERO, row: ZERO });
  });

  it("blocks movement into an enemy-occupied cell", () => {
    const baseState = createBaseState();
    const blockedState: GameState = {
      ...baseState,
      enemies: [
        {
          cell: {
            column: TEST_PLAYER_CELL.column + ONE,
            row: TEST_PLAYER_CELL.row,
          },
          id: brand<"EnemyId">("blocking-enemy"),
          size: ENEMY_SIZE,
          spawnOrder: ZERO,
        },
      ],
    };

    const updatedState = updatePlayer(blockedState, { type: "move-right" });

    expect(updatedState.player).toStrictEqual(blockedState.player);
    expect(updatedState.playerMoved).toBe(false);
  });
});
