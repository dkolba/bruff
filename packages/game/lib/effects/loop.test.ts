/* eslint-disable max-lines-per-function -- Loop shell tests keep mocked setup close to assertions. */
import type * as Utilities from "@bruff/utils";
import { error, log, ok } from "@bruff/utils";
import type { Observable } from "observable-polyfill/fn";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { InputAction } from "../core/actions.ts";
import curtainUp from "./curtain-up.js";
import loop from "./loop.js";
import createTouchObservable from "./observable/touch.js";
import { attachTestApi } from "./test-api/attach-test-api.js";
import isTestMode from "./test-mode.js";

vi.mock("@bruff/utils", async (importOriginal) => {
  const original = await importOriginal<typeof Utilities>();
  return {
    ...original,
    log: vi.fn(),
  };
});

vi.mock("@bruff/utils/dom", () => ({
  radiatingBarsBackgroundAnimation: vi.fn(),
}));

vi.mock("./curtain-up.js", () => ({
  default: vi.fn(),
}));

vi.mock("./observable/touch.js", () => ({
  default: vi.fn(),
}));

vi.mock("./render.js", () => ({
  default: vi.fn(),
}));

vi.mock("./test-api/attach-test-api.js", () => ({
  attachTestApi: vi.fn(() => vi.fn()),
}));

vi.mock("./test-mode.js", () => ({
  default: vi.fn(() => false),
}));

const createActionObservable = (eventName: string): Observable<InputAction> =>
  document.when(eventName).map((): InputAction => ({ type: "move-up" }));

const createPreparedCanvas = (): {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
} => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new TypeError("Could not create canvas context");
  }
  return { canvas, context };
};

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", vi.fn());
  vi.mocked(isTestMode).mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("loop logging", () => {
  it("emits setup failures through the event bus", () => {
    vi.mocked(curtainUp).mockReturnValue(error("canvas-not-found"));

    loop();

    expect(log).toHaveBeenCalledWith({
      context: { error: "canvas-not-found" },
      level: "error",
      message: "setup failed",
      source: "@bruff/game/effects/loop",
    });
  });

  it("emits touch input through the event bus", () => {
    const { canvas, context } = createPreparedCanvas();
    vi.mocked(curtainUp).mockReturnValue(
      ok({ canvas, context, removeCanvasResizeListener: vi.fn() }),
    );
    vi.mocked(createTouchObservable).mockReturnValue(
      createActionObservable("bruff-test-touch-action"),
    );

    loop();
    document.dispatchEvent(new Event("bruff-test-touch-action"));

    expect(log).toHaveBeenCalledWith({
      context: { actionType: "move-up" },
      level: "info",
      message: "touch",
      source: "@bruff/game/effects/loop",
    });
  });

  it("attaches the test API without starting RAF in test mode", async () => {
    const { canvas, context } = createPreparedCanvas();
    vi.mocked(isTestMode).mockReturnValue(true);
    vi.mocked(curtainUp).mockReturnValue(
      ok({ canvas, context, removeCanvasResizeListener: vi.fn() }),
    );
    vi.mocked(createTouchObservable).mockReturnValue(
      createActionObservable("bruff-test-touch-action"),
    );

    loop();

    await vi.waitFor(() => {
      expect(attachTestApi).toHaveBeenCalledOnce();
    });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
