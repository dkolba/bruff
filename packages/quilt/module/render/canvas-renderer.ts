import type {
  DrawTerrainGlyphCommand,
  OverlayDrawPlan,
  TerrainDrawPlan,
} from "./map-draw-plan.ts";

const CANVAS_ORIGIN = 0;
const GLYPH_FILL_STYLE = "#555555";

/** Minimal Canvas 2D context capabilities used by Quilt draw executors. */
export type QuiltCanvasContext = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  strokeRect: (x: number, y: number, width: number, height: number) => void;
  save: () => void;
  restore: () => void;
  translate: (x: number, y: number) => void;
  scale: (x: number, y: number) => void;
  fill: (path: Path2D, fillRule?: CanvasFillRule) => void;
};

const executeDrawTerrainGlyph = (
  context: QuiltCanvasContext,
  command: DrawTerrainGlyphCommand,
): void => {
  /* v8 ignore next -- Path2D is a browser API; covered by browser tests. */
  const path2d = new Path2D(command.path);
  const scale = command.width / command.unitsPerEm;

  context.save();
  context.translate(command.x, command.y);
  context.scale(scale, scale);
  context.fillStyle = GLYPH_FILL_STYLE;
  context.fill(path2d);
  context.restore();
};

/** Executes terrain draw commands against a Canvas 2D context boundary. */
export const executeTerrainDrawPlan = (
  context: QuiltCanvasContext,
  drawPlan: TerrainDrawPlan,
): void => {
  drawPlan.commands.reduce((commandCount, command) => {
    if (command.kind === "drawTerrainGlyph") {
      executeDrawTerrainGlyph(context, command);
      return commandCount;
    }

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
