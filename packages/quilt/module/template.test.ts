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

  test("includes grid-size select with square options", () => {
    const template = createQuiltTemplate();
    const gridSizeSelect = template.content.querySelector(
      '[data-quilt="grid-size-select"]',
    );

    expect(gridSizeSelect).toBeInstanceOf(HTMLSelectElement);
    if (gridSizeSelect instanceof HTMLSelectElement) {
      expect(gridSizeSelect.options.length).toBe(6);
      expect(gridSizeSelect.options[0]?.value).toBe("4");
      expect(gridSizeSelect.options[0]?.textContent).toBe("4×4");
      expect(gridSizeSelect.options[5]?.value).toBe("9");
      expect(gridSizeSelect.options[5]?.textContent).toBe("9×9");
    }
  });

  test("includes terrain draw buttons for floor wall and door", () => {
    const template = createQuiltTemplate();

    expect(
      template.content.querySelector('[data-quilt="floor-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      template.content.querySelector('[data-quilt="wall-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      template.content.querySelector('[data-quilt="door-tool"]'),
    ).toBeInstanceOf(HTMLButtonElement);
  });

  test("includes export button and import file input", () => {
    const template = createQuiltTemplate();

    expect(
      template.content.querySelector('[data-quilt="export-button"]'),
    ).toBeInstanceOf(HTMLButtonElement);
    expect(
      template.content.querySelector('[data-quilt="import-input"]'),
    ).toBeInstanceOf(HTMLInputElement);
    const importInput = template.content.querySelector(
      '[data-quilt="import-input"]',
    );
    if (importInput instanceof HTMLInputElement) {
      expect(importInput.type).toBe("file");
      expect(importInput.accept).toBe(".json");
    }
  });

  test("includes error region for user-visible messages", () => {
    const template = createQuiltTemplate();

    expect(
      template.content.querySelector('[data-quilt="error-region"]'),
    ).toBeInstanceOf(HTMLElement);
  });
});
