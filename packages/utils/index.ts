export { log, onLog } from "./module/event-bus/event-bus.ts";
export type { LogEvent } from "./module/event-bus/log-event.ts";
export type { LogLevel } from "./module/event-bus/log-level.ts";
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
} from "./module/fp/option.ts";
export { pipe } from "./module/fp/pipe.ts";
export {
  createPrng,
  nextId,
  nextNumber,
  type PrngState,
} from "./module/fp/prng.ts";
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
} from "./module/fp/result.ts";
export { clamp } from "./module/math/clamp.ts";
export { hsla } from "./module/color/hsla.ts";
export { getCardinalDirection } from "./module/direction/get-cardinal-direction.ts";
export { brand, type Brand } from "./module/types/brand.ts";
