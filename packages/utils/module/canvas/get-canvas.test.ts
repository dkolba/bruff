import { beforeEach, expect, test } from "vitest";
import { getCanvas } from "./get-canvas.js";

let root: ShadowRoot = document
  .createElement("div")
  .attachShadow({ mode: "open" });

beforeEach(() => {
  // Create a new shadow root for each test
  root = document.createElement("div").attachShadow({ mode: "open" });
});

test("#getCanvas returns canvas element when found in shadow root", () => {
  const canvas = document.createElement("canvas");
  root.append(canvas);

  const result = getCanvas(root);
  expect(result).toBeDefined();
  expect(result instanceof HTMLCanvasElement).toBeTruthy();
  expect(result).toBe(canvas);
});

test("#getCanvas throws when canvas element is not found", () => {
  expect(() => getCanvas(root)).toThrow("Canvas element not found");
});

test("#getCanvas throws with correct error message", () => {
  expect(() => getCanvas(root)).toThrow(/Canvas element not found/u);
});

test("#getCanvas returns first canvas when multiple exist", () => {
  const canvas1 = document.createElement("canvas");
  const canvas2 = document.createElement("canvas");
  root.append(canvas1);
  root.append(canvas2);

  const result = getCanvas(root);
  expect(result).toBe(canvas1);
});
