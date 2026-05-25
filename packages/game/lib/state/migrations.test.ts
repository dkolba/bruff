/* eslint-disable max-lines-per-function, sort-imports -- Migration fixtures group constants, IDs, and state shape together. */
import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import type { GameState } from "../core/types.ts";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  PLAYER_SIZE,
  ZERO,
} from "../core/constants.js";
import { migrateV1toV2 } from "./migrations.js";

const TEST_SEED = 1;
const VERSION_ONE = 1;
const CANVAS_SIZE = 700;

const createVersionOneState = (): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: CANVAS_SIZE, width: CANVAS_SIZE },
  enemies: [
    {
      cell: { column: 1, row: 1 },
      id: brand<"EnemyId">("test-enemy-0"),
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: 100,
      yPos: 100,
    },
    {
      cell: { column: 6, row: 6 },
      id: brand<"EnemyId">("test-enemy-1"),
      size: ENEMY_SIZE,
      spawnOrder: 1,
      xPos: 699,
      yPos: 699,
    },
  ],
  frameIndex: 4,
  input: [],
  player: {
    cell: { column: 3, row: 2 },
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
    xPos: 350,
    yPos: 250,
  },
  playerMoved: true,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: VERSION_ONE,
});

describe("migrateV1toV2", () => {
  it("adds board and actor cells derived from version 1 pixel positions", () => {
    const state = createVersionOneState();

    const migratedState = migrateV1toV2(state);

    expect(migratedState.board).toStrictEqual({
      columns: BOARD_COLUMNS,
      rows: BOARD_ROWS,
    });
    expect(migratedState.stateVersion).toBe(CURRENT_STATE_VERSION);
    expect(migratedState.player.cell).toStrictEqual({ column: 3, row: 2 });
    expect(migratedState.enemies.map((enemy) => enemy.cell)).toStrictEqual([
      { column: 1, row: 1 },
      { column: 6, row: 6 },
    ]);
  });

  it("preserves existing deterministic state fields", () => {
    const state = createVersionOneState();

    const migratedState = migrateV1toV2(state);

    expect(migratedState.canvas).toStrictEqual(state.canvas);
    expect(migratedState.frameIndex).toBe(state.frameIndex);
    expect(migratedState.input).toStrictEqual(state.input);
    expect(migratedState.playerMoved).toBe(state.playerMoved);
    expect(migratedState.prng).toStrictEqual(state.prng);
    expect(migratedState.seed).toBe(state.seed);
  });

  it("clamps derived cells inside the board", () => {
    const state = {
      ...createVersionOneState(),
      enemies: [
        {
          cell: { column: ZERO, row: 6 },
          id: brand<"EnemyId">("test-enemy-0"),
          size: ENEMY_SIZE,
          spawnOrder: ZERO,
          xPos: -1,
          yPos: 701,
        },
      ],
      player: {
        ...createVersionOneState().player,
        xPos: 701,
        yPos: -1,
      },
    };

    const migratedState = migrateV1toV2(state);

    expect(migratedState.player.cell).toStrictEqual({ column: 6, row: 0 });
    expect(migratedState.enemies[ZERO]?.cell).toStrictEqual({
      column: 0,
      row: 6,
    });
  });
});
