export { hsla } from "./module/universal/color/hsla.ts";
export { getCardinalDirection } from "./module/universal/direction/get-cardinal-direction.ts";
export { consoleLogHandler } from "./module/universal/event-bus/console-log-handler.ts";
export { log, onLog } from "./module/universal/event-bus/event-bus.ts";
export type { LogEvent } from "./module/universal/event-bus/log-event.ts";
export type { LogLevel } from "./module/universal/event-bus/log-level.ts";
export {
  flatMapOption,
  isNone,
  isSome,
  mapOption,
  type None,
  none,
  type Option,
  type Some,
  some,
  toResult,
} from "./module/universal/fp/option.ts";
export { pipe } from "./module/universal/fp/pipe.ts";
export {
  createPrng,
  nextId,
  nextNumber,
  type PrngState,
} from "./module/universal/fp/prng.ts";
export {
  error,
  type Failure,
  flatMapResult,
  isError,
  isOk,
  mapError,
  mapResult,
  type Ok,
  ok,
  type Result,
  unwrapOr,
} from "./module/universal/fp/result.ts";
export { clamp } from "./module/universal/math/clamp.ts";
export { type Brand, brand } from "./module/universal/types/brand.ts";
