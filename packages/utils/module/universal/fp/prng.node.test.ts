import { describe, expect, it } from "vitest";

import { createPrng, nextId, nextNumber, type PrngState } from "./prng.ts";

const SEED_ONE = 42;
const SEED_TWO = 12_345;
const SEQUENCE_LENGTH = 1001;
const ID_COUNT = 10_000;
const ONE = 1;
const ZERO = 0;

const generateNumberBatch = (seed: number = SEED_ONE): number[] => {
  let state: PrngState = createPrng(seed);
  return Array.from({ length: SEQUENCE_LENGTH }, () => {
    const step = nextNumber(state);
    state = step.prng;
    return step.value;
  });
};

const generateIdBatch = (count: number): string[] => {
  let state: PrngState = createPrng(SEED_ONE);
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
    const runA = generateNumberBatch();
    const runB = generateNumberBatch();
    expect(runA).toEqual(runB);
  });

  it("produces different sequences for different seeds", () => {
    const runA = generateNumberBatch();
    const runB = generateNumberBatch(SEED_TWO);
    expect(runA).not.toEqual(runB);
  });

  it("all values are in the half-open interval [0, 1)", () => {
    const values = generateNumberBatch();
    const isAllInRange = values.every((value) => value >= ZERO && value < ONE);
    expect(isAllInRange).toBe(true);
  });

  it("sequence of 1001 values has no consecutive duplicates", () => {
    const values = generateNumberBatch();
    const hasConsecutiveDuplicate = values.some(
      (value, index) => index > ZERO && value === values[index - ONE],
    );
    expect(hasConsecutiveDuplicate).toBe(false);
  });
});

describe("nextId", () => {
  it("generates unique values across 10000 draws", () => {
    const ids = generateIdBatch(ID_COUNT);
    const idSet = new Set(ids);
    expect(idSet.size).toBe(ID_COUNT);
  });

  it("same seed produces the same ID sequence", () => {
    const runA = generateIdBatch(SEQUENCE_LENGTH);
    const runB = generateIdBatch(SEQUENCE_LENGTH);
    expect(runA).toEqual(runB);
  });
});
