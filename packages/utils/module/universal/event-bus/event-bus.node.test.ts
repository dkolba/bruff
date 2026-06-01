import { afterEach, describe, expect, it, vi } from "vitest";

import { log, onLog } from "./event-bus";

const EXPECTED_CALL_COUNT = 1;
const FIRST_CALL_INDEX = 0;
const CONTEXT_ID = 1;

const getFirstInvocationCallOrder = (spy: ReturnType<typeof vi.fn>): number =>
  spy.mock.invocationCallOrder[FIRST_CALL_INDEX] ?? Number.NaN;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("log", () => {
  it("returns undefined and does not throw when no subscribers exist", () => {
    expect(() => log({ level: "info", message: "noop" })).not.toThrow();
    expect(log({ level: "info", message: "noop-2" })).toBeUndefined();
  });
});

describe("onLog delivery", () => {
  it("delivers the exact event to a single subscriber", () => {
    const handler = vi.fn();
    const cleanup = onLog(handler);
    const event = {
      context: { id: CONTEXT_ID },
      level: "warn",
      message: "hello",
      source: "test",
    } as const;

    log(event);

    expect(handler).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
    expect(handler).toHaveBeenCalledWith(event);
    cleanup();
  });

  it("does not replay past events to new subscribers", () => {
    log({ level: "info", message: "before-subscribe" });
    const handler = vi.fn();
    const cleanup = onLog(handler);

    expect(handler).not.toHaveBeenCalled();
    cleanup();
  });
});

describe("onLog cleanup", () => {
  it("stops delivery after unsubscribe", () => {
    const handler = vi.fn();
    const cleanup = onLog(handler);

    log({ level: "info", message: "one" });
    cleanup();
    log({ level: "info", message: "two" });

    expect(handler).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
  });

  it("supports idempotent double-unsubscribe", () => {
    const handler = vi.fn();
    const cleanup = onLog(handler);

    cleanup();
    cleanup();
    log({ level: "error", message: "ignored" });

    expect(handler).not.toHaveBeenCalled();
  });
});

describe("onLog ordering", () => {
  it("delivers events in registration order", () => {
    const first = vi.fn();
    const second = vi.fn();
    const cleanupFirst = onLog(first);
    const cleanupSecond = onLog(second);

    log({ level: "info", message: "x" });

    expect(first).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
    expect(second).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
    expect(getFirstInvocationCallOrder(first)).toBeLessThan(
      getFirstInvocationCallOrder(second),
    );

    cleanupFirst();
    cleanupSecond();
  });
});
