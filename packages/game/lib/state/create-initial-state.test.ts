import { describe, expect, it } from "vitest";
import { ENEMY_SIZE, PLAYER_SIZE } from "../core/constants.js";
import createInitialState from "./create-initial-state.js";

describe("createInitialState", () => {
  it("should create an initial game state with the given canvas size", () => {
    const canvas = { height: 600, width: 800 };
    const state = createInitialState(canvas);

    expect(state).toMatchObject({
      canvas: { height: 600, width: 800 },
      enemies: [
        { size: ENEMY_SIZE, spawnOrder: 0, xPos: 50, yPos: 50 },
        { size: ENEMY_SIZE, spawnOrder: 1, xPos: 300, yPos: 100 },
        { size: ENEMY_SIZE, spawnOrder: 2, xPos: 100, yPos: 300 },
      ],
      frameIndex: 0,
      input: [],
      player: { size: PLAYER_SIZE, xPos: 200, yPos: 200 },
      playerMoved: false,
      seed: 1,
      stateVersion: 1,
    });
    expect(typeof state.player.id).toBe("string");
    expect(state.prng).toBeDefined();
  });

  it("should produce the same state for the same canvas size (deterministic)", () => {
    const canvas = { height: 600, width: 800 };
    const stateA = createInitialState(canvas);
    const stateB = createInitialState(canvas);
    expect(stateA.player.id).toBe(stateB.player.id);
    expect(stateA.enemies.map((enemy) => enemy.id)).toEqual(
      stateB.enemies.map((enemy) => enemy.id),
    );
  });
});
