import { afterEach, expect, test, vi } from "vitest";
import { canvasResizeListener } from "./canvas-resize-listener.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("#canvasResizeListener adds an event listener that logs to console", () => {
  const canvas = document.createElement("canvas");
  vi.spyOn(console, "info").mockImplementation(() => {
    // Do nothing
  });
  canvasResizeListener(canvas);
  const event = new CustomEvent("elementResized");
  canvas.dispatchEvent(event);
  expect(console.info).toHaveBeenCalledWith("elementResized");
});

test("#canvasResizeListener returns a cleanup function that removes the event listener", () => {
  const canvas = document.createElement("canvas");
  vi.spyOn(console, "info").mockImplementation(() => {
    // Do nothing
  });
  const cleanup = canvasResizeListener(canvas);
  cleanup();
  const event = new CustomEvent("elementResized");
  canvas.dispatchEvent(event);
  expect(console.info).not.toHaveBeenCalled();
});
