import {
  BASE_SIZE,
  PULSE_MAGNITUDE,
  PULSE_SPEED,
  RANGE_SCALE,
  ROTATION_SPEED,
  TWO,
} from "../constants";
import { describe, expect, it, vi } from "vitest";
import { radiatingBarsBackgroundAnimation } from "./radiating-bars-background-animation";

// Test constants
const TEST_CANVAS_WIDTH = 800;
const TEST_CANVAS_HEIGHT = 600;
const TEST_TIMESTAMP = 1000;
const CALL_COUNT_ONE = 1;

const spyOnContext = (context: CanvasRenderingContext2D) => {
  vi.spyOn(context, "fillRect");
  vi.spyOn(context, "restore");
  vi.spyOn(context, "rotate");
  vi.spyOn(context, "save");
  vi.spyOn(context, "setTransform");
  vi.spyOn(context, "translate");
};

const createMockContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement("canvas");
  canvas.width = TEST_CANVAS_WIDTH;
  canvas.height = TEST_CANVAS_HEIGHT;
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new TypeError("Could not get context");
  }

  spyOnContext(context);

  return context;
};

const testContextStateManagement = () => {
  it("should save and restore context state", () => {
    const context = createMockContext();
    radiatingBarsBackgroundAnimation(context, TEST_TIMESTAMP);

    expect(context.save).toHaveBeenCalledTimes(CALL_COUNT_ONE);
    expect(context.restore).toHaveBeenCalledTimes(CALL_COUNT_ONE);
  });
};

const testTransformation = () => {
  it("should translate to center of canvas", () => {
    const context = createMockContext();
    radiatingBarsBackgroundAnimation(context, TEST_TIMESTAMP);

    expect(context.translate).toHaveBeenCalledWith(
      TEST_CANVAS_WIDTH / TWO,
      TEST_CANVAS_HEIGHT / TWO,
    );
  });

  it("should rotate based on timestamp", () => {
    const context = createMockContext();
    radiatingBarsBackgroundAnimation(context, TEST_TIMESTAMP);

    expect(context.rotate).toHaveBeenCalledWith(
      TEST_TIMESTAMP * ROTATION_SPEED,
    );
  });
};

const testDrawing = () => {
  it("should draw bars with correct size", () => {
    const context = createMockContext();
    radiatingBarsBackgroundAnimation(context, TEST_TIMESTAMP);

    const expectedSize =
      BASE_SIZE + Math.sin(TEST_TIMESTAMP * PULSE_SPEED) * PULSE_MAGNITUDE;
    const expectedRange =
      Math.max(TEST_CANVAS_WIDTH, TEST_CANVAS_HEIGHT) * RANGE_SCALE;

    expect(context.fillRect).toHaveBeenCalledWith(
      expectedSize,
      -expectedRange,
      expectedSize,
      expectedRange * TWO,
    );
    expect(context.fillRect).toHaveBeenCalledWith(
      -expectedSize,
      -expectedRange,
      expectedSize,
      expectedRange * TWO,
    );
  });
};

const testColorManagement = () => {
  it("should update fill style over time", () => {
    const context = createMockContext();
    radiatingBarsBackgroundAnimation(context, TEST_TIMESTAMP);

    expect(context.fillStyle).not.toBe("");
  });
};

describe("radiatingBarsBackgroundAnimation", () => {
  describe("context state management", testContextStateManagement);
  describe("transformation", testTransformation);
  describe("drawing", testDrawing);
  describe("color management", testColorManagement);
});
