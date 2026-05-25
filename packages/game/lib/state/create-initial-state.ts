import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  ENEMY_SIZE,
  FIVE,
  ONE,
  PLAYER_SIZE,
  TWO,
} from "../core/constants.js";
import {
  type Brand,
  brand,
  createPrng,
  nextId,
  type PrngState,
} from "@bruff/utils";
import type { GameState } from "../core/types.ts";

const INITIAL_SEED = 1;
const STATE_VERSION = 1;
const INITIAL_FRAME_INDEX = 0;

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
 * @param seed - Deterministic seed for entity identity and replay stability
 * @returns The initial game state
 */
// eslint-disable-next-line max-lines-per-function -- initial state construction is kept inline for deterministic readability.
const createInitialState = (
  canvas: {
    height: number;
    width: number;
  },
  seed: number = INITIAL_SEED,
): GameState => {
  const player = drawId<"PlayerId">(createPrng(seed));
  const enemy0 = drawId<"EnemyId">(player.prng);
  const enemy1 = drawId<"EnemyId">(enemy0.prng);
  const enemy2 = drawId<"EnemyId">(enemy1.prng);

  return {
    board: {
      columns: BOARD_COLUMNS,
      rows: BOARD_ROWS,
    },
    canvas: {
      height: canvas.height,
      width: canvas.width,
    },
    enemies: [
      {
        cell: { column: ONE, row: ONE },
        id: enemy0.id,
        size: ENEMY_SIZE,
        spawnOrder: 0,
        xPos: 50,
        yPos: 50,
      },
      {
        cell: { column: FIVE, row: ONE },
        id: enemy1.id,
        size: ENEMY_SIZE,
        spawnOrder: 1,
        xPos: 300,
        yPos: 100,
      },
      {
        cell: { column: ONE, row: FIVE },
        id: enemy2.id,
        size: ENEMY_SIZE,
        spawnOrder: 2,
        xPos: 100,
        yPos: 300,
      },
    ],
    frameIndex: INITIAL_FRAME_INDEX,
    input: [],
    player: {
      cell: { column: TWO + ONE, row: TWO + ONE },
      id: player.id,
      size: PLAYER_SIZE,
      xPos: 200,
      yPos: 200,
    },
    playerMoved: false,
    prng: enemy2.prng, // !TODO: use dedicated prng
    seed,
    stateVersion: STATE_VERSION,
  };
};

export default createInitialState;
