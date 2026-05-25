/* eslint-disable sort-imports -- Test imports are grouped by fixture dependency role. */
import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import { advanceGameState } from "./advance-game-state.js";
import type { GameState } from "../core/types.ts";
import {
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  PLAYER_SIZE,
} from "../core/constants.js";

const TEST_SEED = 1;
const ZERO = 0;
const ONE = 1;
const TWO = 2;

const createState = (): GameState => ({
  board: { columns: 7, rows: 7 },
  canvas: { height: 600, width: 800 },
  enemies: [
    {
      cell: { column: TWO, row: ZERO },
      id: brand<"EnemyId">("test-enemy"),
      size: 20,
      spawnOrder: ZERO,
      xPos: 50,
      yPos: 50,
    },
  ],
  frameIndex: ZERO,
  input: [],
  player: {
    cell: { column: ZERO, row: ZERO },
    id: brand<"PlayerId">("test-player"),
    size: 20,
    xPos: ZERO,
    yPos: ZERO,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

const createGridState = (): GameState => ({
  board: { columns: 7, rows: 7 },
  canvas: { height: 600, width: 800 },
  enemies: [
    {
      cell: { column: TWO, row: ZERO },
      id: brand<"EnemyId">("test-grid-enemy"),
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TWO,
      yPos: ZERO,
    },
  ],
  frameIndex: ZERO,
  input: [],
  player: {
    cell: { column: ZERO, row: ZERO },
    id: brand<"PlayerId">("test-grid-player"),
    size: PLAYER_SIZE,
    xPos: ZERO,
    yPos: ZERO,
  },
  playerMoved: true,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

describe("advanceGameState", () => {
  it("does not advance a logical tick without input", () => {
    const state = createState();

    expect(advanceGameState(state, [])).toStrictEqual(state);
  });

  it("advances exactly one logical tick after queued input", () => {
    const state = createState();

    const nextState = advanceGameState(state, [{ type: "move-right" }]);

    expect(nextState.frameIndex).toBe(ONE);
    expect(nextState.player.cell).toStrictEqual({ column: ONE, row: ZERO });
    expect(nextState.enemies[ZERO]?.cell).toStrictEqual({
      column: TWO,
      row: ZERO,
    });
  });

  it("does not advance enemies after a blocked-only grid input", () => {
    const state = createGridState();

    const nextState = advanceGameState(state, [{ type: "move-left" }]);

    expect(nextState.frameIndex).toBe(ONE);
    expect(nextState.playerMoved).toBe(false);
    expect(nextState.player.cell).toStrictEqual({ column: ZERO, row: ZERO });
    expect(nextState.enemies[ZERO]?.cell).toStrictEqual({
      column: TWO,
      row: ZERO,
    });
  });
});
