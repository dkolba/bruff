import { describe, expect, it } from "vitest";

import { ENEMY_SIZE, ZERO } from "./constants.js";
import { moveEnemyTowardPlayer } from "./move-enemy-toward-player.js";

const TEST_CANVAS_WIDTH = 800;
const TEST_CANVAS_HEIGHT = 600;
const ONE = 1;
const TEST_POS_100 = 100;
const TEST_POS_50 = 50;
const TEST_PLAYER_SIZE = 20;

const testNoMovementAtSamePosition = () => {
  it("should not move enemy when at same position as player", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = { size: ENEMY_SIZE, xPos: TEST_POS_100, yPos: TEST_POS_100 };
    const result = moveEnemyTowardPlayer(enemy, player, canvas);

    expect(result.xPos).toBe(TEST_POS_100);
    expect(result.yPos).toBe(TEST_POS_100);
  });
};

const testMovementTowardPlayer = () => {
  it("should move enemy toward player when to the left", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = { size: ENEMY_SIZE, xPos: TEST_POS_50, yPos: TEST_POS_100 };
    const result = moveEnemyTowardPlayer(enemy, player, canvas);

    expect(result.xPos).toBeGreaterThan(TEST_POS_50);
    expect(result.yPos).toBe(TEST_POS_100);
  });

  it("should move enemy toward player when below", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = { size: ENEMY_SIZE, xPos: TEST_POS_100, yPos: TEST_POS_50 };
    const result = moveEnemyTowardPlayer(enemy, player, canvas);

    expect(result.xPos).toBe(TEST_POS_100);
    expect(result.yPos).toBeGreaterThan(TEST_POS_50);
  });

  it("should move enemy toward player diagonally", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = { size: ENEMY_SIZE, xPos: TEST_POS_50, yPos: TEST_POS_50 };
    const result = moveEnemyTowardPlayer(enemy, player, canvas);

    expect(result.xPos).toBeGreaterThan(TEST_POS_50);
    expect(result.yPos).toBeGreaterThan(TEST_POS_50);
  });
};

const testBoundsClamping = () => {
  it("should clamp x position within canvas bounds", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = {
      size: ENEMY_SIZE,
      xPos: TEST_CANVAS_WIDTH - ONE,
      yPos: TEST_POS_100,
    };
    const result = moveEnemyTowardPlayer(enemy, player, canvas);

    expect(result.xPos).toBeLessThanOrEqual(TEST_CANVAS_WIDTH - ENEMY_SIZE);
  });

  it("should clamp y position within canvas bounds", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = {
      size: ENEMY_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_CANVAS_HEIGHT - ONE,
    };
    const result = moveEnemyTowardPlayer(enemy, player, canvas);

    expect(result.yPos).toBeLessThanOrEqual(TEST_CANVAS_HEIGHT - ENEMY_SIZE);
  });
};

const testDistance = () => {
  it("should move enemy closer to player", () => {
    const canvas = { height: TEST_CANVAS_HEIGHT, width: TEST_CANVAS_WIDTH };
    const player = {
      size: TEST_PLAYER_SIZE,
      xPos: TEST_POS_100,
      yPos: TEST_POS_100,
    };
    const enemy = { size: ENEMY_SIZE, xPos: ZERO, yPos: ZERO };

    const distanceBefore = Math.hypot(
      player.xPos - enemy.xPos,
      player.yPos - enemy.yPos,
    );
    const result = moveEnemyTowardPlayer(enemy, player, canvas);
    const distanceAfter = Math.hypot(
      player.xPos - result.xPos,
      player.yPos - result.yPos,
    );

    expect(distanceAfter).toBeLessThan(distanceBefore);
  });
};

describe("moveEnemyTowardPlayer", () => {
  describe("no movement at same position", testNoMovementAtSamePosition);
  describe("movement toward player", testMovementTowardPlayer);
  describe("bounds clamping", testBoundsClamping);
  describe("distance", testDistance);
});
