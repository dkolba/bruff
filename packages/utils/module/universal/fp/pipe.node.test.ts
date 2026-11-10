import { expect, test } from "vitest";

import { pipe } from "./pipe.ts";

const ONE = 1;
const TWO = 2;
const SIX = 6;
const TWELVE = 12;

/**
 * Adds two to the input value.
 *
 * @param first - The number to increment
 * @returns number - Two more than the input
 */
const addTwo = (first: number): number => first + TWO;

/**
 * Doubles a number.
 *
 * @param number - The number to double
 * @returns number - The doubled number
 */
const double = (operand: number): number => operand + operand;

test("#pipe", () => {
  const pipeline = pipe(addTwo, double);
  // (1 + 2) * 2 = 6
  expect(pipeline(ONE)).toBe(SIX);
});

// Additional test for multiple functions
test("#pipe with multiple functions", () => {
  const pipeline = pipe(addTwo, double, double);
  // ((1 + 2) * 2) * 2 = 12
  expect(pipeline(ONE)).toBe(TWELVE);
});
