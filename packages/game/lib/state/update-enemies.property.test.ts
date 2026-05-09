import { brand, createPrng } from "@bruff/utils";
import { describe, expect } from "vitest";
import type { Enemy, GameState } from "../core/types.ts";
import { ENEMY_SIZE, PLAYER_SIZE, TWO, ZERO } from "../core/constants.js";
import { fc, test } from "@fast-check/vitest";
import type { GameAction } from "../core/actions.ts";
import { updateEnemies } from "./update-enemies.js";

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
        enemies: fc.array(
          fc.record({
            xPos: fc.integer({ max: canvasWidth - ENEMY_SIZE, min: 0 }),
            yPos: fc.integer({ max: canvasHeight - ENEMY_SIZE, min: 0 }),
          }),
          { maxLength: 10, minLength: 0 },
        ),
        playerXPos: fc.integer({ max: canvasWidth - PLAYER_SIZE, min: 0 }),
        playerYPos: fc.integer({ max: canvasHeight - PLAYER_SIZE, min: 0 }),
      })
      .map(
        ({ enemies, playerXPos, playerYPos }): GameState => ({
          canvas: { height: canvasHeight, width: canvasWidth },
          enemies: enemies.map(
            ({ xPos, yPos }, index): Enemy => ({
              id: brand<"EnemyId">(`test-enemy-${index}`),
              size: ENEMY_SIZE,
              spawnOrder: index,
              xPos,
              yPos,
            }),
          ),
          input: [],
          player: {
            id: brand<"PlayerId">("test-player"),
            size: PLAYER_SIZE,
            xPos: playerXPos,
            yPos: playerYPos,
          },
          playerMoved: false,
          prng: createPrng(TEST_SEED),
          stateVersion: STATE_VERSION,
        }),
      ),
  );

const gameActionArb: fc.Arbitrary<GameAction> = fc.constantFrom(...allActions);

describe("updateEnemies (property-based)", () => {
  test.prop([gameStateArb, gameActionArb])(
    "enemy count is invariant under any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      expect(next.enemies.length).toBe(state.enemies.length);
    },
  );

  test.prop([gameStateArb, gameActionArb])(
    "every enemy stays inside canvas bounds after any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      // eslint-disable-next-line unicorn/no-array-for-each -- C-17 prefers declarative iteration; this asserts per-element invariants.
      next.enemies.forEach((enemy) => {
        expect(enemy.xPos).toBeGreaterThanOrEqual(ZERO);
        expect(enemy.yPos).toBeGreaterThanOrEqual(ZERO);
        expect(enemy.xPos).toBeLessThanOrEqual(next.canvas.width - ENEMY_SIZE);
        expect(enemy.yPos).toBeLessThanOrEqual(next.canvas.height - ENEMY_SIZE);
      });
    },
  );

  test.prop([gameStateArb])("tick preserves enemy count exactly", (state) => {
    const next = updateEnemies(state, tickAction);
    expect(next.enemies.length).toBe(state.enemies.length);
  });

  test.prop([gameStateArb, gameActionArb])(
    "is deterministic — same state and action produce equal results",
    (state, action) => {
      expect(updateEnemies(state, action)).toEqual(
        updateEnemies(state, action),
      );
    },
  );
});
