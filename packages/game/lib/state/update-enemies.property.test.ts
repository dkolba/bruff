import { brand, createPrng } from "@bruff/utils";
import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";

import type { GameAction } from "../core/actions.ts";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  ONE,
  PLAYER_SIZE,
  ZERO,
} from "../core/constants.js";
import type { Enemy, GameState, GridCell } from "../core/types.ts";
import { updateEnemies } from "./update-enemies.js";

const TEST_SEED = 1;
const GRID_CANVAS_SIZE = 800;

const allActions: ReadonlyArray<GameAction> = [
  { type: "move-down" },
  { type: "move-left" },
  { type: "move-right" },
  { type: "move-up" },
  { type: "tick" },
];

const gameActionArb: fc.Arbitrary<GameAction> = fc.constantFrom(...allActions);

const gridCellArb: fc.Arbitrary<GridCell> = fc.record({
  column: fc.integer({ max: BOARD_COLUMNS - ONE, min: ZERO }),
  row: fc.integer({ max: BOARD_ROWS - ONE, min: ZERO }),
});

const cellKey = (cell: GridCell): string => `${cell.column},${cell.row}`;

const isSameCell = (leftCell: GridCell, rightCell: GridCell): boolean =>
  leftCell.column === rightCell.column && leftCell.row === rightCell.row;

const gridGameStateArb: fc.Arbitrary<GameState> = gridCellArb.chain(
  (playerCell) =>
    fc
      .uniqueArray(
        gridCellArb.filter((enemyCell) => !isSameCell(enemyCell, playerCell)),
        {
          maxLength: 10,
          minLength: 0,
          selector: cellKey,
        },
      )
      .map((enemyCells): GameState => ({
        board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
        canvas: { height: GRID_CANVAS_SIZE, width: GRID_CANVAS_SIZE },
        enemies: enemyCells.map((enemyCell, index): Enemy => ({
          cell: enemyCell,
          id: brand<"EnemyId">(`test-grid-enemy-${index}`),
          size: ENEMY_SIZE,
          spawnOrder: index,
        })),
        frameIndex: ZERO,
        input: [],
        player: {
          cell: playerCell,
          id: brand<"PlayerId">("test-grid-player"),
          size: PLAYER_SIZE,
        },
        playerMoved: true,
        prng: createPrng(TEST_SEED),
        seed: TEST_SEED,
        stateVersion: CURRENT_STATE_VERSION,
      })),
);

describe("updateEnemies (property-based)", () => {
  test.prop([gridGameStateArb, gameActionArb])(
    "grid enemy count is invariant under any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      expect(next.enemies.length).toBe(state.enemies.length);
    },
  );

  test.prop([gridGameStateArb, gameActionArb])(
    "grid enemies stay inside board bounds after any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      const { board, enemies } = next;

      expect(
        enemies.every(
          (enemy) =>
            enemy.cell.column >= ZERO &&
            enemy.cell.row >= ZERO &&
            enemy.cell.column < board.columns &&
            enemy.cell.row < board.rows,
        ),
      ).toBe(true);
    },
  );

  test.prop([gridGameStateArb, gameActionArb])(
    "grid occupied cells remain unique after any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      const occupiedCellKeys = [
        next.player.cell,
        ...next.enemies.map((enemy) => enemy.cell),
      ].map((cell) => cellKey(cell));

      expect(new Set(occupiedCellKeys).size).toBe(occupiedCellKeys.length);
    },
  );
});
