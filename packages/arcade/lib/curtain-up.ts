import {
  canvasResizeListener,
  createCanvasResizeObserver,
  getCanvas,
  getCanvasContext,
  getShadowGameRoot,
  pipe,
} from "@bruff/utils";

const curtainUp = () => {
  const context = pipe(
    getShadowGameRoot,
    getCanvas,
    getCanvasContext,
  )("bruff-game");

  const canvas = pipe(getShadowGameRoot, getCanvas)("bruff-game");

  createCanvasResizeObserver(canvas, context);

  const removeCanvasResizeListener = canvasResizeListener(canvas);

  return { canvas, context, removeCanvasResizeListener };
};

export default curtainUp;
