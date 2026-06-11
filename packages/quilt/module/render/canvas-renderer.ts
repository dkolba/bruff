import type {
  DrawTerrainGlyphCommand,
  OverlayDrawPlan,
  TerrainDrawPlan,
} from "./map-draw-plan.ts";

const CANVAS_ORIGIN = 0;
const GLYPH_FILL_STYLE = "#555555";
const HALF = 2;

/** A rectangular region in pixel-space. */
type CanvasRect = Readonly<{
  pixelX: number;
  pixelY: number;
  pixelWidth: number;
  pixelHeight: number;
}>;

/** Minimal Canvas 2D context capabilities used by Quilt draw executors. */
export type QuiltCanvasContext = {
  fillStyle: string | CanvasGradient | CanvasPattern;
  clearRect: (rect: CanvasRect) => void;
  fillRect: (rect: CanvasRect) => void;
  strokeRect: (rect: CanvasRect) => void;
  save: () => void;
  restore: () => void;
  translate: (translateX: number, translateY: number) => void;
  scale: (scaleX: number, scaleY: number) => void;
  fill: (path: Path2D, fillRule?: CanvasFillRule) => void;
};

const toCanvasRect = (parameters: {
  pixelHeight: number;
  pixelWidth: number;
  pixelX: number;
  pixelY: number;
}): CanvasRect => parameters;

type GlyphOffsetInput = Readonly<{
  tileDimension: number;
  glyphDimension: number;
  scale: number;
  glyphOrigin: number;
}>;

const computeGlyphOffset = (input: GlyphOffsetInput): number =>
  (input.tileDimension - input.glyphDimension * input.scale) / HALF -
  input.glyphOrigin * input.scale;

type ClearAndSetupInput = Readonly<{
  context: QuiltCanvasContext;
  command: DrawTerrainGlyphCommand;
  scale: number;
  offsetX: number;
  offsetY: number;
}>;

const clearAndSetupGlyph = (input: ClearAndSetupInput): void => {
  const { context, command, offsetX, offsetY, scale } = input;
  context.clearRect(
    toCanvasRect({
      pixelHeight: command.pixelHeight,
      pixelWidth: command.pixelWidth,
      pixelX: command.pixelX,
      pixelY: command.pixelY,
    }),
  );
  context.save();
  context.translate(command.pixelX + offsetX, command.pixelY + offsetY);
  context.scale(scale, scale);
};

const renderGlyphPath = (context: QuiltCanvasContext, path2d: Path2D): void => {
  context.fillStyle = GLYPH_FILL_STYLE;
  context.fill(path2d);
  context.restore();
};

const executeDrawTerrainGlyph = (
  context: QuiltCanvasContext,
  command: DrawTerrainGlyphCommand,
): void => {
  /* v8 ignore next -- Path2D is a browser API; covered by browser tests. */
  const path2d = new Path2D(command.path);
  const scale = command.pixelWidth / command.unitsPerEm;
  const glyphWidth = command.glyphBounds.x2 - command.glyphBounds.x1;
  const glyphHeight = command.glyphBounds.y2 - command.glyphBounds.y1;
  const offsetX = computeGlyphOffset({
    glyphDimension: glyphWidth,
    glyphOrigin: command.glyphBounds.x1,
    scale,
    tileDimension: command.pixelWidth,
  });
  const offsetY = computeGlyphOffset({
    glyphDimension: glyphHeight,
    glyphOrigin: command.glyphBounds.y1,
    scale,
    tileDimension: command.pixelHeight,
  });
  clearAndSetupGlyph({
    command,
    context,
    offsetX,
    offsetY,
    scale,
  });
  renderGlyphPath(context, path2d);
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
    context.fillRect(
      toCanvasRect({
        pixelHeight: command.pixelHeight,
        pixelWidth: command.pixelWidth,
        pixelX: command.pixelX,
        pixelY: command.pixelY,
      }),
    );
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
        toCanvasRect({
          pixelHeight: command.pixelHeight,
          pixelWidth: command.pixelWidth,
          pixelX: CANVAS_ORIGIN,
          pixelY: CANVAS_ORIGIN,
        }),
      );
      context.strokeRect(
        toCanvasRect({
          pixelHeight: command.pixelHeight,
          pixelWidth: command.pixelWidth,
          pixelX: CANVAS_ORIGIN,
          pixelY: CANVAS_ORIGIN,
        }),
      );
      return commandCount;
    }

    context.strokeRect(
      toCanvasRect({
        pixelHeight: command.pixelHeight,
        pixelWidth: command.pixelWidth,
        pixelX: command.pixelX,
        pixelY: command.pixelY,
      }),
    );
    return commandCount;
  }, CANVAS_ORIGIN);
};
