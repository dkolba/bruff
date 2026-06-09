import { describe, expect, test } from "vitest";
import { createQuiltTemplate } from "./template.ts";

describe("quilt template", () => {
  test("creates shadow DOM template with toolbar and canvases", () => {
    const template = createQuiltTemplate();

    expect(
      template.content.querySelector('[data-quilt="toolbar"]'),
    ).toBeInstanceOf(HTMLElement);
    expect(
      template.content.querySelector('[data-quilt="terrain-canvas"]'),
    ).toBeInstanceOf(HTMLCanvasElement);
    expect(
      template.content.querySelector('[data-quilt="overlay-canvas"]'),
    ).toBeInstanceOf(HTMLCanvasElement);
    expect(
      template.content.querySelector('[data-quilt="erase-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
  });
});
