export {
  createHeadlessGame,
  type HeadlessGameOptions,
} from "./create-headless-game.ts";
export {
  projectHeadlessFrame,
  type HeadlessFrame,
  type HeadlessFrameCell,
  type HeadlessFrameEntity,
} from "./project-headless-frame.ts";
export { stepHeadlessGame } from "./step-headless-game.ts";
export { normaliseKey } from "../input/normalise-input.ts";
export type { InputAction } from "../core/actions.ts";
export type { CanvasSize, GameState, GridCell } from "../core/types.ts";
