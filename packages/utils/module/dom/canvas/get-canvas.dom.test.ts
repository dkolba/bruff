import { beforeEach, expect, test } from "vitest";

import { error, ok } from "../../universal/fp/result.ts";
import { getCanvas } from "./get-canvas.ts";

let root: ShadowRoot = document
  .createElement("div")
  .attachShadow({ mode: "open" });

beforeEach(() => {
  root = document.createElement("div").attachShadow({ mode: "open" });
});

test("#getCanvas returns ok with the canvas element when found", () => {
  const canvas = document.createElement("canvas");
  root.append(canvas);

  expect(getCanvas(root)).toEqual(ok(canvas));
});

test("#getCanvas returns error('canvas-not-found') when no canvas element exists", () => {
  expect(getCanvas(root)).toEqual(error("canvas-not-found"));
});

test("#getCanvas returns ok with the first canvas when multiple exist", () => {
  const firstCanvas = document.createElement("canvas");
  const secondCanvas = document.createElement("canvas");
  root.append(firstCanvas);
  root.append(secondCanvas);

  expect(getCanvas(root)).toEqual(ok(firstCanvas));
});
