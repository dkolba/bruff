import { brand, createPrng } from "@bruff/utils";
import { describe, expect } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { PLAYER_SIZE, TWO, ZERO } from "../core/constants.js";
import type { GameAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import updatePlayer from "./update-player.js";

const STATE_VERSION = 1;
const TEST_SEED = 1;
const MIN_CANVAS = PLAYER_SIZE * TWO;
const MAX_CANVAS = 4096;

const allActions: ReadonlyArray<GameAction> = [
  { type: "move-down" },
  { type: "move-left" },
  { type: "move-right" },
  { type: "move-up" },
  { type: "tick" },
];

const tickAction: GameAction = { type: "tick" };

const gameStateArb: fc.Arbitrary<GameState> = fc
  .record({
    canvasHeight: fc.integer({ max: MAX_CANVAS, min: MIN_CANVAS }),
    canvasWidth: fc.integer({ max: MAX_CANVAS, min: MIN_CANVAS }),
  })
  .chain(({ canvasHeight, canvasWidth }) =>
    fc
      .record({
        xPos: fc.integer({ max: canvasWidth - PLAYER_SIZE, min: 0 }),
        yPos: fc.integer({ max: canvasHeight - PLAYER_SIZE, min: 0 }),
      })
      .map(
        ({ xPos, yPos }): GameState => ({
          canvas: { height: canvasHeight, width: canvasWidth },
          enemies: [],
          frameIndex: 0,
          input: [],
          player: {
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

const gameActionArb: fc.Arbitrary<GameAction> = fc.constantFrom(...allActions);

describe("updatePlayer (property-based)", () => {
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
