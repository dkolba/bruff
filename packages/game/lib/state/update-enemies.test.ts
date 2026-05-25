/* eslint-disable max-lines-per-function, sort-imports -- Grid occupancy scenarios keep compact state fixtures inline. */
import { brand, createPrng } from "@bruff/utils";
import { describe, expect, it } from "vitest";
import type { Enemy, GameState, GridCell, Player } from "../core/types.ts";
import {
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  PLAYER_SIZE,
  ZERO,
} from "../core/constants.js";
import { updateEnemies } from "./update-enemies.js";

const ONE = 1;
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const FIVE = 5;
const TEST_SEED = 1;
const BOARD = { columns: 7, rows: 7 };

type EnemySpec = Readonly<{
  cell: GridCell;
  id: string;
  spawnOrder: number;
}>;

const createGridEnemy = (enemySpec: EnemySpec): Enemy => ({
  cell: enemySpec.cell,
  id: brand<"EnemyId">(enemySpec.id),
  size: ENEMY_SIZE,
  spawnOrder: enemySpec.spawnOrder,
  xPos: enemySpec.cell.column,
  yPos: enemySpec.cell.row,
});

const createPlayer = (cell: GridCell): Player => ({
  cell,
  id: brand<"PlayerId">("test-player"),
  size: PLAYER_SIZE,
  xPos: cell.column,
  yPos: cell.row,
});

const createGridState = (
  playerCell: GridCell,
  enemySpecs: ReadonlyArray<EnemySpec>,
): GameState => ({
  board: BOARD,
  canvas: { height: 600, width: 800 },
  enemies: enemySpecs.map((enemySpec) => createGridEnemy(enemySpec)),
  frameIndex: ZERO,
  input: [],
  player: createPlayer(playerCell),
  playerMoved: true,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

describe("updateEnemies", () => {
  it("moves an enemy one grid cell on a tick after accepted player movement", () => {
    const state = createGridState({ column: FOUR, row: ONE }, [
      { cell: { column: TWO, row: ONE }, id: "test-enemy-0", spawnOrder: ZERO },
    ]);

    const updatedState = updateEnemies(state, { type: "tick" });

    expect(updatedState.enemies[ZERO]?.cell).toStrictEqual({
      column: THREE,
      row: ONE,
    });
  });

  it("does not move grid enemies on a tick without accepted player movement", () => {
    const state = {
      ...createGridState({ column: FOUR, row: ONE }, [
        {
          cell: { column: TWO, row: ONE },
          id: "test-enemy-0",
          spawnOrder: ZERO,
        },
      ]),
      playerMoved: false,
    };

    const updatedState = updateEnemies(state, { type: "tick" });

    expect(updatedState.enemies).toStrictEqual(state.enemies);
  });

  it("leaves an enemy still when the player occupies the proposed cell", () => {
    const state = createGridState({ column: THREE, row: ONE }, [
      { cell: { column: TWO, row: ONE }, id: "test-enemy-0", spawnOrder: ZERO },
    ]);

    const updatedState = updateEnemies(state, { type: "tick" });

    expect(updatedState.enemies[ZERO]?.cell).toStrictEqual({
      column: TWO,
      row: ONE,
    });
  });

  it("leaves an enemy still when another enemy occupied the proposed cell at turn start", () => {
    const state = createGridState({ column: FOUR, row: ONE }, [
      { cell: { column: TWO, row: ONE }, id: "test-enemy-0", spawnOrder: ZERO },
      {
        cell: { column: THREE, row: ONE },
        id: "test-enemy-1",
        spawnOrder: ONE,
      },
    ]);

    const updatedState = updateEnemies(state, { type: "tick" });

    expect(updatedState.enemies[ZERO]?.cell).toStrictEqual({
      column: TWO,
      row: ONE,
    });
  });

  it("gives same-destination priority to the first enemy by spawn order", () => {
    const state = createGridState({ column: TWO, row: THREE }, [
      { cell: { column: TWO, row: ONE }, id: "test-enemy-0", spawnOrder: ZERO },
      { cell: { column: ONE, row: TWO }, id: "test-enemy-1", spawnOrder: ONE },
    ]);

    const updatedState = updateEnemies(state, { type: "tick" });

    expect(updatedState.enemies[ZERO]?.cell).toStrictEqual({
      column: TWO,
      row: TWO,
    });
    expect(updatedState.enemies[ONE]?.cell).toStrictEqual({
      column: ONE,
      row: TWO,
    });
  });

  it("resolves movement priority by spawn order instead of array order", () => {
    const state = createGridState({ column: TWO, row: THREE }, [
      { cell: { column: TWO, row: ONE }, id: "test-enemy-1", spawnOrder: ONE },
      { cell: { column: ONE, row: TWO }, id: "test-enemy-0", spawnOrder: ZERO },
    ]);

    const updatedState = updateEnemies(state, { type: "tick" });

    expect(updatedState.enemies[ZERO]?.cell).toStrictEqual({
      column: TWO,
      row: ONE,
    });
    expect(updatedState.enemies[ONE]?.cell).toStrictEqual({
      column: TWO,
      row: TWO,
    });
  });

  it.each([
    { type: "move-down" },
    { type: "move-left" },
    { type: "move-right" },
    { type: "move-up" },
  ] as const)("leaves enemies unchanged on $type action", (action) => {
    const state = createGridState({ column: FIVE, row: FIVE }, [
      { cell: { column: ONE, row: ONE }, id: "test-enemy-0", spawnOrder: ZERO },
    ]);

    const updatedState = updateEnemies(state, action);

    expect(updatedState.enemies).toStrictEqual(state.enemies);
  });
});
