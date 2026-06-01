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

/**
 * Curried functor map for {@link Result}. Applies `transform` to the
 * value of an `ok` result; passes any `error` through unchanged.
 *
 * @param transform - Function applied to the success value
 * @returns A function that maps a `Result<T, E>` to a `Result<U, E>`
 */
export const mapResult =
  <T, U, E>(transform: (value: T) => U) =>
  (result: Result<T, E>): Result<U, E> =>
    result.type === "ok" ? ok(transform(result.value)) : result;

/**
 * Curried monadic bind for {@link Result}. Threads an `ok` value into
 * a fallible continuation; passes any upstream `error` through
 * unchanged. The continuation may introduce its own error variant —
 * the resulting failure type is the union of the upstream and
 * continuation reasons, so railway-oriented chains accumulate
 * possible failure modes through `pipe()` without losing precision.
 *
 * @param next - Function returning a follow-on `Result`
 * @returns A function that maps a `Result<T, UpstreamError>` to a
 *   `Result<U, UpstreamError | NextError>`
 */
export const flatMapResult =
  <T, U, NextError>(next: (value: T) => Result<U, NextError>) =>
  <UpstreamError>(
    result: Result<T, UpstreamError>,
  ): Result<U, NextError | UpstreamError> =>
    result.type === "ok" ? next(result.value) : result;

/**
 * Curried functor map over the failure track. Applies `transform` to
 * the reason of an `error` result; passes any `ok` through unchanged.
 *
 * @param transform - Function applied to the failure reason
 * @returns A function that maps a `Result<T, E>` to a `Result<T, F>`
 */
export const mapError =
  <T, E, F>(transform: (reason: E) => F) =>
  (result: Result<T, E>): Result<T, F> =>
    result.type === "error" ? error(transform(result.error)) : result;

/**
 * Curried elimination that extracts the `ok` value or returns
 * `fallback` for an `error` result.
 *
 * @param fallback - Value returned when the result is an `error`
 * @returns A function that reduces a `Result<T, E>` to a `T`
 */
export const unwrapOr =
  <T, E>(fallback: T) =>
  (result: Result<T, E>): T =>
    result.type === "ok" ? result.value : fallback;
