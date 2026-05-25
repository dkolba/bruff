import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  ENEMY_SIZE,
  FIVE,
  ONE,
  PLAYER_SIZE,
  TWO,
} from "../core/constants.js";
import { describe, expect, it } from "vitest";
import createInitialState from "./create-initial-state.js";

const TEST_CANVAS = { height: 600, width: 800 };
const EXPECTED_ENEMIES = [
  {
    cell: { column: ONE, row: ONE },
    size: ENEMY_SIZE,
    spawnOrder: 0,
    xPos: 50,
    yPos: 50,
  },
  {
    cell: { column: FIVE, row: ONE },
    size: ENEMY_SIZE,
    spawnOrder: 1,
    xPos: 300,
    yPos: 100,
  },
  {
    cell: { column: ONE, row: FIVE },
    size: ENEMY_SIZE,
    spawnOrder: 2,
    xPos: 100,
    yPos: 300,
  },
];

const EXPECTED_PLAYER = {
  cell: { column: TWO + ONE, row: TWO + ONE },
  size: PLAYER_SIZE,
  xPos: 200,
  yPos: 200,
};

describe("createInitialState", () => {
  it("should create an initial game state with the given canvas size", () => {
    const state = createInitialState(TEST_CANVAS);

    expect(state).toMatchObject({
      board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
      canvas: TEST_CANVAS,
      enemies: EXPECTED_ENEMIES,
      frameIndex: 0,
      input: [],
      player: EXPECTED_PLAYER,
      playerMoved: false,
      seed: 1,
      stateVersion: 1,
    });
    expect(typeof state.player.id).toBe("string");
    expect(state.prng).toBeDefined();
  });

  it("should produce the same state for the same canvas size (deterministic)", () => {
    const stateA = createInitialState(TEST_CANVAS);
    const stateB = createInitialState(TEST_CANVAS);
    expect(stateA.player.id).toBe(stateB.player.id);
    expect(stateA.enemies.map((enemy) => enemy.id)).toEqual(
      stateB.enemies.map((enemy) => enemy.id),
    );
  });
});
