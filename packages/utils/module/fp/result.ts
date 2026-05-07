/**
 * The success variant of a {@link Result}.
 */
export type Ok<T> = Readonly<{ type: "ok"; value: T }>;

/**
 * The failure variant of a {@link Result}.
 */
export type Failure<E> = Readonly<{ error: E; type: "error" }>;

/**
 * A discriminated union representing either a successful value (`ok`)
 * or a typed error (`error`). Used as the project-wide return shape for
 * any function that can fail; throwing is forbidden in domain code.
 */
export type Result<T, E> = Ok<T> | Failure<E>;

/**
 * Wraps a value in a successful {@link Result}.
 *
 * @param value - The value to wrap
 * @returns A {@link Result} carrying `value` on the success track
 */
export const ok = <T>(value: T): Result<T, never> => ({
  type: "ok",
  value,
});

/**
 * Wraps a reason in a failed {@link Result}.
 *
 * @param reason - The error to wrap
 * @returns A {@link Result} carrying `reason` on the failure track
 */
export const error = <E>(reason: E): Result<never, E> => ({
  error: reason,
  type: "error",
});

/**
 * Type guard narrowing a {@link Result} to its `Ok` variant.
 *
 * @param result - The result to inspect
 * @returns `true` when `result` is the `ok` variant
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result.type === "ok";

/**
 * Type guard narrowing a {@link Result} to its `Failure` variant.
 *
 * @param result - The result to inspect
 * @returns `true` when `result` is the `error` variant
 */
export const isError = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.type === "error";
