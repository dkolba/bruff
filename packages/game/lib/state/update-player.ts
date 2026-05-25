/* eslint-disable sort-imports -- Imports are grouped by reducer dependency role. */
import { PLAYER_SIZE, PLAYER_SPEED, ZERO } from "../core/constants.js";
import { clamp } from "@bruff/utils";
import { cellForAction, isCellInsideBoard } from "./grid.js";
import { isCellOccupiedByEnemy } from "./occupancy.js";
import type { GameAction, InputAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";

type PixelDelta = Readonly<{
  dx: number;
  dy: number;
}>;

const applyDelta = (state: GameState, dx: number, dy: number): GameState => ({
  ...state,
  player: {
    ...state.player,
    xPos: clamp(state.player.xPos + dx, ZERO, state.canvas.width - PLAYER_SIZE),
    yPos: clamp(
      state.player.yPos + dy,
      ZERO,
      state.canvas.height - PLAYER_SIZE,
    ),
  },
  playerMoved: true,
});

const pixelDeltaForAction = (action: InputAction): PixelDelta => {
  switch (action.type) {
    case "move-up": {
      return { dx: ZERO, dy: -PLAYER_SPEED };
    }
    case "move-down": {
      return { dx: ZERO, dy: PLAYER_SPEED };
    }
    case "move-left": {
      return { dx: -PLAYER_SPEED, dy: ZERO };
    }
    case "move-right": {
      return { dx: PLAYER_SPEED, dy: ZERO };
    }
    /* c8 ignore start -- unreachable per input action union */
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
    /* c8 ignore stop */
  }
};

const isGridMoveBlocked = (
  state: GameState,
  destination: NonNullable<GameState["player"]["cell"]>,
  board: NonNullable<GameState["board"]>,
): boolean => {
  const { enemies } = state;
  return (
    !isCellInsideBoard(destination, board) ||
    isCellOccupiedByEnemy(destination, enemies)
  );
};

const applyAcceptedGridMove = (
  state: GameState,
  destination: NonNullable<GameState["player"]["cell"]>,
  action: InputAction,
): GameState => {
  const delta = pixelDeltaForAction(action);
  const movedState = applyDelta(state, delta.dx, delta.dy);
  return {
    ...movedState,
    player: {
      ...movedState.player,
      cell: destination,
    },
  };
};

const applyGridMove = (state: GameState, action: InputAction): GameState => {
  const { board, player } = state;

  if (board === undefined || player.cell === undefined) {
    const delta = pixelDeltaForAction(action);
    return applyDelta(state, delta.dx, delta.dy);
  }

  const destination = cellForAction(player.cell, action);
  if (isGridMoveBlocked(state, destination, board)) {
    return state;
  }

  return applyAcceptedGridMove(state, destination, action);
};

/**
 * Pure reducer for player movement. Maps each {@link GameAction}
 * variant to a new {@link GameState}; the `tick` arm is a no-op
 * (enemies are advanced in `updateEnemies`). The `default` arm uses
 * a `never`-typed assignment so the compiler errors when a new
 * {@link GameAction} variant is added without a matching case
 * (per A-19).
 *
 * @param state - The current game state
 * @param action - The action to apply
 * @returns A new game state with the player position updated
 */
const updatePlayer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "move-up": {
      return applyGridMove(state, action);
    }
    case "move-down": {
      return applyGridMove(state, action);
    }
    case "move-left": {
      return applyGridMove(state, action);
    }
    case "move-right": {
      return applyGridMove(state, action);
    }
    case "tick": {
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

export default updatePlayer;
