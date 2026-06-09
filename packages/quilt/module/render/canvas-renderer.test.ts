/* eslint-disable id-length, max-params, no-magic-numbers -- Tests use compact canvas x/y command examples. */
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
    fillRect: (x, y, width, height) =>
      calls.push(`fill:${x}:${y}:${width}:${height}`),
    fillStyle: "#000000",
    strokeRect: (x, y, width, height) =>
      calls.push(`stroke:${x}:${y}:${width}:${height}`),
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
});
