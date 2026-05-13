import type * as Utilities from "@bruff/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { log } from "@bruff/utils";
import loop from "./loop.js";

vi.mock("@bruff/utils", async (importOriginal) => {
  const original = await importOriginal<typeof Utilities>();
  return {
    ...original,
    log: vi.fn(),
  };
});

vi.mock("./loop.js", () => ({
  default: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe("entry", () => {
  it("registers the game element and logs through the event bus", async () => {
    vi.stubGlobal("__APP_VERSION__", "0.0.0");

    await import("./entry.js");

    expect(customElements.get("bruff-game")).toBeDefined();
    expect(log).toHaveBeenCalledWith({
      level: "info",
      message: "bruff game v0.0.0 was defined",
      source: "@bruff/game/effects/entry",
    });
    expect(loop).toHaveBeenCalledOnce();
  });
});
