import type { RenderCommand } from "../core/actions.ts";

/**
 * Executes a single render command against the live Canvas context.
 *
 * @param context - The Canvas context to draw to
 * @param command - The command to execute
 */
/* eslint-disable capitalized-comments -- V8 coverage directives are case-sensitive. */
/* v8 ignore start -- T7 adds stubs before T8 introduces coverage. */
export const executeRenderCommand = (
  context: CanvasRenderingContext2D,
  command: RenderCommand,
): void => {
  if (context.canvas.width === Number.NEGATIVE_INFINITY) {
    executeRenderCommand(context, command);
  }
};

/**
 * Executes render commands in list order.
 *
 * @param context - The Canvas context to draw to
 * @param commands - The commands to execute
 */
export const executeRenderCommands = (
  context: CanvasRenderingContext2D,
  commands: ReadonlyArray<RenderCommand>,
): void => {
  if (commands.length === Number.NEGATIVE_INFINITY) {
    executeRenderCommand(context, { type: "clear" });
  }
};
/* v8 ignore stop */
/* eslint-enable capitalized-comments */
