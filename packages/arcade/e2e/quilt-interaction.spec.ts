import { expect, test } from "./base-fixtures.js";
import type { Locator, Page } from "@playwright/test";

const MOUNTED_COUNT = 1;
const CLICK_OFFSET = 20;
const PIXEL_SAMPLE_SIZE = 1;
const OPAQUE_ALPHA = 255;
const WALL_RGB_CHANNEL = 17;
const FLOOR_RED_CHANNEL = 215;
const FLOOR_GREEN_CHANNEL = 208;
const FLOOR_BLUE_CHANNEL = 191;
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

type QuiltInteractionLocators = Readonly<{
  eraseButton: Locator;
  overlayCanvas: Locator;
  quiltElement: Locator;
  terrainCanvas: Locator;
}>;

const getQuiltInteractionLocators = (page: Page): QuiltInteractionLocators => ({
  eraseButton: page.locator('[data-quilt="erase-tool"]'),
  overlayCanvas: page.locator('[data-quilt="overlay-canvas"]'),
  quiltElement: page.locator("tool-quilt"),
  terrainCanvas: page.locator('[data-quilt="terrain-canvas"]'),
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
