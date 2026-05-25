/* eslint-disable max-lines-per-function, sort-imports -- Legacy and grid property fixtures live together for reducer invariants. */
import { brand, createPrng } from "@bruff/utils";
import { describe, expect } from "vitest";
import type { Enemy, GameState, GridCell } from "../core/types.ts";
import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
  ENEMY_SIZE,
  ONE,
  PLAYER_SIZE,
  TWO,
  ZERO,
} from "../core/constants.js";
import { fc, test } from "@fast-check/vitest";
import type { GameAction } from "../core/actions.ts";
import { updateEnemies } from "./update-enemies.js";

const STATE_VERSION = 1;
const TEST_SEED = 1;
const MIN_CANVAS = PLAYER_SIZE * TWO;
const MAX_CANVAS = 4096;
const GRID_CANVAS_SIZE = 800;

const allActions: ReadonlyArray<GameAction> = [
  { type: "move-down" },
  { type: "move-left" },
  { type: "move-right" },
  { type: "move-up" },
  { type: "tick" },
];

const tickAction: GameAction = { type: "tick" };

const gameStateArb: fc.Arbitrary<GameState> = fc
  .record({
    canvasHeight: fc.integer({ max: MAX_CANVAS, min: MIN_CANVAS }),
    canvasWidth: fc.integer({ max: MAX_CANVAS, min: MIN_CANVAS }),
  })
  .chain(({ canvasHeight, canvasWidth }) =>
    fc
      .record({
        enemies: fc.array(
          fc.record({
            xPos: fc.integer({ max: canvasWidth - ENEMY_SIZE, min: 0 }),
            yPos: fc.integer({ max: canvasHeight - ENEMY_SIZE, min: 0 }),
          }),
          { maxLength: 10, minLength: 0 },
        ),
        playerXPos: fc.integer({ max: canvasWidth - PLAYER_SIZE, min: 0 }),
        playerYPos: fc.integer({ max: canvasHeight - PLAYER_SIZE, min: 0 }),
      })
      .map(
        ({ enemies, playerXPos, playerYPos }): GameState => ({
          canvas: { height: canvasHeight, width: canvasWidth },
          enemies: enemies.map(
            ({ xPos, yPos }, index): Enemy => ({
              id: brand<"EnemyId">(`test-enemy-${index}`),
              size: ENEMY_SIZE,
              spawnOrder: index,
              xPos,
              yPos,
            }),
          ),
          frameIndex: 0,
          input: [],
          player: {
            id: brand<"PlayerId">("test-player"),
            size: PLAYER_SIZE,
            xPos: playerXPos,
            yPos: playerYPos,
          },
          playerMoved: false,
          prng: createPrng(TEST_SEED),
          seed: TEST_SEED,
          stateVersion: STATE_VERSION,
        }),
      ),
  );

const gameActionArb: fc.Arbitrary<GameAction> = fc.constantFrom(...allActions);

const gridCellArb: fc.Arbitrary<GridCell> = fc.record({
  column: fc.integer({ max: BOARD_COLUMNS - ONE, min: ZERO }),
  row: fc.integer({ max: BOARD_ROWS - ONE, min: ZERO }),
});

const cellKey = (cell: GridCell): string => `${cell.column},${cell.row}`;

const isGridCell = (cell: GridCell | undefined): cell is GridCell =>
  cell !== undefined;

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
      .map(
        (enemyCells): GameState => ({
          board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
          canvas: { height: GRID_CANVAS_SIZE, width: GRID_CANVAS_SIZE },
          enemies: enemyCells.map(
            (enemyCell, index): Enemy => ({
              cell: enemyCell,
              id: brand<"EnemyId">(`test-grid-enemy-${index}`),
              size: ENEMY_SIZE,
              spawnOrder: index,
              xPos: enemyCell.column,
              yPos: enemyCell.row,
            }),
          ),
          frameIndex: ZERO,
          input: [],
          player: {
            cell: playerCell,
            id: brand<"PlayerId">("test-grid-player"),
            size: PLAYER_SIZE,
            xPos: playerCell.column,
            yPos: playerCell.row,
          },
          playerMoved: true,
          prng: createPrng(TEST_SEED),
          seed: TEST_SEED,
          stateVersion: CURRENT_STATE_VERSION,
        }),
      ),
);

describe("updateEnemies (property-based)", () => {
  test.prop([gameStateArb, gameActionArb])(
    "enemy count is invariant under any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      expect(next.enemies.length).toBe(state.enemies.length);
    },
  );

  test.prop([gameStateArb, gameActionArb])(
    "every enemy stays inside canvas bounds after any action",
    (state, action) => {
      const next = updateEnemies(state, action);
      // eslint-disable-next-line unicorn/no-array-for-each -- C-17 prefers declarative iteration; this asserts per-element invariants.
      next.enemies.forEach((enemy) => {
        expect(enemy.xPos).toBeGreaterThanOrEqual(ZERO);
        expect(enemy.yPos).toBeGreaterThanOrEqual(ZERO);
        expect(enemy.xPos).toBeLessThanOrEqual(next.canvas.width - ENEMY_SIZE);
        expect(enemy.yPos).toBeLessThanOrEqual(next.canvas.height - ENEMY_SIZE);
      });
    },
  );

  test.prop([gameStateArb])("tick preserves enemy count exactly", (state) => {
    const next = updateEnemies(state, tickAction);
    expect(next.enemies.length).toBe(state.enemies.length);
  });

  test.prop([gameStateArb, gameActionArb])(
    "is deterministic — same state and action produce equal results",
    (state, action) => {
      expect(updateEnemies(state, action)).toEqual(
        updateEnemies(state, action),
      );
    },
  );

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
        board === undefined
          ? false
          : enemies.every(
              (enemy) =>
                enemy.cell !== undefined &&
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
      ]
        .filter(isGridCell)
        .map((cell) => cellKey(cell));

      expect(new Set(occupiedCellKeys).size).toBe(occupiedCellKeys.length);
    },
  );
});
