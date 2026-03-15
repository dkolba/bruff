import { describe, expect, it } from "vitest";
import { ENEMY_SIZE, PLAYER_SIZE } from "./constants.js";
import createInitialState from "./create-initial-state.js";

describe("createInitialState", () => {
  it("should create an initial game state", () => {
    const canvas = {
      height: 600,
      width: 800,
    };

    const expectedState = {
      canvas: {
        height: 600,
        width: 800,
      },
      enemies: [
        {
          size: ENEMY_SIZE,
          xPos: 50,
          yPos: 50,
        },
        {
          size: ENEMY_SIZE,
          xPos: 300,
          yPos: 100,
        },
        {
          size: ENEMY_SIZE,
          xPos: 100,
          yPos: 300,
        },
      ],
      input: [],
      player: {
        size: PLAYER_SIZE,
        xPos: 200,
        yPos: 200,
      },
      playerMoved: false,
    };

    const result = createInitialState(canvas);

    expect(result).toEqual(expectedState);
  });
});
