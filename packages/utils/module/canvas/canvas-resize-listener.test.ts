import { afterEach, expect, test, vi } from "vitest";
import { canvasResizeListener } from "./canvas-resize-listener.js";
import { onLog } from "../event-bus/event-bus.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("#canvasResizeListener adds an event listener that emits a log event", () => {
  const canvas = document.createElement("canvas");
  const handler = vi.fn();
  const cleanupLog = onLog(handler);

  canvasResizeListener(canvas);
  const event = new CustomEvent("elementResized");
  canvas.dispatchEvent(event);

  expect(handler).toHaveBeenCalledWith({
    level: "info",
    message: "elementResized",
    source: "@bruff/utils/canvas",
  });
  cleanupLog();
});

test("#canvasResizeListener returns a cleanup function that removes the event listener", () => {
  const canvas = document.createElement("canvas");
  const handler = vi.fn();
  const cleanupLog = onLog(handler);
  const cleanup = canvasResizeListener(canvas);

  cleanup();
  const event = new CustomEvent("elementResized");
  canvas.dispatchEvent(event);

  expect(handler).not.toHaveBeenCalled();
  cleanupLog();
});
