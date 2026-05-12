import { describe, expect, it, vi } from "vitest";

import { log, onLog } from "./event-bus";

describe("event-bus", () => {
  it("returns undefined and does not throw when no subscribers exist", () => {
    expect(() => log({ level: "info", message: "noop" })).not.toThrow();
    expect(log({ level: "info", message: "noop-2" })).toBeUndefined();
  });

  it("delivers the exact event to a single subscriber", () => {
    const handler = vi.fn();
    const cleanup = onLog(handler);
    const event = {
      level: "warn",
      message: "hello",
      source: "test",
      context: { id: 1 },
    } as const;

    log(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
    cleanup();
  });

  it("stops delivery after unsubscribe", () => {
    const handler = vi.fn();
    const cleanup = onLog(handler);

    log({ level: "info", message: "one" });
    cleanup();
    log({ level: "info", message: "two" });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("delivers events in registration order", () => {
    const first = vi.fn();
    const second = vi.fn();
    const cleanupFirst = onLog(first);
    const cleanupSecond = onLog(second);

    log({ level: "info", message: "x" });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first.mock.invocationCallOrder[0]).toBeLessThan(
      second.mock.invocationCallOrder[0],
    );

    cleanupFirst();
    cleanupSecond();
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
