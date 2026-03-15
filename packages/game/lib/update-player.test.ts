import { describe, expect, it } from "vitest";
import { PLAYER_SIZE, PLAYER_SPEED } from "./constants.js";
import type { GameState } from "../types/game-state-type.ts";
import updatePlayer from "./update-player.js";

const ZERO = 0;

const createBaseState = (): GameState => ({
  canvas: { height: 600, width: 800 },
  enemies: [],
  input: [],
  player: { size: PLAYER_SIZE, xPos: 200, yPos: 200 },
  playerMoved: false,
});

const MOVEMENT_TEST_CASES = [
  {
    direction: "up",
    expected: {
      xPos: (state: GameState) => state.player.xPos,
      yPos: (state: GameState) => state.player.yPos - PLAYER_SPEED,
    },
    input: "arrowup",
  },
  {
    direction: "down",
    expected: {
      xPos: (state: GameState) => state.player.xPos,
      yPos: (state: GameState) => state.player.yPos + PLAYER_SPEED,
    },
    input: "arrowdown",
  },
  {
    direction: "left",
    expected: {
      xPos: (state: GameState) => state.player.xPos - PLAYER_SPEED,
      yPos: (state: GameState) => state.player.yPos,
    },
    input: "arrowleft",
  },
  {
    direction: "right",
    expected: {
      xPos: (state: GameState) => state.player.xPos + PLAYER_SPEED,
      yPos: (state: GameState) => state.player.yPos,
    },
    input: "arrowright",
  },
];

describe("updatePlayer", () => {
  it("should not move the player if there is no input", () => {
    const baseState = createBaseState();
    const updatedState = updatePlayer(baseState);
    expect(updatedState.player.xPos).toBe(baseState.player.xPos);
    expect(updatedState.player.yPos).toBe(baseState.player.yPos);
    expect(updatedState.playerMoved).toBe(false);
  });

  it.each(MOVEMENT_TEST_CASES)(
    "should move the player $direction",
    ({ expected, input }) => {
      const baseState = createBaseState();
      const state = { ...baseState, input: [input] };
      const updatedState = updatePlayer(state);
      expect(updatedState.player.xPos).toBe(expected.xPos(baseState));
      expect(updatedState.player.yPos).toBe(expected.yPos(baseState));
      expect(updatedState.playerMoved).toBe(true);
    },
  );

  it("should clamp the player position to the canvas boundaries", () => {
    const baseState = createBaseState();
    const state = {
      ...baseState,
      input: ["arrowup", "arrowleft"],
      player: { ...baseState.player, xPos: ZERO, yPos: ZERO },
    };
    const updatedState = updatePlayer(state);
    expect(updatedState.player.xPos).toBe(ZERO);
    expect(updatedState.player.yPos).toBe(ZERO);
  });
});
