import {
  canvasResizeListener,
  createCanvasResizeObserver,
  getCanvas,
  getCanvasContext,
  getShadowGameRoot,
} from "@bruff/utils/dom";
import { flatMapResult, ok, pipe, type Result } from "@bruff/utils";

/**
 * The error reasons that {@link curtainUp} can surface to its caller.
 */
export type CurtainUpError =
  | "canvas-context-not-found"
  | "canvas-not-found"
  | "game-root-not-found";

/**
 * The successful product of {@link curtainUp}: the canvas, its 2D
 * context, and a teardown function that detaches the resize listener.
 */
export type CurtainUpStage = Readonly<{
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  removeCanvasResizeListener: () => void;
}>;

/**
 * Composes the shadow root → canvas → 2D-context boundary chain into
 * a single railway. Each step short-circuits on its own typed error.
 *
 * @param selector - The selector for the game-root element
 * @returns `ok` with both the canvas and its 2D context, or `error`
 *   carrying the first failure reason encountered along the chain
 */
const resolveStageInputs = (
  selector: string,
): Result<
  Readonly<{ canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }>,
  CurtainUpError
> =>
  pipe(
    getShadowGameRoot,
    flatMapResult(getCanvas),
    flatMapResult(
      (
        canvas: HTMLCanvasElement,
      ): Result<
        Readonly<{
          canvas: HTMLCanvasElement;
          context: CanvasRenderingContext2D;
        }>,
        "canvas-context-not-found"
      > => {
        const contextResult = getCanvasContext(canvas);
        return contextResult.type === "ok"
          ? ok({ canvas, context: contextResult.value })
          : contextResult;
      },
    ),
  )(selector);

/**
 * Wires the shadow root → canvas → 2D context chain, attaches a
 * resize observer, and returns the canvas plus its teardown
 * function. Failures from any boundary helper are bubbled up as a
 * typed {@link Result} so the caller can decide how to surface them.
 *
 * @returns `ok` with the prepared stage, or `error` carrying the
 *   first failure reason encountered along the chain
 */
const curtainUp = (): Result<CurtainUpStage, CurtainUpError> => {
  const inputs = resolveStageInputs("bruff-game");
  if (inputs.type === "error") {
    return inputs;
  }
  const { canvas, context } = inputs.value;
  createCanvasResizeObserver(canvas, context);
  const removeCanvasResizeListener = canvasResizeListener(canvas);
  return ok({ canvas, context, removeCanvasResizeListener });
};

export default curtainUp;
