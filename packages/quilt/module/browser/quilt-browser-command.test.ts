import { describe, expect, test } from "vitest";
import { createDownloadMapCommand } from "./quilt-browser-command.ts";

describe("quilt browser command", () => {
  test("creates download command data outside the Web Component", () => {
    expect(
      createDownloadMapCommand({ filename: "map.json", text: "{}" }),
    ).toStrictEqual({ filename: "map.json", text: "{}", type: "downloadText" });
  });
});
