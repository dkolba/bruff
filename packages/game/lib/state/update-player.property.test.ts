import { brand, createPrng } from "@bruff/utils";
import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";

import type { GameAction, InputAction } from "../core/actions.ts";
import { BOARD_COLUMNS, BOARD_ROWS, ONE, ZERO } from "../core/constants.js";
import type { GameState, GridCell } from "../core/types.ts";
import { cellForAction, isCellInsideBoard } from "./grid.js";
import updatePlayer from "./update-player.js";

const TEST_SEED = 1;
const MIN_CANVAS = 1;
const MAX_CANVAS = 4096;
const INTERIOR_MIN = ONE;

const allActions: ReadonlyArray<GameAction> = [
  { type: "move-down" },
  { type: "move-left" },
  { type: "move-right" },
  { type: "move-up" },
  { type: "tick" },
];

const tickAction: GameAction = { type: "tick" };
const movementActions: ReadonlyArray<InputAction> = [
  { type: "move-down" },
  { type: "move-left" },
  { type: "move-right" },
  { type: "move-up" },
];

const gridCellArb: fc.Arbitrary<GridCell> = fc.record({
  column: fc.integer({ max: BOARD_COLUMNS - ONE, min: ZERO }),
  row: fc.integer({ max: BOARD_ROWS - ONE, min: ZERO }),
});

const gameStateArb: fc.Arbitrary<GameState> = fc
  .record({
    canvasHeight: fc.integer({ max: MAX_CANVAS, min: MIN_CANVAS }),
    canvasWidth: fc.integer({ max: MAX_CANVAS, min: MIN_CANVAS }),
    cell: gridCellArb,
  })
  .chain(({ canvasHeight, canvasWidth, cell }) =>
    fc.constant({
      board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
      canvas: { height: canvasHeight, width: canvasWidth },
      enemies: [],
      frameIndex: 0,
      input: [],
      player: {
        cell,
        id: brand<"PlayerId">("test-player"),
        size: 20,
      },
      playerMoved: false,
      prng: createPrng(TEST_SEED),
      seed: TEST_SEED,
      stateVersion: 3,
    }),
  );

const interiorGameStateArb: fc.Arbitrary<GameState> = gameStateArb.map(
  (state): GameState => ({
    ...state,
    player: {
      ...state.player,
      cell: {
        column: INTERIOR_MIN,
        row: INTERIOR_MIN,
      },
    },
  }),
);

const gameActionArb: fc.Arbitrary<GameAction> = fc.constantFrom(...allActions);
const movementActionArb: fc.Arbitrary<InputAction> = fc.constantFrom(
  ...movementActions,
);

describe("updatePlayer (property-based)", () => {
  test.prop([gameStateArb, gameActionArb])(
    "keeps the player inside board bounds for any action",
    (state, action) => {
      const next = updatePlayer(state, action);
      expect(isCellInsideBoard(next.player.cell, next.board)).toBe(true);
    },
  );

  test.prop([interiorGameStateArb, movementActionArb])(
    "accepts unblocked interior grid movement",
    (state, action) => {
      const next = updatePlayer(state, action);
      const expectedCell = cellForAction(state.player.cell, action);

      expect(next.player.cell).toStrictEqual(expectedCell);
      expect(next.playerMoved).toBe(true);
    },
  );

  test.prop([gameStateArb, gameActionArb])(
    "is deterministic — same state and action produce equal results",
    (state, action) => {
      expect(updatePlayer(state, action)).toEqual(updatePlayer(state, action));
    },
  );

  test.prop([gameStateArb])(
    "tick action is an idempotent no-op for the player reducer",
    (state) => {
      const once = updatePlayer(state, tickAction);
      const twice = updatePlayer(once, tickAction);
      expect(once).toBe(state);
      expect(twice).toBe(state);
    },
  );
});
