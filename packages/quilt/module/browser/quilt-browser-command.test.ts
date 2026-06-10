import { describe, expect, test } from "vitest";
import {
  createDownloadMapCommand,
  createReadJsonFileCommand,
} from "./quilt-browser-command.ts";

describe("quilt browser command", () => {
  test("creates download command data outside the Web Component", () => {
    expect(
      createDownloadMapCommand({ filename: "map.json", text: "{}" }),
    ).toStrictEqual({ filename: "map.json", text: "{}", type: "downloadText" });
  });

  test("creates read JSON file command data wrapping a File object", () => {
    const file = new File(["{}"], "glyphs.json", {
      type: "application/json",
    });

    expect(createReadJsonFileCommand({ file })).toStrictEqual({
      file,
      type: "readJsonFile",
    });
  });
});
