/* eslint-disable id-length, max-statements, no-magic-numbers -- Playwright click positions and canvas pixels use x/y and RGBA values. */
import type { Locator } from "@playwright/test";
import { expect, test } from "./base-fixtures.js";

const MOUNTED_COUNT = 1;
const CLICK_OFFSET = 20;
const WALL_PIXEL = [17, 17, 17, 255];
const FLOOR_PIXEL = [215, 208, 191, 255];

const readCanvasPixel = (
  terrainCanvas: Locator,
): Promise<ReadonlyArray<number>> =>
  terrainCanvas.evaluate((canvasElement, clickOffset) => {
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      return [];
    }

    const context = canvasElement.getContext("2d");
    return context === null
      ? []
      : [...context.getImageData(clickOffset, clickOffset, 1, 1).data];
  }, CLICK_OFFSET);

test("paints and erases one tile through the quilt dev route", async ({
  page,
}) => {
  await page.goto("/tools-map");

  const quiltElement = page.locator("tool-quilt");
  const overlayCanvas = page.locator('[data-quilt="overlay-canvas"]');
  const terrainCanvas = page.locator('[data-quilt="terrain-canvas"]');
  const eraseButton = page.locator('[data-quilt="erase-tool"]');

  await expect(quiltElement).toHaveCount(MOUNTED_COUNT);
  await overlayCanvas.click({ position: { x: CLICK_OFFSET, y: CLICK_OFFSET } });
  await expect(overlayCanvas).toHaveAttribute(
    "data-quilt-painted-tile",
    /\d+:\d+/u,
  );
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(WALL_PIXEL);
  await eraseButton.click();
  await overlayCanvas.click({ position: { x: CLICK_OFFSET, y: CLICK_OFFSET } });
  await expect.poll(() => readCanvasPixel(terrainCanvas)).toEqual(FLOOR_PIXEL);
});
