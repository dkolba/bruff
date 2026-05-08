import { beforeEach, expect, test, vi } from "vitest";
import { error, ok } from "../fp/result.js";
import { getCanvasContext } from "./get-canvas-context.js";

let canvas: HTMLCanvasElement = document.createElement("canvas");

beforeEach(() => {
  canvas = document.createElement("canvas");
});

test("#getCanvasContext returns ok with the 2d context when available", () => {
  const result = getCanvasContext(canvas);
  expect(result.type).toBe("ok");
  if (result.type === "ok") {
    expect(result.value instanceof CanvasRenderingContext2D).toBeTruthy();
  }
});

test("#getCanvasContext returns ok with the value returned by getContext", () => {
  const fakeContext = canvas.getContext("2d");
  if (fakeContext === null) {
    throw new TypeError("Browser failed to provide a 2d context");
  }
  vi.spyOn(canvas, "getContext").mockReturnValue(fakeContext);

  expect(getCanvasContext(canvas)).toEqual(ok(fakeContext));
});

test("#getCanvasContext returns error('canvas-context-not-found') when getContext returns null", () => {
  vi.spyOn(canvas, "getContext").mockReturnValue(null);

  expect(getCanvasContext(canvas)).toEqual(error("canvas-context-not-found"));
});
