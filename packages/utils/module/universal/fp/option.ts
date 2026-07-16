import { error, ok, type Result } from "./result.ts";

/**
The present variant of an {@link Option}.
*/
export type Some<T> = Readonly<{ type: "some"; value: T }>;

/**
The absent variant of an {@link Option}.
*/
export type None = Readonly<{ type: "none" }>;

/**
A discriminated union representing either a present value (`some`)
or an explicit absence (`none`). Used as the project-wide return
shape for partial functions and lookups; throwing is forbidden in
domain code.
*/
export type Option<T> = None | Some<T>;

/**
Wraps a value in the present variant.

@param value - The value to wrap
@returns An {@link Option} carrying `value`
*/
export const some = <T>(value: T): Option<T> => ({
  type: "some",
  value,
});

/**
The singleton absent variant. Typed as `Option<never>` so it is
assignable to any `Option<T>`.
*/
export const none: Option<never> = { type: "none" };

/**
Type guard narrowing an {@link Option} to its `Some` variant.

@param option - The option to inspect
@returns `true` when `option` is the `some` variant
*/
export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option.type === "some";

/**
Type guard narrowing an {@link Option} to its `None` variant.

@param option - The option to inspect
@returns `true` when `option` is the `none` variant
*/
export const isNone = <T>(option: Option<T>): option is None =>
  option.type === "none";

/**
Curried functor map for {@link Option}. Applies `transform` to the
value of a `some` option; passes `none` through unchanged.

@param transform - Function applied to the present value
@returns A function that maps an `Option<T>` to an `Option<U>`
*/
export const mapOption =
  <T, U>(transform: (value: T) => U) =>
  (option: Option<T>): Option<U> =>
    option.type === "some" ? some(transform(option.value)) : option;

/**
Curried monadic bind for {@link Option}. Threads a `some` value into
a partial continuation; passes `none` through unchanged.

@param next - Function returning a follow-on `Option`
@returns A function that maps an `Option<T>` to an `Option<U>`
*/
export const flatMapOption =
  <T, U>(next: (value: T) => Option<U>) =>
  (option: Option<T>): Option<U> =>
    option.type === "some" ? next(option.value) : option;

/**
Curried bridge from {@link Option} to {@link Result}. Promotes
`some` values to `ok` results and replaces `none` with the supplied
error reason. The parameter is named `reason` rather than `error`
to avoid shadowing the imported `error` constructor.

@param reason - The error to attach when the option is `none`
@returns A function that maps an `Option<T>` to a `Result<T, E>`
*/
export const toResult =
  <T, E>(reason: E) =>
  (option: Option<T>): Result<T, E> =>
    option.type === "some" ? ok(option.value) : error(reason);
