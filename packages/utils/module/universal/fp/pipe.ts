export type UnaryFunction<T, R> = (argument: T) => R;

/**
 * Pipe arguments through functions.
 *
 * @param value - The input value
 * @returns T - The same value
 */
export function pipe<T>(value: T): T;

/**
 * @param function1 - The first function
 * @returns UnaryFunction\<T, A\> - The resulting function
 */
export function pipe<T, A>(function1: UnaryFunction<T, A>): UnaryFunction<T, A>;

/**
 * @param function1 - The first function
 * @param function2 - The second function
 * @returns UnaryFunction\<T, B\> - The resulting function
 */
export function pipe<T, A, B>(
  function1: UnaryFunction<T, A>,
  function2: UnaryFunction<A, B>,
): UnaryFunction<T, B>;

/**
 * @param function1 - The first function
 * @param function2 - The second function
 * @param function3 - The third function
 * @returns UnaryFunction\<T, C\> - The resulting function
 */
export function pipe<T, A, B, C>(
  function1: UnaryFunction<T, A>,
  function2: UnaryFunction<A, B>,
  function3: UnaryFunction<B, C>,
): UnaryFunction<T, C>;

/**
 * @param function1 - The first function
 * @param function2 - The second function
 * @param function3 - The third function
 * @param function4 - The fourth function
 * @returns UnaryFunction\<T, D\> - The resulting function
 */
/* eslint-disable-next-line max-params */
export function pipe<T, A, B, C, D>(
  function1: UnaryFunction<T, A>,
  function2: UnaryFunction<A, B>,
  function3: UnaryFunction<B, C>,
  function4: UnaryFunction<C, D>,
): UnaryFunction<T, D>;

/**
 * Implementation
 *
 * @param steps - Functions to be composed from left to right
 * @returns UnaryFunction\<unknown, unknown\> - A function that applies all steps in sequence to the input value
 */
export function pipe(
  ...steps: readonly UnaryFunction<unknown, unknown>[]
): UnaryFunction<unknown, unknown> {
  return (box: unknown): unknown =>
    steps.reduce((toy, magic) => magic(toy), box);
}
