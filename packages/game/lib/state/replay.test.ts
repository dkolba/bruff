import { brand } from "@bruff/utils";
import { describe, expect, it } from "vitest";

import type { InputAction } from "../core/actions.ts";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  ONE,
  PLAYER_SIZE,
  TWO,
} from "../core/constants.js";
import type { GameState } from "../core/types.ts";
import { advanceGameState } from "./advance-game-state.js";
import createInitialState from "./create-initial-state.js";

const CANVAS = { height: 600, width: 800 };

const REPLAY_INPUT_FRAMES: ReadonlyArray<ReadonlyArray<InputAction>> = [
  [{ type: "move-left" }],
  [{ type: "move-left" }],
  [{ type: "move-up" }],
];

const foldInputFrames = (
  state: GameState,
  inputFrames: ReadonlyArray<ReadonlyArray<InputAction>>,
): GameState =>
  inputFrames.reduce<GameState>(
    (currentState, inputs) => advanceGameState(currentState, inputs),
    state,
  );

const EXPECTED_FINAL_STATE: GameState = {
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: 600, width: 800 },
  enemies: [
    {
      cell: { column: ONE, row: TWO },
      id: brand<"EnemyId">("3568710290-2410661980"),
      size: ENEMY_SIZE,
      spawnOrder: 0,
    },
    {
      cell: { column: TWO + ONE, row: ONE },
      id: brand<"EnemyId">("231416673-2613675437"),
      size: ENEMY_SIZE,
      spawnOrder: 1,
    },
    {
      cell: { column: ONE, row: TWO + TWO },
      id: brand<"EnemyId">("2234025770-2756763197"),
      size: ENEMY_SIZE,
      spawnOrder: 2,
    },
  ],
  frameIndex: TWO + ONE,
  input: [],
  player: {
    cell: { column: ONE, row: TWO + ONE },
    id: brand<"PlayerId">("439668526-3938904095"),
    size: PLAYER_SIZE,
  },
  playerMoved: false,
  prng: { accumulator: 2_756_763_197, type: "prng-state" },
  seed: 1,
  stateVersion: CURRENT_STATE_VERSION,
};

describe("replay determinism", () => {
  it("produces the stored snapshot for the canonical action sequence", () => {
    const initial = createInitialState(CANVAS);
    const final = foldInputFrames(initial, REPLAY_INPUT_FRAMES);
    expect(final).toEqual(EXPECTED_FINAL_STATE);
  });
});
