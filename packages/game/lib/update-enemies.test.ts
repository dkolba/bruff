import { describe, expect, it, vi } from "vitest";
import type { Enemy, GameState } from "../types/game-state-type.ts";
import { moveEnemyTowardPlayer } from "./move-enemy-toward-player.js";
import { updateEnemies } from "./update-enemies.js";

const ZERO = 0;
const ONE = 1;
const FIFTY_ONE = 51;
const ONE_HUNDRED_ONE = 101;

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
        { size: 20, xPos: 50, yPos: 50 },
        { size: 20, xPos: 100, yPos: 100 },
      ],
      input: [],
      player: { size: 20, xPos: 200, yPos: 200 },
      playerMoved: false,
    };

    const updatedState = updateEnemies(state);

    expect(moveEnemyTowardPlayer).toHaveBeenCalledTimes(state.enemies.length);
    expect(updatedState.enemies[ZERO]?.xPos).toBe(FIFTY_ONE);
    expect(updatedState.enemies[ONE]?.xPos).toBe(ONE_HUNDRED_ONE);
  });
});
