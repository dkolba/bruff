import { afterEach, describe, expect, it, vi } from "vitest";

import { consoleLogHandler } from "./console-log-handler";

const EXPECTED_CALL_COUNT = 1;
const CONTEXT_ID = 1;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("consoleLogHandler", () => {
  it.each(["debug", "info", "warn", "error"] as const)(
    "routes %s level to matching console method",
    (level) => {
      const spy = vi.spyOn(console, level).mockImplementation(() => true);

      consoleLogHandler({ level, message: "m" });

      expect(spy).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
    },
  );

  it("logs only prefix and message when source and context are absent", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => true);

    consoleLogHandler({ level: "info", message: "m" });

    expect(spy).toHaveBeenCalledWith("[info]", "m");
  });

  it("includes source and context when both are present", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => true);

    consoleLogHandler({
      context: { id: CONTEXT_ID },
      level: "warn",
      message: "m",
      source: "unit",
    });

    expect(spy).toHaveBeenCalledWith("[warn]", "m", {
      context: { id: CONTEXT_ID },
      source: "unit",
    });
  });
});
