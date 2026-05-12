import { afterEach, describe, expect, it, vi } from "vitest";

import { consoleLogHandler } from "./console-log-handler";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("consoleLogHandler", () => {
  it.each(["debug", "info", "warn", "error"] as const)(
    "routes %s level to matching console method",
    (level) => {
      const spy = vi.spyOn(console, level).mockImplementation(() => undefined);

      consoleLogHandler({ level, message: "m" });

      expect(spy).toHaveBeenCalledTimes(1);
    },
  );

  it("logs only prefix and message when source and context are absent", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    consoleLogHandler({ level: "info", message: "m" });

    expect(spy).toHaveBeenCalledWith("[info]", "m");
  });

  it("includes source and context when both are present", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    consoleLogHandler({
      level: "warn",
      message: "m",
      source: "unit",
      context: { id: 1 },
    });

    expect(spy).toHaveBeenCalledWith("[warn]", "m", {
      source: "unit",
      context: { id: 1 },
    });
  });
});
