import type { CanvasSize, GameState } from "../core/types.ts";
import createInitialState from "../state/create-initial-state.ts";

/**
Options for creating a DOM-free deterministic game state.
*/
export type HeadlessGameOptions = Readonly<{
  /**
  Plain viewport dimensions used by render projections.
  */
  canvas: CanvasSize;
  /**
  Deterministic seed for initial entity identity.
  */
  seed?: number;
}>;

/**
Create the initial game state without touching browser APIs.
*/
export const createHeadlessGame = (options: HeadlessGameOptions): GameState =>
  createInitialState(options.canvas, options.seed);
