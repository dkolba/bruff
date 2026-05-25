/* eslint-disable max-lines-per-function, sort-imports -- Pixel and grid movement fixtures are grouped by scenario. */
import { describe, expect, it } from "vitest";
import {
  ENEMY_SIZE,
  ONE as ONE_CONSTANT,
  TWO,
  ZERO,
} from "../core/constants.js";
import { brand } from "@bruff/utils";
import {
  moveEnemyTowardPlayer,
  nextEnemyCellTowardPlayer,
} from "./move-enemy-toward-player.js";
import type { Enemy, Player } from "../core/types.ts";

const TEST_CANVAS_WIDTH = 800;
const TEST_CANVAS_HEIGHT = 600;
const ONE = 1;
const TEST_POS_100 = 100;
const TEST_POS_50 = 50;
const TEST_PLAYER_SIZE = 20;

const ENEMY_ID = brand<"EnemyId">("test-enemy");
const PLAYER_ID = brand<"PlayerId">("test-player");
const GRID_PLAYER: Player = {
  cell: { column: TWO + ONE_CONSTANT, row: TWO + ONE_CONSTANT },
  id: PLAYER_ID,
  size: TEST_PLAYER_SIZE,
  xPos: TEST_POS_100,
  yPos: TEST_POS_100,
};

const TEST_PLAYER = {
  id: PLAYER_ID,
  size: TEST_PLAYER_SIZE,
  xPos: TEST_POS_100,
  yPos: TEST_POS_100,
};

const testNoMovementAtSamePosition = (): void => {
  it("should not move enemy when at same position as player", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);

    expect(result.xPos).toBe(TEST_POS_100);
    expect(result.yPos).toBe(TEST_POS_100);
  });
};

const testMovementTowardPlayer = (): void => {
  it("should move enemy toward player when to the left", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_POS_50,
      yPos: TEST_POS_100,
    };
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);

    expect(result.xPos).toBeGreaterThan(TEST_POS_50);
    expect(result.yPos).toBe(TEST_POS_100);
  });

  it("should move enemy toward player when below", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_POS_100,
      yPos: TEST_POS_50,
    };
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);

    expect(result.xPos).toBe(TEST_POS_100);
    expect(result.yPos).toBeGreaterThan(TEST_POS_50);
  });

  it("should move enemy toward player diagonally", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_POS_50,
      yPos: TEST_POS_50,
    };
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);

    expect(result.xPos).toBeGreaterThan(TEST_POS_50);
    expect(result.yPos).toBeGreaterThan(TEST_POS_50);
  });
};

const testBoundsClamping = (): void => {
  it("should clamp x position within canvas bounds", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_CANVAS_WIDTH - ONE,
      yPos: TEST_POS_100,
    };
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);

    expect(result.xPos).toBeLessThanOrEqual(TEST_CANVAS_WIDTH - ENEMY_SIZE);
  });

  it("should clamp y position within canvas bounds", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_POS_100,
      yPos: TEST_CANVAS_HEIGHT - ONE,
    };
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);

    expect(result.yPos).toBeLessThanOrEqual(TEST_CANVAS_HEIGHT - ENEMY_SIZE);
  });
};

const testDistance = (): void => {
  it("should move enemy closer to player", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: ZERO,
      yPos: ZERO,
    };

    const distanceBefore = Math.hypot(
      TEST_PLAYER.xPos - enemy.xPos,
      TEST_PLAYER.yPos - enemy.yPos,
    );
    const result = moveEnemyTowardPlayer(enemy, TEST_PLAYER, canvas);
    const distanceAfter = Math.hypot(
      TEST_PLAYER.xPos - result.xPos,
      TEST_PLAYER.yPos - result.yPos,
    );

    expect(distanceAfter).toBeLessThan(distanceBefore);
  });
};

const createGridEnemy = (cell: Enemy["cell"]): Enemy => {
  const enemy = {
    id: ENEMY_ID,
    size: ENEMY_SIZE,
    spawnOrder: ZERO,
    xPos: TEST_POS_50,
    yPos: TEST_POS_50,
  };

  if (cell === undefined) {
    return enemy;
  }

  return { ...enemy, cell };
};

const testGridDestination = (): void => {
  it("chooses a horizontal step when horizontal distance is larger", () => {
    const enemy = createGridEnemy({ column: ZERO, row: TWO + ONE_CONSTANT });

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: ONE_CONSTANT,
      row: TWO + ONE_CONSTANT,
    });
  });

  it("chooses a vertical step when vertical distance is larger", () => {
    const enemy = createGridEnemy({ column: TWO + ONE_CONSTANT, row: ZERO });

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: TWO + ONE_CONSTANT,
      row: ONE_CONSTANT,
    });
  });

  it("chooses horizontal movement when distances tie", () => {
    const enemy = createGridEnemy({ column: TWO, row: TWO });

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: TWO + ONE_CONSTANT,
      row: TWO,
    });
  });

  it("stays still when already overlapping the player cell", () => {
    const enemy = createGridEnemy(GRID_PLAYER.cell);

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual(
      GRID_PLAYER.cell,
    );
  });

  it("stays still when the player has no grid cell", () => {
    const enemy = createGridEnemy({ column: TWO, row: TWO });
    const playerWithoutCell: Player = {
      id: GRID_PLAYER.id,
      size: GRID_PLAYER.size,
      xPos: GRID_PLAYER.xPos,
      yPos: GRID_PLAYER.yPos,
    };

    expect(nextEnemyCellTowardPlayer(enemy, playerWithoutCell)).toStrictEqual(
      enemy.cell,
    );
  });

  it("uses the origin for enemies without a grid cell", () => {
    const enemy: Enemy = {
      id: ENEMY_ID,
      size: ENEMY_SIZE,
      spawnOrder: ZERO,
      xPos: TEST_POS_50,
      yPos: TEST_POS_50,
    };

    expect(nextEnemyCellTowardPlayer(enemy, GRID_PLAYER)).toStrictEqual({
      column: ONE_CONSTANT,
      row: ZERO,
    });
  });
};

describe("moveEnemyTowardPlayer", () => {
  describe("no movement at same position", testNoMovementAtSamePosition);
  describe("movement toward player", testMovementTowardPlayer);
  describe("bounds clamping", testBoundsClamping);
  describe("distance", testDistance);
  describe("grid destination", testGridDestination);
});
