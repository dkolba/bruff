import { brand, createPrng, nextId } from "@bruff/utils";
import type { GameState } from "../core/types.ts";
import { PLAYER_SIZE } from "../core/constants.js";

const INITIAL_SEED = 1;
const STATE_VERSION = 1;

/**
 * Creates the initial game state based on the canvas dimensions.
 *
 * @param canvas - Object containing the canvas dimensions
 * @returns The initial game state
 */
const createInitialState = (canvas: {
  height: number;
  width: number;
}): GameState => {
  const seedPrng = createPrng(INITIAL_SEED);
  const { prng, value: playerIdRaw } = nextId(seedPrng);
  const playerId = brand<"PlayerId">(playerIdRaw);

  return {
    canvas: {
      height: canvas.height,
      width: canvas.width,
    },
    enemies: [],
    input: [],
    player: {
      id: playerId,
      size: PLAYER_SIZE,
      xPos: 200,
      yPos: 200,
    },
    playerMoved: false,
    prng,
    stateVersion: STATE_VERSION,
  };
};

export default createInitialState;
