import { type Brand, brand } from "./brand.ts";
import { describe, expect, it } from "vitest";

const SAMPLE_STRING = "abc";
const SAMPLE_NUMBER = 7;

describe("brand", () => {
  it("returns the input string by reference", () => {
    expect(brand<"UserId">(SAMPLE_STRING)).toBe(SAMPLE_STRING);
  });

  it("preserves an arbitrary base type", () => {
    const branded: Brand<number, "TickIndex"> = brand<"TickIndex", number>(
      SAMPLE_NUMBER,
    );
    expect(branded).toBe(SAMPLE_NUMBER);
  });

  it("preserves object identity", () => {
    const payload = { id: SAMPLE_STRING };
    const branded: Brand<{ id: string }, "Wrapper"> = brand<
      "Wrapper",
      { id: string }
    >(payload);
    expect(branded).toBe(payload);
  });
});
