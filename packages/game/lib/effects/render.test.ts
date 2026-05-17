import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it, vi } from "vitest";
import type { GameState } from "../core/types.ts";
import render from "./render.js";

const THREE = 3;
const TEST_SEED = 1;
const STATE_VERSION = 1;
const ZERO = 0;
const ONE = 1;

const setupRenderTest = (): {
  mockContext: CanvasRenderingContext2D;
  state: GameState;
} => {
  const canvas = document.createElement("canvas");
  const mockContext = canvas.getContext("2d");
  if (mockContext === null) {
    throw new TypeError("Failed to get context");
  }
  vi.spyOn(mockContext, "fillRect");

  const state: GameState = {
    canvas: { height: 600, width: 800 },
    enemies: [
      {
        id: brand<"EnemyId">("test-enemy-0"),
        size: 20,
        spawnOrder: 0,
        xPos: 50,
        yPos: 50,
      },
      {
        id: brand<"EnemyId">("test-enemy-1"),
        size: 20,
        spawnOrder: 1,
        xPos: 100,
        yPos: 100,
      },
    ],
    frameIndex: 0,
    input: [],
    player: {
      id: brand<"PlayerId">("test-player"),
      size: 20,
      xPos: 200,
      yPos: 200,
    },
    playerMoved: false,
    prng: createPrng(TEST_SEED),
    seed: TEST_SEED,
    stateVersion: STATE_VERSION,
  };

  return { mockContext, state };
};

describe("render", () => {
  it("should render the player and enemies", () => {
    const { mockContext, state } = setupRenderTest();

    const stats = render(state, mockContext);

    expect(vi.mocked(mockContext.fillRect).mock.calls).toStrictEqual([
      [
        state.player.xPos,
        state.player.yPos,
        state.player.size,
        state.player.size,
      ],
      [
        state.enemies[ZERO]?.xPos,
        state.enemies[ZERO]?.yPos,
        state.enemies[ZERO]?.size,
        state.enemies[ZERO]?.size,
      ],
      [
        state.enemies[ONE]?.xPos,
        state.enemies[ONE]?.yPos,
        state.enemies[ONE]?.size,
        state.enemies[ONE]?.size,
      ],
    ]);
    const fillStyleCalls = vi.mocked(mockContext.fillRect).mock.calls.length;
    expect(fillStyleCalls).toBe(THREE);
    expect(stats).toStrictEqual({
      enemiesDrawn: state.enemies.length,
      frameIndex: state.frameIndex,
      playerDrawn: true,
    });
  });
});
