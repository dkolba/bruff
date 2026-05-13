import { describe, expect, it } from "vitest";

import { isLogCustomEvent } from "./is-log-custom-event";

describe("isLogCustomEvent", () => {
  it("returns true for a valid log CustomEvent", () => {
    const event = new CustomEvent("bruff:log", {
      detail: { level: "info", message: "hello" },
    });

    expect(isLogCustomEvent(event)).toBe(true);
  });

  it("returns true regardless of event name when detail matches shape", () => {
    const event = new CustomEvent("wrong:name", {
      detail: { level: "warn", message: "hello" },
    });

    expect(isLogCustomEvent(event)).toBe(true);
  });

  it("returns false for non-CustomEvent values", () => {
    const event = new Event("bruff:log");

    expect(isLogCustomEvent(event)).toBe(false);
  });

  it("returns false for malformed detail", () => {
    const invalidLevelEvent = new CustomEvent("bruff:log", {
      detail: { level: "oops", message: "hello" },
    });
    const missingMessageEvent = new CustomEvent("bruff:log", {
      detail: { level: "debug" },
    });

    expect(isLogCustomEvent(invalidLevelEvent)).toBe(false);
    expect(isLogCustomEvent(missingMessageEvent)).toBe(false);
  });
});
