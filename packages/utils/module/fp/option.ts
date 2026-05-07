/**
 * The present variant of an {@link Option}.
 */
export type Some<T> = Readonly<{ type: "some"; value: T }>;

/**
 * The absent variant of an {@link Option}.
 */
export type None = Readonly<{ type: "none" }>;

/**
 * A discriminated union representing either a present value (`some`)
 * or an explicit absence (`none`). Used as the project-wide return
 * shape for partial functions and lookups; throwing is forbidden in
 * domain code.
 */
export type Option<T> = None | Some<T>;

/**
 * Wraps a value in the present variant.
 *
 * @param value - The value to wrap
 * @returns An {@link Option} carrying `value`
 */
export const some = <T>(value: T): Option<T> => ({
  type: "some",
  value,
});

/**
 * The singleton absent variant. Typed as `Option<never>` so it is
 * assignable to any `Option<T>`.
 */
export const none: Option<never> = { type: "none" };

/**
 * Type guard narrowing an {@link Option} to its `Some` variant.
 *
 * @param option - The option to inspect
 * @returns `true` when `option` is the `some` variant
 */
export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option.type === "some";

/**
 * Type guard narrowing an {@link Option} to its `None` variant.
 *
 * @param option - The option to inspect
 * @returns `true` when `option` is the `none` variant
 */
export const isNone = <T>(option: Option<T>): option is None =>
  option.type === "none";
