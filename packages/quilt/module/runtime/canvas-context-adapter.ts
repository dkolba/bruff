import type { QuiltCanvasContext } from "../render/canvas-renderer.ts";

type Rect = Readonly<{
  pixelX: number;
  pixelY: number;
  pixelWidth: number;
  pixelHeight: number;
}>;

/** Adapts a native CanvasRenderingContext2D to QuiltCanvasContext. */
export const adaptCanvasContext = (
  context: CanvasRenderingContext2D,
): QuiltCanvasContext => ({
  clearRect(rect: Rect): void {
    context.clearRect(
      rect.pixelX,
      rect.pixelY,
      rect.pixelWidth,
      rect.pixelHeight,
    );
  },
  fill(path: Path2D, fillRule?: CanvasFillRule): void {
    context.fill(path, fillRule);
  },
  fillRect(rect: Rect): void {
    context.fillRect(
      rect.pixelX,
      rect.pixelY,
      rect.pixelWidth,
      rect.pixelHeight,
    );
  },
  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return context.fillStyle;
  },
  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    context.fillStyle = value;
  },
  restore(): void {
    context.restore();
  },
  save(): void {
    context.save();
  },
  scale(scaleX: number, scaleY: number): void {
    context.scale(scaleX, scaleY);
  },
  strokeRect(rect: Rect): void {
    context.strokeRect(
      rect.pixelX,
      rect.pixelY,
      rect.pixelWidth,
      rect.pixelHeight,
    );
  },
  translate(translateX: number, translateY: number): void {
    context.translate(translateX, translateY);
  },
});
