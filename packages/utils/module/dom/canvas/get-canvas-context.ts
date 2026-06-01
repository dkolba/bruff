import { error, ok, type Result } from "../../universal/fp/result.ts";

/**
 * Gets the 2D rendering context from a canvas element.
 *
 * @param canvas - The canvas element to get the context from
 * @returns `ok` with the 2D context or
 *   `error("canvas-context-not-found")` when the browser cannot
 *   provide one (e.g. another context type is already attached)
 */
export const getCanvasContext = (
  canvas: HTMLCanvasElement,
): Result<CanvasRenderingContext2D, "canvas-context-not-found"> => {
  const context = canvas.getContext("2d");
  return context ? ok(context) : error("canvas-context-not-found");
};
