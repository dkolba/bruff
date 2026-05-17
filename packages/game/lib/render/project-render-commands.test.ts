import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import type { Enemy, GameState } from "../core/types.ts";
import { projectRenderCommands } from "./project-render-commands.js";

const ZERO = 0;
const ONE = 1;
const ENEMY_SIZE = 20;
const FIFTY = 50;
const ONE_HUNDRED = 100;
const PLAYER_SIZE = 20;
const PLAYER_X_POS = 200;
const PLAYER_Y_POS = 200;
const TEST_SEED = 1;
const STATE_VERSION = 1;

type EnemyInput = Readonly<{
  id: string;
  spawnOrder: number;
  xPos: number;
  yPos: number;
}>;

type FillRectCommand = Readonly<{
  color: string;
  height: number;
  type: "fill-rect";
  width: number;
  xPos: number;
  yPos: number;
}>;

const createEnemy = (enemyInput: EnemyInput): Enemy => ({
  id: brand<"EnemyId">(enemyInput.id),
  size: ENEMY_SIZE,
  spawnOrder: enemyInput.spawnOrder,
  xPos: enemyInput.xPos,
  yPos: enemyInput.yPos,
});

const createState = (enemies: ReadonlyArray<Enemy>): GameState => ({
  canvas: { height: 600, width: 800 },
  enemies,
  frameIndex: 0,
  input: [],
  player: {
    id: brand<"PlayerId">("test-player"),
    size: PLAYER_SIZE,
    xPos: PLAYER_X_POS,
    yPos: PLAYER_Y_POS,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: STATE_VERSION,
});

const playerCommandForState = (state: GameState): FillRectCommand => ({
  color: "blue",
  height: state.player.size,
  type: "fill-rect",
  width: state.player.size,
  xPos: state.player.xPos,
  yPos: state.player.yPos,
});

const enemyCommandForEnemy = (enemy: Enemy): FillRectCommand => ({
  color: "red",
  height: enemy.size,
  type: "fill-rect",
  width: enemy.size,
  xPos: enemy.xPos,
  yPos: enemy.yPos,
});

describe("projectRenderCommands", () => {
  it("emits one blue fill-rect command for the player", () => {
    const state = createState([]);

    const commands = projectRenderCommands(state);

    expect(commands[ZERO]).toStrictEqual(playerCommandForState(state));
  });

  it("emits only the player command when there are zero enemies", () => {
    const state = createState([]);

    expect(projectRenderCommands(state)).toStrictEqual([
      playerCommandForState(state),
    ]);
  });
});

describe("projectRenderCommands enemy commands", () => {
  it("emits red enemy commands in array order after the player", () => {
    const state = createState([
      createEnemy({
        id: "test-enemy-0",
        spawnOrder: ZERO,
        xPos: FIFTY,
        yPos: FIFTY,
      }),
      createEnemy({
        id: "test-enemy-1",
        spawnOrder: ONE,
        xPos: ONE_HUNDRED,
        yPos: ONE_HUNDRED,
      }),
    ]);
    const firstEnemy = state.enemies[ZERO];
    const secondEnemy = state.enemies[ONE];

    expect(projectRenderCommands(state)).toStrictEqual([
      playerCommandForState(state),
      firstEnemy === undefined ? undefined : enemyCommandForEnemy(firstEnemy),
      secondEnemy === undefined ? undefined : enemyCommandForEnemy(secondEnemy),
    ]);
  });

  it("returns deterministic commands for the same state", () => {
    const state = createState([
      createEnemy({
        id: "test-enemy-0",
        spawnOrder: ZERO,
        xPos: FIFTY,
        yPos: FIFTY,
      }),
      createEnemy({
        id: "test-enemy-1",
        spawnOrder: ONE,
        xPos: ONE_HUNDRED,
        yPos: ONE_HUNDRED,
      }),
    ]);

    expect(projectRenderCommands(state)).toStrictEqual(
      projectRenderCommands(state),
    );
  });
});
