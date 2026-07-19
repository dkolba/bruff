/**
 * Creates a resize observer for a canvas element that keeps the canvas dimensions in sync with its client dimensions
 *
 * @param canvas - The canvas element to observe
 * @param context - The 2D rendering context of the canvas
 * @returns The resize observer instance
 */
export const createCanvasResizeObserver = (
  canvas: Readonly<HTMLCanvasElement>,
  context: Readonly<CanvasRenderingContext2D>,
): ResizeObserver => {
  const observer = new ResizeObserver(
    (entries: readonly ResizeObserverEntry[]) => {
      context.canvas.width = canvas.clientWidth;
      context.canvas.height = canvas.clientHeight;
      for (const entry of entries) {
        const event = new CustomEvent("elementResized", {
          detail: {
            height: entry.contentRect.height,
            width: entry.contentRect.width,
          },
        });
        entry.target.dispatchEvent(event);
      }
    },
  );
  observer.observe(canvas);
  return observer;
};
