import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./base-fixtures.js";

const MOUNTED_COUNT = 1;
const CLICK_OFFSET = 20;
const PIXEL_SAMPLE_SIZE = 1;
const OPAQUE_ALPHA = 255;
const WALL_RGB_CHANNEL = 17;
const FLOOR_RED_CHANNEL = 215;
const FLOOR_GREEN_CHANNEL = 208;
const FLOOR_BLUE_CHANNEL = 191;
const DOOR_RED_CHANNEL = 139;
const DOOR_GREEN_CHANNEL = 90;
const DOOR_BLUE_CHANNEL = 43;
const WALL_PIXEL = [
  WALL_RGB_CHANNEL,
  WALL_RGB_CHANNEL,
  WALL_RGB_CHANNEL,
  OPAQUE_ALPHA,
];
const FLOOR_PIXEL = [
  FLOOR_RED_CHANNEL,
  FLOOR_GREEN_CHANNEL,
  FLOOR_BLUE_CHANNEL,
  OPAQUE_ALPHA,
];
const DOOR_PIXEL = [
  DOOR_RED_CHANNEL,
  DOOR_GREEN_CHANNEL,
  DOOR_BLUE_CHANNEL,
  OPAQUE_ALPHA,
];

type QuiltInteractionLocators = Readonly<{
  doorButton: Locator;
  eraseButton: Locator;
  floorButton: Locator;
  gridSizeSelect: Locator;
  overlayCanvas: Locator;
  quiltElement: Locator;
  terrainCanvas: Locator;
  wallButton: Locator;
}>;

const getQuiltInteractionLocators = (page: Page): QuiltInteractionLocators => ({
  doorButton: page.locator('[data-quilt="door-tool"]'),
  eraseButton: page.locator('[data-quilt="erase-tool"]'),
  floorButton: page.locator('[data-quilt="floor-tool"]'),
  gridSizeSelect: page.locator('[data-quilt="grid-size-select"]'),
  overlayCanvas: page.locator('[data-quilt="overlay-canvas"]'),
  quiltElement: page.locator("tool-quilt"),
  terrainCanvas: page.locator('[data-quilt="terrain-canvas"]'),
  wallButton: page.locator('[data-quilt="wall-tool"]'),
});

const dispatchCanvasPointerDown = (overlayCanvas: Locator): Promise<void> =>
  overlayCanvas.evaluate((canvasElement, clickOffset) => {
    const canvasBounds = canvasElement.getBoundingClientRect();
    canvasElement.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: canvasBounds.left + clickOffset,
        clientY: canvasBounds.top + clickOffset,
      }),
    );
  }, CLICK_OFFSET);

const readCanvasPixel = (
  terrainCanvas: Locator,
): Promise<ReadonlyArray<number>> =>
  terrainCanvas.evaluate(
    (canvasElement, sample) => {
      if (!(canvasElement instanceof HTMLCanvasElement)) {
        return [];
      }

      const context = canvasElement.getContext("2d");
      return context === null
        ? []
        : [
            ...context.getImageData(
              sample.clickOffset,
              sample.clickOffset,
              sample.pixelSampleSize,
              sample.pixelSampleSize,
            ).data,
          ];
    },
    { clickOffset: CLICK_OFFSET, pixelSampleSize: PIXEL_SAMPLE_SIZE },
  );

test("paints and erases one tile through the quilt dev route", async ({
  page,
}) => {
  await page.goto("/tools-map");

  const { eraseButton, overlayCanvas, quiltElement, terrainCanvas } =
    getQuiltInteractionLocators(page);

  await expect(quiltElement).toHaveCount(MOUNTED_COUNT);
  await dispatchCanvasPointerDown(overlayCanvas);
  await expect(overlayCanvas).toHaveAttribute(
    "data-quilt-painted-tile",
    /\d+:\d+/u,
  );
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(WALL_PIXEL);
  await eraseButton.click();
  await dispatchCanvasPointerDown(overlayCanvas);
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(FLOOR_PIXEL);
});

test("draws door terrain from door toolbar button", async ({ page }) => {
  await page.goto("/tools-map");

  const { doorButton, overlayCanvas, quiltElement, terrainCanvas } =
    getQuiltInteractionLocators(page);

  await expect(quiltElement).toHaveCount(MOUNTED_COUNT);
  await doorButton.click();
  await dispatchCanvasPointerDown(overlayCanvas);
  await expect(overlayCanvas).toHaveAttribute(
    "data-quilt-painted-tile",
    /\d+:\d+/u,
  );
  // Door tile should be brown (#8b5a2b)
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(DOOR_PIXEL);
});

test("resizes grid from 4x4 to 9x9 and preserves painted tiles", async ({
  page,
}) => {
  await page.goto("/tools-map");

  const { gridSizeSelect, overlayCanvas, quiltElement, terrainCanvas } =
    getQuiltInteractionLocators(page);

  await expect(quiltElement).toHaveCount(MOUNTED_COUNT);

  // Paint a wall tile
  await dispatchCanvasPointerDown(overlayCanvas);
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(WALL_PIXEL);

  // Resize to 9x9
  await gridSizeSelect.selectOption("9");

  // The wall pixel should still be there (top-left preserved)
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(WALL_PIXEL);
});

test("grid-size select contains expected options", async ({ page }) => {
  await page.goto("/tools-map");

  const { gridSizeSelect, quiltElement } = getQuiltInteractionLocators(page);

  await expect(quiltElement).toHaveCount(MOUNTED_COUNT);
  await expect(gridSizeSelect).toHaveValue("4");

  const options = await gridSizeSelect.evaluate((select) => {
    if (!(select instanceof HTMLSelectElement)) {
      return [];
    }
    return [...select.options].map((opt) => opt.value);
  });

  expect(options).toStrictEqual(["4", "5", "6", "7", "8", "9"]);
});
