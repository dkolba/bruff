/* eslint-disable max-lines-per-function, sort-imports -- Property cases keep arbitraries and assertions together. */
import { brand, createPrng } from "@bruff/utils";
import { describe, expect } from "vitest";
import { fc, test } from "@fast-check/vitest";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  ONE,
  PLAYER_SIZE,
  TWO,
  ZERO,
} from "../core/constants.js";
import type { GameAction, InputAction } from "../core/actions.ts";
import type { GameState, GridCell } from "../core/types.ts";
import updatePlayer from "./update-player.js";
import { cellForAction, isCellInsideBoard } from "./grid.js";

const STATE_VERSION = 1;
const TEST_SEED = 1;
const MIN_CANVAS = PLAYER_SIZE * TWO;
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
    fc
      .record({
        xPos: fc.integer({ max: canvasWidth - PLAYER_SIZE, min: 0 }),
        yPos: fc.integer({ max: canvasHeight - PLAYER_SIZE, min: 0 }),
      })
      .map(
        ({ xPos, yPos }): GameState => ({
          board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
          canvas: { height: canvasHeight, width: canvasWidth },
          enemies: [],
          frameIndex: 0,
          input: [],
          player: {
            cell,
            id: brand<"PlayerId">("test-player"),
            size: PLAYER_SIZE,
            xPos,
            yPos,
          },
          playerMoved: false,
          prng: createPrng(TEST_SEED),
          seed: TEST_SEED,
          stateVersion: STATE_VERSION,
        }),
      ),
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
      expect(
        next.board === undefined || next.player.cell === undefined
          ? false
          : isCellInsideBoard(next.player.cell, next.board),
      ).toBe(true);
    },
  );

  test.prop([interiorGameStateArb, movementActionArb])(
    "accepts unblocked interior grid movement",
    (state, action) => {
      const next = updatePlayer(state, action);
      const expectedCell =
        state.player.cell === undefined
          ? undefined
          : cellForAction(state.player.cell, action);

      expect(next.player.cell).toStrictEqual(expectedCell);
      expect(next.playerMoved).toBe(true);
    },
  );

  test.prop([gameStateArb, gameActionArb])(
    "keeps the player inside canvas bounds for any action",
    (state, action) => {
      const next = updatePlayer(state, action);
      expect(next.player.xPos).toBeGreaterThanOrEqual(ZERO);
      expect(next.player.yPos).toBeGreaterThanOrEqual(ZERO);
      expect(next.player.xPos).toBeLessThanOrEqual(
        next.canvas.width - PLAYER_SIZE,
      );
      expect(next.player.yPos).toBeLessThanOrEqual(
        next.canvas.height - PLAYER_SIZE,
      );
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
