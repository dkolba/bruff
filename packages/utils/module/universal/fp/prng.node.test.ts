import { describe, expect, it } from "vitest";

import { createPrng, nextId, nextNumber, type PrngState } from "./prng.ts";

const SEED_ONE = 42;
const SEED_TWO = 12_345;
const SEQUENCE_LENGTH = 1001;
const ID_COUNT = 10_000;
const ONE = 1;
const ZERO = 0;

const generateNumberBatch = (seed: number, count: number): number[] => {
  let state: PrngState = createPrng(seed);
  return Array.from({ length: count }, () => {
    const step = nextNumber(state);
    state = step.prng;
    return step.value;
  });
};

const generateIdBatch = (seed: number, count: number): string[] => {
  let state: PrngState = createPrng(seed);
  return Array.from({ length: count }, () => {
    const step = nextId(state);
    state = step.prng;
    return step.value;
  });
};

describe("createPrng", () => {
  it("produces different initial states for different seeds", () => {
    expect(createPrng(SEED_ONE)).not.toEqual(createPrng(SEED_TWO));
  });
});

describe("nextNumber", () => {
  it("produces the same sequence for the same seed", () => {
    const runA = generateNumberBatch(SEED_ONE, SEQUENCE_LENGTH);
    const runB = generateNumberBatch(SEED_ONE, SEQUENCE_LENGTH);
    expect(runA).toEqual(runB);
  });

  it("produces different sequences for different seeds", () => {
    const runA = generateNumberBatch(SEED_ONE, SEQUENCE_LENGTH);
    const runB = generateNumberBatch(SEED_TWO, SEQUENCE_LENGTH);
    expect(runA).not.toEqual(runB);
  });

  it("all values are in the half-open interval [0, 1)", () => {
    const values = generateNumberBatch(SEED_ONE, SEQUENCE_LENGTH);
    const isAllInRange = values.every((value) => value >= ZERO && value < ONE);
    expect(isAllInRange).toBe(true);
  });

  it("sequence of 1001 values has no consecutive duplicates", () => {
    const values = generateNumberBatch(SEED_ONE, SEQUENCE_LENGTH);
    const hasConsecutiveDuplicate = values.some(
      (value, index) => index > ZERO && value === values[index - ONE],
    );
    expect(hasConsecutiveDuplicate).toBe(false);
  });
});

describe("nextId", () => {
  it("generates unique values across 10000 draws", () => {
    const ids = generateIdBatch(SEED_ONE, ID_COUNT);
    const idSet = new Set(ids);
    expect(idSet.size).toBe(ID_COUNT);
  });

  it("same seed produces the same ID sequence", () => {
    const runA = generateIdBatch(SEED_ONE, SEQUENCE_LENGTH);
    const runB = generateIdBatch(SEED_ONE, SEQUENCE_LENGTH);
    expect(runA).toEqual(runB);
  });
});
