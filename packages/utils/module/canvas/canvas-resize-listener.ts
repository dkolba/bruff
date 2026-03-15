/**
 * Logs that the element has been resized
 *
 * @returns void
 */
const logInfo = (): void => {
  console.info("elementResized");
};

/**
 * Creates an event listener for canvas resize events
 *
 * @param canvas - The canvas element to listen for resize events
 * @returns Cleanup function that removes the event listener
 */
export const canvasResizeListener = (
  canvas: HTMLCanvasElement,
): (() => void) => {
  canvas.addEventListener("elementResized", logInfo);
  return () => {
    canvas.removeEventListener("elementResized", logInfo);
  };
};
