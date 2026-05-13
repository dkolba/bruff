export { consoleLogHandler } from "./module/event-bus/console-log-handler.js";
export { log, onLog } from "./module/event-bus/event-bus.js";
export type { LogEvent } from "./module/event-bus/log-event.js";
export type { LogLevel } from "./module/event-bus/log-level.js";
export { canvasResizeListener } from "./module/canvas/canvas-resize-listener.js";
export { createCanvasResizeObserver } from "./module/canvas/create-canvas-resize-observer.js";
export { getCanvas } from "./module/canvas/get-canvas.js";
export { getCanvasContext } from "./module/canvas/get-canvas-context.js";
export { getShadowGameRoot } from "./module/get-shadow-game-root.js";
export {
  flatMapOption,
  isNone,
  isSome,
  mapOption,
  none,
  type None,
  type Option,
  type Some,
  some,
  toResult,
} from "./module/fp/option.js";
export { pipe } from "./module/fp/pipe.js";
export {
  createPrng,
  nextId,
  nextNumber,
  type PrngState,
} from "./module/fp/prng.js";
export {
  error,
  type Failure,
  flatMapResult,
  isError,
  isOk,
  mapError,
  mapResult,
  ok,
  type Ok,
  type Result,
  unwrapOr,
} from "./module/fp/result.js";
export { clamp } from "./module/math/clamp.js";
export { hsla } from "./module/color/hsla.js";
export { getCardinalDirection } from "./module/direction/get-cardinal-direction.js";
export { radiatingBarsBackgroundAnimation } from "./module/animation/radiating-bars-background-animation.js";
export { brand, type Brand } from "./module/types/brand.js";
