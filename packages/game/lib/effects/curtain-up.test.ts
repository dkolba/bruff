import type * as Utilities from "@bruff/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import curtainUp from "./curtain-up.js";

vi.mock("@bruff/utils", async (importOriginal) => {
  const original = await importOriginal<typeof Utilities>();
  return {
    canvasResizeListener: vi.fn(),
    createCanvasResizeObserver: vi.fn(),
    error: original.error,
    flatMapResult: original.flatMapResult,
    getCanvas: vi.fn(),
    getCanvasContext: vi.fn(),
    getShadowGameRoot: vi.fn(),
    ok: original.ok,
    pipe: original.pipe,
  };
});

const createMocks = (): {
  mockCanvas: HTMLCanvasElement;
  mockContext: CanvasRenderingContext2D;
  mockRoot: ShadowRoot;
  removeListener: () => void;
} => {
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

const setupSuccessMocks = async (): Promise<{
  mockCanvas: HTMLCanvasElement;
  mockContext: CanvasRenderingContext2D;
  mockRoot: ShadowRoot;
  removeListener: () => void;
  utilities: typeof Utilities;
}> => {
  const { mockCanvas, mockContext, mockRoot, removeListener } = createMocks();
  const utilities = await import("@bruff/utils");
  vi.mocked(utilities.getShadowGameRoot).mockReturnValue(
    utilities.ok(mockRoot),
  );
  vi.mocked(utilities.getCanvas).mockReturnValue(utilities.ok(mockCanvas));
  vi.mocked(utilities.getCanvasContext).mockReturnValue(
    utilities.ok(mockContext),
  );
  vi.mocked(utilities.canvasResizeListener).mockReturnValue(removeListener);

  return { mockCanvas, mockContext, mockRoot, removeListener, utilities };
};

describe("curtainUp success path", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok with the wired stage when every boundary succeeds", async () => {
    const { mockCanvas, mockContext, mockRoot, removeListener, utilities } =
      await setupSuccessMocks();

    const result = curtainUp();

    expect(utilities.getShadowGameRoot).toHaveBeenCalledWith("bruff-game");
    expect(utilities.getCanvas).toHaveBeenCalledWith(mockRoot);
    expect(utilities.getCanvasContext).toHaveBeenCalledWith(mockCanvas);
    expect(utilities.createCanvasResizeObserver).toHaveBeenCalledWith(
      mockCanvas,
      mockContext,
    );
    expect(utilities.canvasResizeListener).toHaveBeenCalledWith(mockCanvas);

    expect(result).toEqual(
      utilities.ok({
        canvas: mockCanvas,
        context: mockContext,
        removeCanvasResizeListener: removeListener,
      }),
    );
  });
});

describe("curtainUp short-circuits on boundary failure", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("propagates the shadow-root error when getShadowGameRoot fails", async () => {
    const utilities = await import("@bruff/utils");
    vi.mocked(utilities.getShadowGameRoot).mockReturnValue(
      utilities.error("game-root-not-found"),
    );

    expect(curtainUp()).toEqual(utilities.error("game-root-not-found"));
    expect(utilities.getCanvas).not.toHaveBeenCalled();
    expect(utilities.getCanvasContext).not.toHaveBeenCalled();
    expect(utilities.createCanvasResizeObserver).not.toHaveBeenCalled();
  });

  it("propagates the canvas error when getCanvas fails", async () => {
    const { mockRoot } = createMocks();
    const utilities = await import("@bruff/utils");
    vi.mocked(utilities.getShadowGameRoot).mockReturnValue(
      utilities.ok(mockRoot),
    );
    vi.mocked(utilities.getCanvas).mockReturnValue(
      utilities.error("canvas-not-found"),
    );

    expect(curtainUp()).toEqual(utilities.error("canvas-not-found"));
    expect(utilities.getCanvasContext).not.toHaveBeenCalled();
    expect(utilities.createCanvasResizeObserver).not.toHaveBeenCalled();
  });

  it("propagates the context error when getCanvasContext fails", async () => {
    const { mockCanvas, mockRoot } = createMocks();
    const utilities = await import("@bruff/utils");
    vi.mocked(utilities.getShadowGameRoot).mockReturnValue(
      utilities.ok(mockRoot),
    );
    vi.mocked(utilities.getCanvas).mockReturnValue(utilities.ok(mockCanvas));
    vi.mocked(utilities.getCanvasContext).mockReturnValue(
      utilities.error("canvas-context-not-found"),
    );

    expect(curtainUp()).toEqual(utilities.error("canvas-context-not-found"));
    expect(utilities.createCanvasResizeObserver).not.toHaveBeenCalled();
  });
});
