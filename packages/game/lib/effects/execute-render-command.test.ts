import { describe, expect, it, vi } from "vitest";
import {
  executeRenderCommand,
  executeRenderCommands,
} from "./execute-render-command.js";

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const CANVAS_HEIGHT = 240;
const CANVAS_WIDTH = 320;
const FILL_COLOR = "#123456";
const FIRST_X_POS = 10;
const FIRST_Y_POS = 20;
const SECOND_X_POS = 30;
const SECOND_Y_POS = 40;
const RECT_SIZE = 20;

type FillRectCommand = Readonly<{
  color: string;
  height: number;
  type: "fill-rect";
  width: number;
  xPos: number;
  yPos: number;
}>;

const createContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement("canvas");
  canvas.height = CANVAS_HEIGHT;
  canvas.width = CANVAS_WIDTH;
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new TypeError("Failed to get context");
  }
  return context;
};

const fillRectCommand = (xPos: number, yPos: number): FillRectCommand => ({
  color: FILL_COLOR,
  height: RECT_SIZE,
  type: "fill-rect",
  width: RECT_SIZE,
  xPos,
  yPos,
});

describe("executeRenderCommand", () => {
  it("clears the full canvas for clear commands", () => {
    const context = createContext();
    const clearRect = vi.spyOn(context, "clearRect");

    executeRenderCommand(context, { type: "clear" });

    expect(clearRect).toHaveBeenCalledWith(
      ZERO,
      ZERO,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
  });

  it("sets fill style and draws a rectangle for fill-rect commands", () => {
    const context = createContext();
    const fillRect = vi.spyOn(context, "fillRect");

    executeRenderCommand(context, fillRectCommand(FIRST_X_POS, FIRST_Y_POS));

    expect(context.fillStyle).toBe(FILL_COLOR);
    expect(fillRect).toHaveBeenCalledWith(
      FIRST_X_POS,
      FIRST_Y_POS,
      RECT_SIZE,
      RECT_SIZE,
    );
  });
});

describe("executeRenderCommands", () => {
  it("executes commands in array order", () => {
    const context = createContext();
    const clearRect = vi.spyOn(context, "clearRect");
    const fillRect = vi.spyOn(context, "fillRect");

    executeRenderCommands(context, [
      { type: "clear" },
      fillRectCommand(FIRST_X_POS, FIRST_Y_POS),
      fillRectCommand(SECOND_X_POS, SECOND_Y_POS),
    ]);

    expect(clearRect).toHaveBeenCalledBefore(fillRect);
    expect(fillRect.mock.calls).toStrictEqual([
      [FIRST_X_POS, FIRST_Y_POS, RECT_SIZE, RECT_SIZE],
      [SECOND_X_POS, SECOND_Y_POS, RECT_SIZE, RECT_SIZE],
    ]);
    expect(clearRect).toHaveBeenCalledTimes(ONE);
    expect(fillRect).toHaveBeenCalledTimes(TWO);
  });
});
