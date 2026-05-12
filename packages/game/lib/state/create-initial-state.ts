import {
  type Brand,
  brand,
  createPrng,
  nextId,
  type PrngState,
} from "@bruff/utils";
import { ENEMY_SIZE, PLAYER_SIZE } from "../core/constants.js";
import type { GameState } from "../core/types.ts";

const INITIAL_SEED = 1;
const STATE_VERSION = 1;

const drawId = <Tag extends string>(
  prng: PrngState,
): { id: Brand<string, Tag>; prng: PrngState } => {
  const step = nextId(prng);
  return { id: brand<Tag>(step.value), prng: step.prng };
};

/**
 * Creates the initial game state based on the canvas dimensions.
 * Seeds the PRNG, mints deterministic entity IDs, and places three
 * enemies at fixed starting positions. The hardcoded seed positions
 * are a placeholder until a spawn-driven simulation lands; the IDs
 * themselves come from the PRNG so the architecture invariant from
 * A-12 is preserved.
 *
 * @param canvas - Object containing the canvas dimensions
 * @returns The initial game state
 */
const createInitialState = (canvas: {
  height: number;
  width: number;
}): GameState => {
  const player = drawId<"PlayerId">(createPrng(INITIAL_SEED));
  const enemy0 = drawId<"EnemyId">(player.prng);
  const enemy1 = drawId<"EnemyId">(enemy0.prng);
  const enemy2 = drawId<"EnemyId">(enemy1.prng);

  return {
    canvas: {
      height: canvas.height,
      width: canvas.width,
    },
    enemies: [
      {
        id: enemy0.id,
        size: ENEMY_SIZE,
        spawnOrder: 0,
        xPos: 50,
        yPos: 50,
      },
      {
        id: enemy1.id,
        size: ENEMY_SIZE,
        spawnOrder: 1,
        xPos: 300,
        yPos: 100,
      },
      {
        id: enemy2.id,
        size: ENEMY_SIZE,
        spawnOrder: 2,
        xPos: 100,
        yPos: 300,
      },
    ],
    input: [],
    player: {
      id: player.id,
      size: PLAYER_SIZE,
      xPos: 200,
      yPos: 200,
    },
    playerMoved: false,
    prng: enemy2.prng, // !TODO: use dedicated prng
    stateVersion: STATE_VERSION,
  };
};

export default createInitialState;
