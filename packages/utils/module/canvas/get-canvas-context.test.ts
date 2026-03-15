import { beforeEach, expect, test, vi } from "vitest";
import { getCanvasContext } from "./get-canvas-context.js";

let canvas: HTMLCanvasElement = document.createElement("canvas");

beforeEach(() => {
  canvas = document.createElement("canvas");
});

test("#getCanvasContext returns 2d context when available", () => {
  const context = getCanvasContext(canvas);
  expect(context).toBeDefined();
  expect(context instanceof CanvasRenderingContext2D).toBeTruthy();
});

test("#getCanvasContext throws when context is not available", () => {
  // Mock getContext to return null
  vi.spyOn(canvas, "getContext").mockReturnValue(null);

  expect(() => getCanvasContext(canvas)).toThrow("Canvas context not found");
});

test("#getCanvasContext throws with correct error message", () => {
  vi.spyOn(canvas, "getContext").mockReturnValue(null);

  expect(() => getCanvasContext(canvas)).toThrow(/Canvas context not found/u);
});
