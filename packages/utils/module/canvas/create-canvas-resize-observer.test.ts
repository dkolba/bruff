/* eslint-disable id-length */
/* eslint-disable max-classes-per-file */
import { beforeEach, expect, test, vi } from "vitest";
import { createCanvasResizeObserver } from "./create-canvas-resize-observer.js";
import { getCanvasContext } from "./get-canvas-context.js";

let canvas: HTMLCanvasElement = document.createElement("canvas");
let context: CanvasRenderingContext2D = getCanvasContext(canvas);

beforeEach(() => {
  canvas = document.createElement("canvas");
  context = getCanvasContext(canvas);
  vi.restoreAllMocks();
});

test("#createCanvasResizeObserver returns ResizeObserver instance", () => {
  const observer = createCanvasResizeObserver(canvas, context);
  expect(observer).toBeDefined();
  expect(observer instanceof ResizeObserver).toBeTruthy();
});

// eslint-disable-next-line max-lines-per-function
test("#createCanvasResizeObserver updates canvas dimensions", () => {
  const NEW_WIDTH = 200;
  const NEW_HEIGHT = 150;

  // Mock ResizeObserver
  const mockResizeObserver = vi.fn();
  Object.defineProperty(canvas, "clientWidth", { value: NEW_WIDTH });
  Object.defineProperty(canvas, "clientHeight", { value: NEW_HEIGHT });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        mockResizeObserver.mockImplementation(() => {
          callback(
            [
              {
                borderBoxSize: [],
                contentBoxSize: [],
                contentRect: {
                  bottom: NEW_HEIGHT,
                  height: NEW_HEIGHT,
                  left: 0,
                  right: NEW_WIDTH,
                  toJSON: () => ({}),
                  top: 0,
                  width: NEW_WIDTH,
                  x: 0,
                  y: 0,
                },
                devicePixelContentBoxSize: [],
                target: canvas,
              },
            ],
            this,
          );
        });
      }
      observe = mockResizeObserver;
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );

  createCanvasResizeObserver(canvas, context);

  // Trigger mock resize observation
  mockResizeObserver();

  expect(context.canvas.width).toBe(NEW_WIDTH);
  expect(context.canvas.height).toBe(NEW_HEIGHT);
});

test("#createCanvasResizeObserver can be disconnected", () => {
  // Mock ResizeObserver
  const mockDisconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = mockDisconnect;
    },
  );

  const observer = createCanvasResizeObserver(canvas, context);
  expect(observer.disconnect).toBeDefined();
  observer.disconnect();
  expect(mockDisconnect).toHaveBeenCalledWith();
});
