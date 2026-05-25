/* eslint-disable sort-imports -- Replay fixture imports are grouped by domain role. */
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  ENEMY_SIZE,
  FIVE,
  ONE,
  PLAYER_SIZE,
  TWO,
} from "../core/constants.js";
import { brand } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import type { GameAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import createInitialState from "./create-initial-state.js";
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
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: 600, width: 800 },
  enemies: [
    {
      cell: { column: ONE, row: ONE },
      id: brand<"EnemyId">("3568710290-2410661980"),
      size: ENEMY_SIZE,
      spawnOrder: 0,
      xPos: 51.479_880_146_791_885,
      yPos: 51.345_345_587_992_625,
    },
    {
      cell: { column: FIVE, row: ONE },
      id: brand<"EnemyId">("231416673-2613675437"),
      size: ENEMY_SIZE,
      spawnOrder: 1,
      xPos: 298.704_703_159_808_9,
      yPos: 101.523_878_635_518_91,
    },
    {
      cell: { column: ONE, row: FIVE },
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
    cell: { column: TWO + ONE, row: TWO + ONE },
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
