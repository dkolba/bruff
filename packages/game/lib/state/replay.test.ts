import { describe, expect, it } from "vitest";
import { ENEMY_SIZE, PLAYER_SIZE } from "../core/constants.js";
import { brand } from "@bruff/utils";
import createInitialState from "./create-initial-state.js";
import type { GameAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import { updateEnemies } from "./update-enemies.js";
import updatePlayer from "./update-player.js";

const STATE_VERSION = 1;
const CANVAS = { height: 600, width: 800 };

const REPLAY_ACTIONS: ReadonlyArray<GameAction> = [
  { type: "move-right" },
  { type: "move-right" },
  { type: "move-right" },
  { type: "tick" },
  { type: "tick" },
];

const foldActions = (
  state: GameState,
  actions: ReadonlyArray<GameAction>,
): GameState =>
  actions.reduce<GameState>(
    (currentState, action) =>
      updateEnemies(updatePlayer(currentState, action), action),
    state,
  );

const EXPECTED_FINAL_STATE: GameState = {
  canvas: { height: 600, width: 800 },
  enemies: [
    {
      id: brand<"EnemyId">("3568710290-2410661980"),
      size: ENEMY_SIZE,
      spawnOrder: 0,
      xPos: 51.479_880_146_791_885,
      yPos: 51.345_345_587_992_625,
    },
    {
      id: brand<"EnemyId">("231416673-2613675437"),
      size: ENEMY_SIZE,
      spawnOrder: 1,
      xPos: 298.704_703_159_808_9,
      yPos: 101.523_878_635_518_91,
    },
    {
      id: brand<"EnemyId">("2234025770-2756763197"),
      size: ENEMY_SIZE,
      spawnOrder: 2,
      xPos: 101.509_211_044_327,
      yPos: 298.687_642_570_150_4,
    },
  ],
  frameIndex: 0,
  input: [],
  player: {
    id: brand<"PlayerId">("439668526-3938904095"),
    size: PLAYER_SIZE,
    xPos: 215,
    yPos: 200,
  },
  playerMoved: true,
  prng: { accumulator: 2_756_763_197, type: "prng-state" },
  seed: 1,
  stateVersion: STATE_VERSION,
};

describe("replay determinism", () => {
  it("produces the stored snapshot for the canonical action sequence", () => {
    const initial = createInitialState(CANVAS);
    const final = foldActions(initial, REPLAY_ACTIONS);
    expect(final).toEqual(EXPECTED_FINAL_STATE);
  });
});
