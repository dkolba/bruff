/**
 * Gets the 2D rendering context from a canvas element
 *
 * @param canvas - The canvas element to get context from
 * @returns The 2D rendering context
 * @throws Error - If the context cannot be obtained
 */
export const getCanvasContext = (
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context not found");
  }
  return context;
};
