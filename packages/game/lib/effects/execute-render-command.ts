import type { RenderCommand } from "../core/actions.ts";

const ZERO = 0;

/**
Executes a single render command against the live Canvas context.

@param context - The Canvas context to draw to
@param command - The command to execute
*/
export const executeRenderCommand = (
  context: CanvasRenderingContext2D,
  command: RenderCommand,
): void => {
  switch (command.type) {
    case "clear": {
      context.clearRect(
        ZERO,
        ZERO,
        context.canvas.width,
        context.canvas.height,
      );
      return;
    }
    case "fill-rect": {
      context.fillStyle = command.color;
      context.fillRect(
        command.xPos,
        command.yPos,
        command.width,
        command.height,
      );
      return;
    }

    /* v8 ignore next 5 -- Exhaustiveness guard is unreachable until a new command variant exists. */
    default: {
      const _exhaustive: never = command;
      // eslint-disable-next-line consistent-return -- Exhaustive guard returns never per package rule A-19.
      return _exhaustive;
    }
  }
};

/**
Executes render commands in list order.

@param context - The Canvas context to draw to
@param commands - The commands to execute
*/
export const executeRenderCommands = (
  context: CanvasRenderingContext2D,
  commands: ReadonlyArray<RenderCommand>,
): void => {
  for (const command of commands) {
    executeRenderCommand(context, command);
  }
};
