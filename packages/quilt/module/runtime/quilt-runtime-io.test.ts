/* eslint-disable unicorn/text-encoding-identifier-case, sort-imports -- ASCII is a @bruff/glyph catalog group name. */
import { createTileMapData } from "../model/tile-map-data.ts";
import { createQuiltState } from "../state/quilt-state.ts";
import { createQuiltRuntime } from "./quilt-runtime.ts";
import { describe, expect, test } from "vitest";

const CANVAS_SIZE_64 = 64;

const createRuntimeNodes = (): Readonly<{
  doorToolButton: HTMLButtonElement;
  eraseToolButton: HTMLButtonElement;
  errorRegion: HTMLDivElement;
  exportButton: HTMLButtonElement;
  floorToolButton: HTMLButtonElement;
  gridSizeSelect: HTMLSelectElement;
  importButton: HTMLButtonElement;
  importInput: HTMLInputElement;
  overlayCanvas: HTMLCanvasElement;
  paintToolButton: HTMLButtonElement;
  terrainCanvas: HTMLCanvasElement;
  wallToolButton: HTMLButtonElement;
}> => ({
  doorToolButton: document.createElement("button"),
  eraseToolButton: document.createElement("button"),
  errorRegion: document.createElement("div"),
  exportButton: document.createElement("button"),
  floorToolButton: document.createElement("button"),
  gridSizeSelect: document.createElement("select"),
  importButton: document.createElement("button"),
  importInput: document.createElement("input"),
  overlayCanvas: document.createElement("canvas"),
  paintToolButton: document.createElement("button"),
  terrainCanvas: document.createElement("canvas"),
  wallToolButton: document.createElement("button"),
});

const createFileWithText = (content: string, filename: string): File =>
  new File([content], filename, { type: "application/json" });

const VALID_GLYPH_JSON = JSON.stringify({
  door: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "+", glyphKey: "PLUS", groupName: "ASCII" },
    name: "+",
    path: "M0 0L1 1Z",
    unicode: "+",
    unitsPerEm: 1000,
  },
  enemy: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "e", glyphKey: "LATIN_E", groupName: "ASCII" },
    name: "e",
    path: "M0 0L1 1Z",
    unicode: "e",
    unitsPerEm: 1000,
  },
  floor: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: ".", glyphKey: "PERIOD", groupName: "ASCII" },
    name: ".",
    path: "M0 0L1 1Z",
    unicode: ".",
    unitsPerEm: 1000,
  },
  player: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "@", glyphKey: "AT", groupName: "ASCII" },
    name: "@",
    path: "M0 0L1 1Z",
    unicode: "@",
    unitsPerEm: 1000,
  },
  wall: {
    LICENSE: "MIT",
    advanceWidth: 700,
    bounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
    mappedGlyph: { glyph: "#", glyphKey: "HASH", groupName: "ASCII" },
    name: "#",
    path: "M0 0L1 1Z",
    unicode: "#",
    unitsPerEm: 1000,
  },
});

describe("quilt runtime IO", () => {
  test("export button triggers download via object URL", () => {
    const runtimeNodes = createRuntimeNodes();
    createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const createdUrls: Array<string> = [];

    globalThis.URL.createObjectURL = (): string => {
      createdUrls.push("blob:test");
      return "blob:test";
    };
    globalThis.URL.revokeObjectURL = (): void => {
      // No-op stub for test environment.
    };

    runtimeNodes.exportButton.click();

    expect(createdUrls).toStrictEqual(["blob:test"]);
  });

  test("import button click triggers file input click", () => {
    const runtimeNodes = createRuntimeNodes();
    let inputClicked = false;
    runtimeNodes.importInput.click = (): void => {
      inputClicked = true;
    };

    createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    runtimeNodes.importButton.click();

    expect(inputClicked).toBe(true);
  });

  test("shows visible error for invalid glyph JSON import", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const file = createFileWithText("not json", "bad.json");
    const originalText = file.text.bind(file);
    file.text = (): Promise<string> => Promise.resolve("not json");

    Object.defineProperty(runtimeNodes.importInput, "files", {
      configurable: true,
      get: () => [file],
    });
    runtimeNodes.importInput.dispatchEvent(new Event("change"));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(runtime.getState().visibleErrors).toStrictEqual([
          { message: "Failed to parse glyph JSON file." },
        ]);
        file.text = originalText;
        resolve();
      }, 10);
    });
  });

  test("shows error for invalid Sigil glyph map structure", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const file = createFileWithText("{}", "empty.json");
    const originalText = file.text.bind(file);
    file.text = (): Promise<string> => Promise.resolve("{}");

    Object.defineProperty(runtimeNodes.importInput, "files", {
      configurable: true,
      get: () => [file],
    });
    runtimeNodes.importInput.dispatchEvent(new Event("change"));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(runtime.getState().visibleErrors).toStrictEqual([
          {
            message: "Invalid glyph JSON: not a valid Sigil glyph map.",
          },
        ]);
        file.text = originalText;
        resolve();
      }, 10);
    });
  });

  test("successfully imports valid glyph JSON and updates terrainGlyphs", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const file = createFileWithText(VALID_GLYPH_JSON, "glyphs.json");
    const originalText = file.text.bind(file);
    file.text = (): Promise<string> => Promise.resolve(VALID_GLYPH_JSON);

    Object.defineProperty(runtimeNodes.importInput, "files", {
      configurable: true,
      get: () => [file],
    });
    runtimeNodes.importInput.dispatchEvent(new Event("change"));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(runtime.getState().visibleErrors).toStrictEqual([]);
        expect(runtime.getState().terrainGlyphs.floor).toBeDefined();
        expect(runtime.getState().terrainGlyphs.wall).toBeDefined();
        expect(runtime.getState().terrainGlyphs.door).toBeDefined();
        file.text = originalText;
        resolve();
      }, 10);
    });
  });

  test("handles empty file selection gracefully", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });

    Object.defineProperty(runtimeNodes.importInput, "files", {
      configurable: true,
      get: () => [],
    });
    runtimeNodes.importInput.dispatchEvent(new Event("change"));

    expect(runtime.getState().visibleErrors).toStrictEqual([]);
  });

  test("shows error when file read fails", () => {
    const runtimeNodes = createRuntimeNodes();
    const runtime = createQuiltRuntime({
      ...runtimeNodes,
      canvasSize: CANVAS_SIZE_64,
      quiltState: createQuiltState({
        tileMapData: createTileMapData({ height: 4, width: 4 }),
      }),
    });
    const file = createFileWithText("", "bad.json");
    const originalText = file.text.bind(file);
    file.text = (): Promise<string> => Promise.reject(new Error("Read failed"));

    Object.defineProperty(runtimeNodes.importInput, "files", {
      configurable: true,
      get: () => [file],
    });
    runtimeNodes.importInput.dispatchEvent(new Event("change"));

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(runtime.getState().visibleErrors).toStrictEqual([
          { message: "Failed to read glyph JSON file." },
        ]);
        file.text = originalText;
        resolve();
      }, 10);
    });
  });
});
