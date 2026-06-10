import { describe, expect, test } from "vitest";
import {
  executeOverlayDrawPlan,
  executeTerrainDrawPlan,
  type QuiltCanvasContext,
} from "./canvas-renderer.ts";
import type { OverlayDrawPlan, TerrainDrawPlan } from "./map-draw-plan.ts";

const createContext = (): QuiltCanvasContext & {
  calls: ReadonlyArray<string>;
} => {
  const calls: Array<string> = [];

  return {
    calls,
    clearRect: (x, y, width, height) =>
      calls.push(`clear:${x}:${y}:${width}:${height}`),
    fill: (path, fillRule) => calls.push(`fill:${fillRule ?? "nonzero"}`),
    fillRect: (x, y, width, height) =>
      calls.push(`fill:${x}:${y}:${width}:${height}`),
    fillStyle: "#000000",
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
    scale: (x, y) => calls.push(`scale:${x}:${y}`),
    strokeRect: (x, y, width, height) =>
      calls.push(`stroke:${x}:${y}:${width}:${height}`),
    translate: (x, y) => calls.push(`translate:${x}:${y}`),
  };
};

describe("canvas renderer", () => {
  test("executes terrain draw plans", () => {
    const context = createContext();
    const drawPlan: TerrainDrawPlan = {
      commands: [
        {
          fillStyle: "#d7d0bf",
          height: 16,
          kind: "drawTerrainTile",
          width: 16,
          x: 0,
          y: 0,
        },
      ],
      kind: "terrain",
    };

    executeTerrainDrawPlan(context, drawPlan);

    expect(context.calls).toStrictEqual(["fill:0:0:16:16"]);
    expect(context.fillStyle).toBe("#d7d0bf");
  });

  test("executes overlay draw plans", () => {
    const context = createContext();
    const drawPlan: OverlayDrawPlan = {
      commands: [
        { height: 32, kind: "drawGrid", width: 32 },
        { height: 16, kind: "drawHoverTile", width: 16, x: 16, y: 0 },
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

  test("executes glyph path draw commands with dark gray fill", () => {
    const context = createContext();
    const drawPlan: TerrainDrawPlan = {
      commands: [
        {
          glyphBounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
          height: 16,
          kind: "drawTerrainGlyph",
          path: "M0 0L1 1Z",
          tileBounds: { x1: 0, x2: 1, y1: 0, y2: 1 },
          unitsPerEm: 1000,
          width: 16,
          x: 0,
          y: 0,
        },
      ],
      kind: "terrain",
    };

    executeTerrainDrawPlan(context, drawPlan);

    expect(context.fillStyle).toBe("#555555");
    expect(context.calls[0]).toBe("clear:0:0:16:16");
    expect(context.calls[1]).toBe("save");
    expect(context.calls[2]).toMatch(/^translate:[\d.]+:[\d.]+$/u);
    expect(context.calls[3]).toBe("scale:0.016:0.016");
    expect(context.calls[4]).toBe("fill:nonzero");
    expect(context.calls[5]).toBe("restore");
    expect(context.calls).toHaveLength(6);
  });

  test("executes mixed terrain fill and glyph commands", () => {
    const context = createContext();
    const drawPlan: TerrainDrawPlan = {
      commands: [
        {
          fillStyle: "#d7d0bf",
          height: 16,
          kind: "drawTerrainTile",
          width: 16,
          x: 0,
          y: 0,
        },
        {
          glyphBounds: { x1: 10, x2: 690, y1: 20, y2: 720 },
          height: 16,
          kind: "drawTerrainGlyph",
          path: "M0 0L1 1Z",
          tileBounds: { x1: 0, x2: 1, y1: 0, y2: 1 },
          unitsPerEm: 1000,
          width: 16,
          x: 16,
          y: 0,
        },
      ],
      kind: "terrain",
    };

    executeTerrainDrawPlan(context, drawPlan);

    expect(context.calls[0]).toBe("fill:0:0:16:16");
    expect(context.calls[1]).toBe("clear:16:0:16:16");
    expect(context.calls[2]).toBe("save");
    expect(context.calls[3]).toMatch(/^translate:[\d.]+:[\d.]+$/u);
    expect(context.calls[4]).toBe("scale:0.016:0.016");
    expect(context.calls[5]).toBe("fill:nonzero");
    expect(context.calls[6]).toBe("restore");
    expect(context.calls).toHaveLength(7);
  });
});
