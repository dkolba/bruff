/**
 * Normalised movement input accepted by the deterministic game step.
 */
export type InputAction =
  | Readonly<{ type: "move-down" }>
  | Readonly<{ type: "move-left" }>
  | Readonly<{ type: "move-right" }>
  | Readonly<{ type: "move-up" }>;

/**
 * Discrete board cell used by gameplay movement and rendering.
 */
export type GridCell = Readonly<{
  column: number;
  row: number;
}>;

/**
 * Tactical board dimensions measured in cells.
 */
export type Board = Readonly<{
  columns: number;
  rows: number;
}>;

/**
 * Plain viewport dimensions used by render projections.
 */
export type CanvasSize = Readonly<{
  height: number;
  width: number;
}>;

/**
 * Opaque player identifier.
 */
export type PlayerId = string & Readonly<{ __brand?: "PlayerId" }>;

/**
 * Opaque enemy identifier.
 */
export type EnemyId = string & Readonly<{ __brand?: "EnemyId" }>;

/**
 * Opaque deterministic PRNG state.
 */
export type PrngState = Readonly<{
  accumulator: number;
  type: "prng-state";
}>;

/**
 * Player entity state.
 */
export type Player = Readonly<{
  cell: GridCell;
  id: PlayerId;
  size: number;
}>;

/**
 * Enemy entity state.
 */
export type Enemy = Readonly<{
  cell: GridCell;
  id: EnemyId;
  size: number;
  spawnOrder: number;
}>;

/**
 * Complete immutable game state snapshot.
 */
export type GameState = Readonly<{
  board: Board;
  canvas: CanvasSize;
  enemies: ReadonlyArray<Enemy>;
  input: ReadonlyArray<InputAction>;
  player: Player;
  playerMoved: boolean;
  frameIndex: number;
  prng: PrngState;
  seed: number;
  stateVersion: number;
}>;

/**
 * Options for creating a DOM-free deterministic game state.
 */
export type HeadlessGameOptions = Readonly<{
  canvas: CanvasSize;
  seed?: number;
}>;

/**
 * Entity roles exposed to non-Canvas renderers.
 */
export type HeadlessFrameEntity = "enemy" | "player";

/**
 * Renderer-neutral entity cell in a headless frame.
 */
export type HeadlessFrameCell = Readonly<{
  cell: GridCell;
  entity: HeadlessFrameEntity;
}>;

/**
 * DOM-free frame data for non-Canvas renderers.
 */
export type HeadlessFrame = Readonly<{
  board: Board;
  cells: ReadonlyArray<HeadlessFrameCell>;
  frameIndex: number;
}>;

/**
 * Create the initial game state without touching browser APIs.
 */
export declare const createHeadlessGame: (
  options: HeadlessGameOptions,
) => GameState;

/**
 * Project a game state into DOM-free frame data.
 */
export declare const projectHeadlessFrame: (state: GameState) => HeadlessFrame;

/**
 * Advance a headless game state through the deterministic step path.
 */
export declare const stepHeadlessGame: (
  state: GameState,
  inputs: ReadonlyArray<InputAction>,
) => GameState;

/**
 * Normalise raw keyboard text into a movement input when possible.
 */
export declare const normaliseKey: (
  key: string,
) =>
  Readonly<{ type: "none" }> | Readonly<{ type: "some"; value: InputAction }>;
