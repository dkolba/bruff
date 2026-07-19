import type { GameState, GridCell } from "../core/types.ts";

/**
Entity roles that renderer-neutral board cells can contain.
*/
export type RenderCellEntity = "enemy" | "player";

/**
Renderer-neutral foreground entity projected onto a board cell.
*/
export type RenderCell = Readonly<{
  /**
  Board cell occupied by the entity.
  */
  cell: GridCell;
  /**
  Projected entity role.
  */
  entity: RenderCellEntity;
  /**
  Enemy spawn order for deterministic consumers that need it.
  */
  spawnOrder?: number;
}>;

const enemyRenderCell = (enemy: GameState["enemies"][number]): RenderCell => ({
  cell: enemy.cell,
  entity: "enemy",
  spawnOrder: enemy.spawnOrder,
});

/**
Project a state snapshot into renderer-neutral foreground board cells.
*/
export const projectRenderCells = (
  state: GameState,
): ReadonlyArray<RenderCell> => [
  { cell: state.player.cell, entity: "player" },
  ...state.enemies.map((enemy) => enemyRenderCell(enemy)),
];
