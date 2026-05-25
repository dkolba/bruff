/* eslint-disable sort-imports -- Migration imports group core types, constants, and utility dependency. */
import type {
  CanvasSize,
  Enemy,
  GameState,
  GridCell,
  Player,
} from "../core/types.ts";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
  ONE,
  ZERO,
} from "../core/constants.js";
import { clamp } from "@bruff/utils";

type PlayerV1 = Omit<Player, "cell">;
type EnemyV1 = Omit<Enemy, "cell">;
type GameStateV1 = Omit<
  GameState,
  "board" | "enemies" | "player" | "stateVersion"
> &
  Readonly<{
    enemies: ReadonlyArray<EnemyV1>;
    player: PlayerV1;
    stateVersion: number;
  }>;

const cellFromPixelPosition = (
  xPos: number,
  yPos: number,
  canvas: CanvasSize,
): GridCell => {
  const cellWidth = canvas.width / BOARD_COLUMNS;
  const cellHeight = canvas.height / BOARD_ROWS;

  return {
    column: clamp(Math.floor(xPos / cellWidth), ZERO, BOARD_COLUMNS - ONE),
    row: clamp(Math.floor(yPos / cellHeight), ZERO, BOARD_ROWS - ONE),
  };
};

/**
 * Migrates a version 1 pixel-position state into version 2 grid state.
 *
 * @param state - Version 1 state snapshot
 * @returns Version 2 state snapshot with board and actor cells
 */
export const migrateV1toV2 = (state: GameStateV1): GameState => ({
  ...state,
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  enemies: state.enemies.map((enemy) => ({
    ...enemy,
    cell: cellFromPixelPosition(enemy.xPos, enemy.yPos, state.canvas),
  })),
  player: {
    ...state.player,
    cell: cellFromPixelPosition(
      state.player.xPos,
      state.player.yPos,
      state.canvas,
    ),
  },
  stateVersion: CURRENT_STATE_VERSION,
});
