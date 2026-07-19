import { describe, expect, test } from "vitest";

import {
  executeOverlayDrawPlan,
  executeTerrainDrawPlan,
  type QuiltCanvasContext,
} from "./canvas-renderer.ts";
import type { OverlayDrawPlan, TerrainDrawPlan } from "./map-draw-plan.ts";

const TILE_PIXEL_SIZE = 16;
const DOUBLE_TILE = 32;

type CanvasRect = {
  pixelX: number;
  pixelY: number;
  pixelWidth: number;
  pixelHeight: number;
};

const createContext = (): QuiltCanvasContext & {
  calls: ReadonlyArray<string>;
} => {
  const calls: Array<string> = [];

  return {
    calls,
    clearRect: ({ pixelHeight, pixelWidth, pixelX, pixelY }: CanvasRect): void => {
      calls.push(`clear:${pixelX}:${pixelY}:${pixelWidth}:${pixelHeight}`);
    },
    fill: (path, fillRule): void => {
      calls.push(`fill:${fillRule ?? "nonzero"}`);
    },
    fillRect: ({ pixelHeight, pixelWidth, pixelX, pixelY }: CanvasRect): void => {
      calls.push(`fill:${pixelX}:${pixelY}:${pixelWidth}:${pixelHeight}`);
    },
    fillStyle: "#000000",
    restore: (): void => {
      calls.push("restore");
    },
    save: (): void => {
      calls.push("save");
    },
    scale: (scaleX, scaleY): void => {
      calls.push(`scale:${scaleX}:${scaleY}`);
    },
    strokeRect: ({ pixelHeight, pixelWidth, pixelX, pixelY }: CanvasRect): void => {
      calls.push(`stroke:${pixelX}:${pixelY}:${pixelWidth}:${pixelHeight}`);
    },
    translate: (translateX, translateY): void => {
      calls.push(`translate:${translateX}:${translateY}`);
    },
  };
};

type CallPattern = string | RegExp;

const assertCallSequence = (
  calls: ReadonlyArray<string>,
  expected: ReadonlyArray<CallPattern>,
): void => {
  for (const [index, pattern] of expected.entries()) {
    if (typeof pattern === "string") {
      expect(calls[index]).toBe(pattern);
    } else {
      expect(calls[index]).toMatch(pattern);
    }
  }
  expect(calls).toHaveLength(expected.length);
};

describe("canvas renderer — terrain fill plans", () => {
  test("executes terrain draw plans", () => {
    const context = createContext();
    const drawPlan: TerrainDrawPlan = {
      commands: [
        {
          fillStyle: "#d7d0bf",
          kind: "drawTerrainTile",
          pixelHeight: TILE_PIXEL_SIZE,
          pixelWidth: TILE_PIXEL_SIZE,
          pixelX: 0,
          pixelY: 0,
        },
      ],
      kind: "terrain",
    };

    executeTerrainDrawPlan(context, drawPlan);

    expect(context.calls).toStrictEqual(["fill:0:0:16:16"]);
    expect(context.fillStyle).toBe("#d7d0bf");
  });
});

describe("canvas renderer — overlay plans", () => {
  test("executes overlay draw plans", () => {
    const context = createContext();
    const drawPlan: OverlayDrawPlan = {
      commands: [
        {
          kind: "drawGrid",
          pixelHeight: DOUBLE_TILE,
          pixelWidth: DOUBLE_TILE,
        },
        {
          kind: "drawHoverTile",
          pixelHeight: TILE_PIXEL_SIZE,
          pixelWidth: TILE_PIXEL_SIZE,
          pixelX: TILE_PIXEL_SIZE,
          pixelY: 0,
        },
      ],
      kind: "overlay",
    };

    executeOverlayDrawPlan(context, drawPlan);

    expect(context.calls).toStrictEqual([
      "clear:0:0:32:32",
      "stroke:0:0:32:32",
      "stroke:16:0:16:16",
    ]);
  });
});

describe("canvas renderer — glyph path rendering", () => {
  test("executes glyph path draw commands with dark gray fill", () => {
    const context = createContext();
    const drawPlan: TerrainDrawPlan = {
      commands: [
        {
          glyphBounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
          kind: "drawTerrainGlyph",
          path: "M0 0L1 1Z",
          pixelHeight: TILE_PIXEL_SIZE,
          pixelWidth: TILE_PIXEL_SIZE,
          pixelX: 0,
          pixelY: 0,
          tileBounds: { highX: 1, highY: 1, lowX: 0, lowY: 0 },
          unitsPerEm: 1000,
        },
      ],
      kind: "terrain",
    };

    executeTerrainDrawPlan(context, drawPlan);

    expect(context.fillStyle).toBe("#555555");
    assertCallSequence(context.calls, [
      "clear:0:0:16:16",
      "save",
      /^translate:[\d.]+:[\d.]+$/u,
      "scale:0.016:0.016",
      "fill:nonzero",
      "restore",
    ]);
  });
});

describe("canvas renderer — mixed terrain commands", () => {
  test("executes mixed terrain fill and glyph commands", () => {
    const context = createContext();
    const drawPlan: TerrainDrawPlan = {
      commands: [
        {
          fillStyle: "#d7d0bf",
          kind: "drawTerrainTile",
          pixelHeight: TILE_PIXEL_SIZE,
          pixelWidth: TILE_PIXEL_SIZE,
          pixelX: 0,
          pixelY: 0,
        },
        {
          glyphBounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
          kind: "drawTerrainGlyph",
          path: "M0 0L1 1Z",
          pixelHeight: TILE_PIXEL_SIZE,
          pixelWidth: TILE_PIXEL_SIZE,
          pixelX: TILE_PIXEL_SIZE,
          pixelY: 0,
          tileBounds: { highX: 1, highY: 1, lowX: 0, lowY: 0 },
          unitsPerEm: 1000,
        },
      ],
      kind: "terrain",
    };

    executeTerrainDrawPlan(context, drawPlan);

    assertCallSequence(context.calls, [
      "fill:0:0:16:16",
      "clear:16:0:16:16",
      "save",
      /^translate:[\d.]+:[\d.]+$/u,
      "scale:0.016:0.016",
      "fill:nonzero",
      "restore",
    ]);
  });
});
