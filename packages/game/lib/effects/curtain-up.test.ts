import type * as DomUtilities from "@bruff/utils/dom";
import type * as Utilities from "@bruff/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import curtainUp from "./curtain-up.js";

vi.mock("@bruff/utils", async (importOriginal) => {
  const original = await importOriginal<typeof Utilities>();
  return {
    error: original.error,
    flatMapResult: original.flatMapResult,
    ok: original.ok,
    pipe: original.pipe,
  };
});

vi.mock("@bruff/utils/dom", () => ({
  canvasResizeListener: vi.fn(),
  createCanvasResizeObserver: vi.fn(),
  getCanvas: vi.fn(),
  getCanvasContext: vi.fn(),
  getShadowGameRoot: vi.fn(),
}));

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
  domUtilities: typeof DomUtilities;
  utilities: Pick<typeof Utilities, "error" | "ok">;
}> => {
  const { mockCanvas, mockContext, mockRoot, removeListener } = createMocks();
  const utilities = await import("@bruff/utils");
  const domUtilities = await import("@bruff/utils/dom");
  vi.mocked(domUtilities.getShadowGameRoot).mockReturnValue(
    utilities.ok(mockRoot),
  );
  vi.mocked(domUtilities.getCanvas).mockReturnValue(utilities.ok(mockCanvas));
  vi.mocked(domUtilities.getCanvasContext).mockReturnValue(
    utilities.ok(mockContext),
  );
  vi.mocked(domUtilities.canvasResizeListener).mockReturnValue(removeListener);

  return {
    domUtilities,
    mockCanvas,
    mockContext,
    mockRoot,
    removeListener,
    utilities,
  };
};

describe("curtainUp success path", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok with the wired stage when every boundary succeeds", async () => {
    const {
      domUtilities,
      mockCanvas,
      mockContext,
      mockRoot,
      removeListener,
      utilities,
    } = await setupSuccessMocks();

    const result = curtainUp();

    expect(domUtilities.getShadowGameRoot).toHaveBeenCalledWith("bruff-game");
    expect(domUtilities.getCanvas).toHaveBeenCalledWith(mockRoot);
    expect(domUtilities.getCanvasContext).toHaveBeenCalledWith(mockCanvas);
    expect(domUtilities.createCanvasResizeObserver).toHaveBeenCalledWith(
      mockCanvas,
      mockContext,
    );
    expect(domUtilities.canvasResizeListener).toHaveBeenCalledWith(mockCanvas);

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
    const domUtilities = await import("@bruff/utils/dom");
    vi.mocked(domUtilities.getShadowGameRoot).mockReturnValue(
      utilities.error("game-root-not-found"),
    );

    expect(curtainUp()).toEqual(utilities.error("game-root-not-found"));
    expect(domUtilities.getCanvas).not.toHaveBeenCalled();
    expect(domUtilities.getCanvasContext).not.toHaveBeenCalled();
    expect(domUtilities.createCanvasResizeObserver).not.toHaveBeenCalled();
  });

  it("propagates the canvas error when getCanvas fails", async () => {
    const { mockRoot } = createMocks();
    const utilities = await import("@bruff/utils");
    const domUtilities = await import("@bruff/utils/dom");
    vi.mocked(domUtilities.getShadowGameRoot).mockReturnValue(
      utilities.ok(mockRoot),
    );
    vi.mocked(domUtilities.getCanvas).mockReturnValue(
      utilities.error("canvas-not-found"),
    );

    expect(curtainUp()).toEqual(utilities.error("canvas-not-found"));
    expect(domUtilities.getCanvasContext).not.toHaveBeenCalled();
    expect(domUtilities.createCanvasResizeObserver).not.toHaveBeenCalled();
  });

  it("propagates the context error when getCanvasContext fails", async () => {
    const { mockCanvas, mockRoot } = createMocks();
    const utilities = await import("@bruff/utils");
    const domUtilities = await import("@bruff/utils/dom");
    vi.mocked(domUtilities.getShadowGameRoot).mockReturnValue(
      utilities.ok(mockRoot),
    );
    vi.mocked(domUtilities.getCanvas).mockReturnValue(utilities.ok(mockCanvas));
    vi.mocked(domUtilities.getCanvasContext).mockReturnValue(
      utilities.error("canvas-context-not-found"),
    );

    expect(curtainUp()).toEqual(utilities.error("canvas-context-not-found"));
    expect(domUtilities.createCanvasResizeObserver).not.toHaveBeenCalled();
  });
});
