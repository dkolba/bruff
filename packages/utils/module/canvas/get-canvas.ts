/**
 * Gets the canvas element from a shadow root
 *
 * @param root - The shadow root to search in
 * @returns The found canvas element
 * @throws Error - If canvas element is not found
 */
export const getCanvas = (root: ShadowRoot): HTMLCanvasElement => {
  const canvas = root.querySelector("canvas");
  if (!canvas) {
    throw new Error("Canvas element not found");
  }
  return canvas;
};
