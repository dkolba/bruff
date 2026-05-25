/* eslint-disable sort-imports -- Imports are grouped by fixture dependency role. */
import { describe, expect, it } from "vitest";
import { ENEMY_SIZE, ONE, TWO, ZERO } from "../core/constants.js";
import { brand } from "@bruff/utils";
import { nextEnemyCellTowardPlayer } from "./move-enemy-toward-player.js";
import type { Enemy, Player } from "../core/types.ts";

const TEST_POS_100 = 100;
const TEST_POS_50 = 50;
const TEST_PLAYER_SIZE = 20;

const ENEMY_ID = brand<"EnemyId">("test-enemy");
const PLAYER_ID = brand<"PlayerId">("test-player");
const GRID_PLAYER: Player = {
  cell: { column: TWO + ONE, row: TWO + ONE },
  id: PLAYER_ID,
  size: TEST_PLAYER_SIZE,
  xPos: TEST_POS_100,
  yPos: TEST_POS_100,
};

const createGridEnemy = (cell: Enemy["cell"]): Enemy => ({
  cell,
  id: ENEMY_ID,
  size: ENEMY_SIZE,
  spawnOrder: ZERO,
  xPos: TEST_POS_50,
  yPos: TEST_POS_50,
});

const testGridDestination = (): void => {
  it("chooses a horizontal step when horizontal distance is larger", () => {
    const enemy = createGridEnemy({ column: ZERO, row: TWO + ONE });

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: ONE,
      row: TWO + ONE,
    });
  });

  it("chooses a vertical step when vertical distance is larger", () => {
    const enemy = createGridEnemy({ column: TWO + ONE, row: ZERO });

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: TWO + ONE,
      row: ONE,
    });
  });

  it("chooses horizontal movement when distances tie", () => {
    const enemy = createGridEnemy({ column: TWO, row: TWO });

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: TWO + ONE,
      row: TWO,
    });
  });

  it("stays still when already overlapping the player cell", () => {
    const enemy = createGridEnemy(GRID_PLAYER.cell);

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual(
      GRID_PLAYER.cell,
    );
  });
};

describe("nextEnemyCellTowardPlayer", () => {
  describe("grid destination", testGridDestination);
});
