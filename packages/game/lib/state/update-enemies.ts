/* eslint-disable sort-imports -- Imports are grouped by reducer dependency role. */
import type { GameAction } from "../core/actions.ts";
import type { Board, Enemy, GameState, GridCell } from "../core/types.ts";
import { CURRENT_STATE_VERSION } from "../core/constants.js";
import {
  moveEnemyTowardPlayer,
  nextEnemyCellTowardPlayer,
} from "./move-enemy-toward-player.js";
import { cellsEqual, isCellInsideBoard } from "./grid.js";
import { isCellOccupiedByEnemy } from "./occupancy.js";

type ResolvedEnemy = Readonly<{
  enemy: Enemy;
  index: number;
}>;

type EnemyResolution = Readonly<{
  resolvedEnemies: ReadonlyArray<ResolvedEnemy>;
  reservedCells: ReadonlyArray<GridCell>;
}>;

type DestinationBlockContext = Readonly<{
  board: Board;
  playerCell: GridCell;
  reservedCells: ReadonlyArray<GridCell>;
  state: GameState;
}>;

type EnemyResolutionContext = Readonly<{
  board: Board;
  playerCell: GridCell;
  state: GameState;
}>;

const isPlayerCell = (cell: GridCell, playerCell: GridCell): boolean =>
  cellsEqual(cell, playerCell);

const isReservedCell = (
  cell: GridCell,
  reservedCells: ReadonlyArray<GridCell>,
): boolean =>
  reservedCells.some((reservedCell) => cellsEqual(reservedCell, cell));

const isEnemyDestinationBlocked = (
  destination: GridCell,
  context: DestinationBlockContext,
): boolean =>
  !isCellInsideBoard(destination, context.board) ||
  isPlayerCell(destination, context.playerCell) ||
  isCellOccupiedByEnemy(destination, context.state.enemies) ||
  isReservedCell(destination, context.reservedCells);

const resolveEnemyDestination = (
  enemy: Enemy,
  reservedCells: ReadonlyArray<GridCell>,
  context: EnemyResolutionContext,
): Enemy => {
  if (enemy.cell === undefined) {
    return enemy;
  }

  const destination = nextEnemyCellTowardPlayer(enemy, context.state.player);

  if (
    isEnemyDestinationBlocked(destination, {
      board: context.board,
      playerCell: context.playerCell,
      reservedCells,
      state: context.state,
    })
  ) {
    return enemy;
  }

  return { ...enemy, cell: destination };
};

const reserveEnemyCell = (
  enemy: Enemy,
  reservedCells: ReadonlyArray<GridCell>,
): ReadonlyArray<GridCell> =>
  enemy.cell === undefined ? reservedCells : [...reservedCells, enemy.cell];

const resolveEnemyByPriority =
  (state: GameState, board: Board, playerCell: GridCell) =>
  (resolution: EnemyResolution, enemyEntry: ResolvedEnemy): EnemyResolution => {
    const enemy = resolveEnemyDestination(
      enemyEntry.enemy,
      resolution.reservedCells,
      { board, playerCell, state },
    );

    return {
      reservedCells: reserveEnemyCell(enemy, resolution.reservedCells),
      resolvedEnemies: [
        ...resolution.resolvedEnemies,
        { enemy, index: enemyEntry.index },
      ],
    };
  };

const resolveGridEnemies = (
  state: GameState,
  board: Board,
  playerCell: GridCell,
): ReadonlyArray<Enemy> => {
  const enemiesByPriority = state.enemies
    .map((enemy, index): ResolvedEnemy => ({ enemy, index }))
    .toSorted(
      (leftEnemy, rightEnemy) =>
        leftEnemy.enemy.spawnOrder - rightEnemy.enemy.spawnOrder,
    );

  const resolution = enemiesByPriority.reduce(
    resolveEnemyByPriority(state, board, playerCell),
    { reservedCells: [], resolvedEnemies: [] },
  );

  return resolution.resolvedEnemies
    .toSorted((leftEnemy, rightEnemy) => leftEnemy.index - rightEnemy.index)
    .map((resolvedEnemy) => resolvedEnemy.enemy);
};

const canResolveGridEnemies = (state: GameState): boolean =>
  state.stateVersion >= CURRENT_STATE_VERSION &&
  state.board !== undefined &&
  state.player.cell !== undefined;

const updateEnemiesOnTick = (state: GameState): ReadonlyArray<Enemy> => {
  const { board, canvas, enemies, player, playerMoved } = state;

  if (
    !canResolveGridEnemies(state) ||
    board === undefined ||
    player.cell === undefined
  ) {
    return enemies.map((enemy) => moveEnemyTowardPlayer(enemy, player, canvas));
  }

  if (!playerMoved) {
    return enemies;
  }

  return resolveGridEnemies(state, board, player.cell);
};

/**
 * Pure reducer for enemy movement. Runs the chase logic only on
 * a `tick` action; movement input variants leave enemies unchanged
 * (they are handled by `updatePlayer`). The `default` arm uses a
 * `never`-typed assignment so the compiler errors when a new
 * {@link GameAction} variant is added without a matching case
 * (per A-19).
 *
 * @param state - The current game state
 * @param action - The action to apply
 * @returns A new game state with enemy positions updated on tick,
 *   unchanged otherwise
 */
export const updateEnemies = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case "tick": {
      const updatedEnemies = updateEnemiesOnTick(state);
      return { ...state, enemies: updatedEnemies };
    }
    case "move-down":
    case "move-left":
    case "move-right":
    case "move-up": {
      return state;
    }
    /* c8 ignore start -- unreachable per A-19 exhaustiveness check */
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
    /* c8 ignore stop */
  }
};
