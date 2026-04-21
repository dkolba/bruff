import { ENEMY_SIZE, PLAYER_SIZE } from "./constants.js";
import type { GameState } from "../types/game-state-type.ts";

/**
 * Creates the initial game state based on the canvas dimensions.
 *
 * @param canvas - Object containing the canvas dimensions
 * @returns The initial game state
 */
const createInitialState = (canvas: {
  height: number;
  width: number;
}): GameState => ({
  canvas: {
    height: canvas.height,
    width: canvas.width,
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
});

export default createInitialState;
