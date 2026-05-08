import { describe, expect, it } from "vitest";
import createInitialState from "./create-initial-state.js";
import { PLAYER_SIZE } from "./core/constants.js";

describe("createInitialState", () => {
  it("should create an initial game state with the given canvas size", () => {
    const canvas = { height: 600, width: 800 };
    const state = createInitialState(canvas);

    expect(state).toMatchObject({
      canvas: { height: 600, width: 800 },
      enemies: [],
      input: [],
      player: { size: PLAYER_SIZE, xPos: 200, yPos: 200 },
      playerMoved: false,
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
  });
});
