import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it, vi } from "vitest";

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
} from "../core/constants.js";
import type { GameState } from "../core/types.ts";
import render from "./render.js";

const THREE = 3;
const TEST_SEED = 1;
const ONE = 1;
const TWO = 2;
const CELL_SIZE = 100;

const setupRenderTest = (): {
  mockContext: CanvasRenderingContext2D;
  state: GameState;
} => {
  const canvas = document.createElement("canvas");
  const mockContext = canvas.getContext("2d");
  if (mockContext === null) {
    throw new TypeError("Failed to get context");
  }
  vi.spyOn(mockContext, "fillRect");

  const state: GameState = {
    board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
    canvas: { height: 700, width: 700 },
    enemies: [
      {
        cell: { column: ONE, row: ONE },
        id: brand<"EnemyId">("test-enemy-0"),
        size: 20,
        spawnOrder: 0,
      },
      {
        cell: { column: TWO, row: TWO },
        id: brand<"EnemyId">("test-enemy-1"),
        size: 20,
        spawnOrder: 1,
      },
    ],
    frameIndex: 0,
    input: [],
    player: {
      cell: { column: THREE, row: THREE },
      id: brand<"PlayerId">("test-player"),
      size: 20,
    },
    playerMoved: false,
    prng: createPrng(TEST_SEED),
    seed: TEST_SEED,
    stateVersion: CURRENT_STATE_VERSION,
  };

  return { mockContext, state };
};

describe("render", () => {
  it("should render the player and enemies", () => {
    const { mockContext, state } = setupRenderTest();

    const stats = render(state, mockContext);

    expect(vi.mocked(mockContext.fillRect).mock.calls).toStrictEqual([
      [THREE * CELL_SIZE, THREE * CELL_SIZE, CELL_SIZE, CELL_SIZE],
      [CELL_SIZE, CELL_SIZE, CELL_SIZE, CELL_SIZE],
      [TWO * CELL_SIZE, TWO * CELL_SIZE, CELL_SIZE, CELL_SIZE],
    ]);
    const fillStyleCalls = vi.mocked(mockContext.fillRect).mock.calls.length;
    expect(fillStyleCalls).toBe(THREE);
    expect(stats).toStrictEqual({
      enemiesDrawn: state.enemies.length,
      frameIndex: state.frameIndex,
      playerDrawn: true,
    });
  });
});
