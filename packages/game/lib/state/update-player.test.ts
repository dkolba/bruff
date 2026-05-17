import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import { PLAYER_SIZE, PLAYER_SPEED } from "../core/constants.js";
import type { GameAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import updatePlayer from "./update-player.js";

const ZERO = 0;
const TEST_SEED = 1;
const STATE_VERSION = 1;

const createBaseState = (): GameState => ({
  canvas: { height: 600, width: 800 },
  enemies: [],
  frameIndex: 0,
  input: [],
  player: {
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
    xPos: 200,
    yPos: 200,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: STATE_VERSION,
});

const MOVEMENT_TEST_CASES: ReadonlyArray<{
  action: GameAction;
  direction: string;
  expected: {
    xPos: (state: GameState) => number;
    yPos: (state: GameState) => number;
  };
}> = [
  {
    action: { type: "move-up" },
    direction: "up",
    expected: {
      xPos: (state) => state.player.xPos,
      yPos: (state) => state.player.yPos - PLAYER_SPEED,
    },
  },
  {
    action: { type: "move-down" },
    direction: "down",
    expected: {
      xPos: (state) => state.player.xPos,
      yPos: (state) => state.player.yPos + PLAYER_SPEED,
    },
  },
  {
    action: { type: "move-left" },
    direction: "left",
    expected: {
      xPos: (state) => state.player.xPos - PLAYER_SPEED,
      yPos: (state) => state.player.yPos,
    },
  },
  {
    action: { type: "move-right" },
    direction: "right",
    expected: {
      xPos: (state) => state.player.xPos + PLAYER_SPEED,
      yPos: (state) => state.player.yPos,
    },
  },
];

describe("updatePlayer", () => {
  it("leaves the player unchanged on a tick action", () => {
    const baseState = createBaseState();
    const updatedState = updatePlayer(baseState, { type: "tick" });
    expect(updatedState.player).toEqual(baseState.player);
    expect(updatedState.playerMoved).toBe(false);
  });

  it.each(MOVEMENT_TEST_CASES)(
    "moves the player $direction",
    ({ action, expected }) => {
      const baseState = createBaseState();
      const updatedState = updatePlayer(baseState, action);
      expect(updatedState.player.xPos).toBe(expected.xPos(baseState));
      expect(updatedState.player.yPos).toBe(expected.yPos(baseState));
      expect(updatedState.playerMoved).toBe(true);
    },
  );

  it("clamps the player position to the canvas boundaries", () => {
    const baseState = createBaseState();
    const cornered: GameState = {
      ...baseState,
      player: { ...baseState.player, xPos: ZERO, yPos: ZERO },
    };
    const afterUp = updatePlayer(cornered, { type: "move-up" });
    const afterLeft = updatePlayer(afterUp, { type: "move-left" });
    expect(afterLeft.player.xPos).toBe(ZERO);
    expect(afterLeft.player.yPos).toBe(ZERO);
  });
});
