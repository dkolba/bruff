/* eslint-disable id-length, max-params -- Canvas APIs conventionally use x/y parameters, mutable style state, and four-number rect calls. */
import type { OverlayDrawPlan, TerrainDrawPlan } from "./map-draw-plan.ts";

const CANVAS_ORIGIN = 0;

/** Minimal Canvas 2D context capabilities used by Quilt draw executors. */
export type QuiltCanvasContext = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  strokeRect: (x: number, y: number, width: number, height: number) => void;
};

/** Executes terrain draw commands against a Canvas 2D context boundary. */
export const executeTerrainDrawPlan = (
  context: QuiltCanvasContext,
  drawPlan: TerrainDrawPlan,
): void => {
  drawPlan.commands.reduce((commandCount, command) => {
    context.fillStyle = command.fillStyle;
    context.fillRect(command.x, command.y, command.width, command.height);
    return commandCount;
  }, CANVAS_ORIGIN);
};

/** Executes overlay draw commands against a Canvas 2D context boundary. */
export const executeOverlayDrawPlan = (
  context: QuiltCanvasContext,
  drawPlan: OverlayDrawPlan,
): void => {
  drawPlan.commands.reduce((commandCount, command) => {
    if (command.kind === "drawGrid") {
      context.clearRect(
        CANVAS_ORIGIN,
        CANVAS_ORIGIN,
        command.width,
        command.height,
      );
      context.strokeRect(
        CANVAS_ORIGIN,
        CANVAS_ORIGIN,
        command.width,
        command.height,
      );
      return commandCount;
    }

    context.strokeRect(command.x, command.y, command.width, command.height);
    return commandCount;
  }, CANVAS_ORIGIN);
};
