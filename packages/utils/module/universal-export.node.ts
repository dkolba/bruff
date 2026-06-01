import { describe, expect, it } from "vitest";
import { pipe } from "./universal/fp/pipe";
import { clamp } from "./universal/math/clamp";
import { getCardinalDirection } from "./universal/direction/get-cardinal-direction";
import { ok } from "./universal/fp/result";
import { brand } from "./universal/types/brand";
import { createPrng } from "./universal/fp/prng";
import { log, onLog } from "./universal/event-bus/event-bus";

const ONE = 1;
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const TEST_SEED = 7;
const ZERO = 0;

describe("universal utils export", () => {
  it("exposes pure helpers in a Node runtime", () => {
    const addOne = (input: number): number => input + ONE;
    const double = (input: number): number => input * TWO;
    const transform = pipe(addOne, double);

    expect(transform(ONE)).toBe(FOUR);
    expect(clamp(THREE, ONE, TWO)).toBe(TWO);
    expect(getCardinalDirection(ONE, ZERO)).toBe("EAST");
    expect(ok("ready")).toStrictEqual({ type: "ok", value: "ready" });
    expect(brand<"SmokeTestId">("id-1")).toBe("id-1");
    expect(createPrng(TEST_SEED)).toStrictEqual({
      accumulator: TEST_SEED,
      type: "prng-state",
    });
  });

  it("exposes the log bus without DOM APIs", () => {
    const received: Array<unknown> = [];
    const unsubscribe = onLog((event): void => {
      received.push(event);
    });

    log({ level: "info", message: "node-ready" });
    unsubscribe();
    log({ level: "info", message: "after-unsubscribe" });

    expect(received).toStrictEqual([{ level: "info", message: "node-ready" }]);
  });
});
