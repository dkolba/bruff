import { error, ok, type Result } from "../../universal/fp/result.js";

/**
 * Gets the canvas element from a shadow root.
 *
 * @param root - The shadow root to search in
 * @returns `ok` with the found canvas or `error("canvas-not-found")`
 *   when the shadow root contains no `<canvas>` element
 */
export const getCanvas = (
  root: ShadowRoot,
): Result<HTMLCanvasElement, "canvas-not-found"> => {
  const canvas = root.querySelector("canvas");
  return canvas ? ok(canvas) : error("canvas-not-found");
};
