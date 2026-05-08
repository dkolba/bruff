import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it, vi } from "vitest";
import type { Enemy, GameState } from "./core/types.ts";
import { moveEnemyTowardPlayer } from "./move-enemy-toward-player.js";
import { updateEnemies } from "./update-enemies.js";

const ZERO = 0;
const ONE = 1;
const FIFTY_ONE = 51;
const ONE_HUNDRED_ONE = 101;
const TEST_SEED = 1;
const STATE_VERSION = 1;

vi.mock("./move-enemy-toward-player.ts", () => ({
  moveEnemyTowardPlayer: vi.fn((enemy: Enemy) => ({
    ...enemy,
    xPos: enemy.xPos + ONE,
  })),
}));

describe("updateEnemies", () => {
  it("should update all enemies", () => {
    const state: GameState = {
      canvas: { height: 600, width: 800 },
      enemies: [
        {
          id: brand<"EnemyId">("test-enemy-0"),
          size: 20,
          spawnOrder: ZERO,
          xPos: 50,
          yPos: 50,
        },
        {
          id: brand<"EnemyId">("test-enemy-1"),
          size: 20,
          spawnOrder: ONE,
          xPos: 100,
          yPos: 100,
        },
      ],
      input: [],
      player: {
        id: brand<"PlayerId">("test-player"),
        size: 20,
        xPos: 200,
        yPos: 200,
      },
      playerMoved: false,
      prng: createPrng(TEST_SEED),
      stateVersion: STATE_VERSION,
    };

    const updatedState = updateEnemies(state);

    expect(moveEnemyTowardPlayer).toHaveBeenCalledTimes(state.enemies.length);
    expect(updatedState.enemies[ZERO]?.xPos).toBe(FIFTY_ONE);
    expect(updatedState.enemies[ONE]?.xPos).toBe(ONE_HUNDRED_ONE);
  });
});
