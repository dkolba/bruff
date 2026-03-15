import { afterEach, describe, expect, it, vi } from "vitest";
import curtainUp from "./curtain-up.js";

vi.mock("@bruff/utils", () => ({
  canvasResizeListener: vi.fn(),
  createCanvasResizeObserver: vi.fn(),
  getCanvas: vi.fn(),
  getCanvasContext: vi.fn(),
  getShadowGameRoot: vi.fn(),
  pipe: vi.fn(
    (...functions: Array<(argument: unknown) => unknown>) =>
      (initialArgument: unknown): unknown =>
        functions.reduce(
          (accumulator, function_) => function_(accumulator),
          initialArgument,
        ),
  ),
}));

const createMocks = () => {
  const mockCanvas = document.createElement("canvas");
  const mockContext = mockCanvas.getContext("2d");
  if (mockContext === null) {
    throw new TypeError("Could not get context");
  }
  const mockHost = document.createElement("div");
  const mockRoot = mockHost.attachShadow({ mode: "open" });
  const removeListener = vi.fn();
  return { mockCanvas, mockContext, mockRoot, removeListener };
};

const setupMocks = async () => {
  const { mockCanvas, mockContext, mockRoot, removeListener } = createMocks();
  const utilities = await import("@bruff/utils");
  vi.mocked(utilities.getShadowGameRoot).mockReturnValue(mockRoot);
  vi.mocked(utilities.getCanvas).mockReturnValue(mockCanvas);
  vi.mocked(utilities.getCanvasContext).mockReturnValue(mockContext);
  vi.mocked(utilities.canvasResizeListener).mockReturnValue(removeListener);

  return { mockCanvas, mockContext, mockRoot, removeListener, utilities };
};

describe("curtainUp", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should set up the canvas and context", async () => {
    const { mockCanvas, mockContext, mockRoot, removeListener, utilities } =
      await setupMocks();

    const result = curtainUp();

    expect(utilities.getShadowGameRoot).toHaveBeenCalledWith("bruff-game");
    expect(utilities.getCanvas).toHaveBeenCalledWith(mockRoot);
    expect(utilities.getCanvasContext).toHaveBeenCalledWith(mockCanvas);
    expect(utilities.createCanvasResizeObserver).toHaveBeenCalledWith(
      mockCanvas,
      mockContext,
    );
    expect(utilities.canvasResizeListener).toHaveBeenCalledWith(mockCanvas);

    expect(result.canvas).toBe(mockCanvas);
    expect(result.context).toBe(mockContext);
    expect(result.removeCanvasResizeListener).toBe(removeListener);
  });
});
