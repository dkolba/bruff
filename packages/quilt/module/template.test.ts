import { describe, expect, test } from "vitest";

import { createQuiltTemplate } from "./template.ts";

const GRID_OPTION_COUNT = 6;
const FIRST_GRID_SIZE = 4;
const FIRST_GRID_INDEX = 0;
const LAST_GRID_SIZE = 9;
const LAST_GRID_INDEX = 5;

describe("quilt template — structure", () => {
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

describe("quilt template — grid-size select", () => {
  test("includes grid-size select with square options", () => {
    const template = createQuiltTemplate();
    const gridSizeSelect = template.content.querySelector(
      '[data-quilt="grid-size-select"]',
    );

    expect(gridSizeSelect).toBeInstanceOf(HTMLSelectElement);
    if (gridSizeSelect instanceof HTMLSelectElement) {
      expect(gridSizeSelect.options.length).toBe(GRID_OPTION_COUNT);
      expect(gridSizeSelect.options[FIRST_GRID_INDEX]?.value).toBe(
        String(FIRST_GRID_SIZE),
      );
      expect(gridSizeSelect.options[FIRST_GRID_INDEX]?.textContent).toBe(
        `${String(FIRST_GRID_SIZE)}×${String(FIRST_GRID_SIZE)}`,
      );
      expect(gridSizeSelect.options[LAST_GRID_INDEX]?.value).toBe(
        String(LAST_GRID_SIZE),
      );
      expect(gridSizeSelect.options[LAST_GRID_INDEX]?.textContent).toBe(
        `${LAST_GRID_SIZE}×${LAST_GRID_SIZE}`,
      );
    }
  });
});

describe("quilt template — terrain buttons", () => {
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
});

describe("quilt template — import/export", () => {
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
});

describe("quilt template — error region", () => {
  test("includes error region for user-visible messages", () => {
    const template = createQuiltTemplate();

    expect(
      template.content.querySelector('[data-quilt="error-region"]'),
    ).toBeInstanceOf(HTMLElement);
  });
});
