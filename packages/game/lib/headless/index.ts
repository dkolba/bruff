export type { InputAction } from "../core/actions.ts";
export type { CanvasSize, GameState, GridCell } from "../core/types.ts";
export { normaliseKey } from "../input/normalise-input.ts";
export {
  createHeadlessGame,
  type HeadlessGameOptions,
} from "./create-headless-game.ts";
export {
  type HeadlessFrame,
  type HeadlessFrameCell,
  type HeadlessFrameEntity,
  projectHeadlessFrame,
} from "./project-headless-frame.ts";
export { stepHeadlessGame } from "./step-headless-game.ts";
