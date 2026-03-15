import { expect, test } from "vitest";
import { pipe } from "./pipe.js";

const ONE = 1;
const TWO = 2;
const SIX = 6;
const TWELVE = 12;

/**
 * Adds a number to the input value.
 *
 * @param number - The number to add
 * @returns (first: number) =\> number - A function that adds num to its input
 */
const add =
  (second: number): ((first: number) => number) =>
  (first: number): number =>
    first + second;

/**
 * Doubles a number.
 *
 * @param number - The number to double
 * @returns number - The doubled number
 */
const double = (operand: number): number => operand + operand;

test("#pipe", () => {
  const addTwo = add(TWO);
  const pipeline = pipe(addTwo, double);
  // (1 + 2) * 2 = 6
  expect(pipeline(ONE)).toBe(SIX);
});

// Additional test for multiple functions
test("#pipe with multiple functions", () => {
  const addTwo = add(TWO);
  const pipeline = pipe(addTwo, double, double);
  // ((1 + 2) * 2) * 2 = 12
  expect(pipeline(ONE)).toBe(TWELVE);
});
