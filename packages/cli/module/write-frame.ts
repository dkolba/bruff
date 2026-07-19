import { encodeAnsiCommands } from "./ansi.ts";
import { renderTerminalFrame } from "./render-frame.ts";
import type { TerminalFrame } from "./terminal-cell.ts";

/**
Minimal stdout-like writer for terminal text.
*/
export type TextWriter = Readonly<{
  /**
  Write text and report whether the destination accepted it.
  */
  write: (text: string) => boolean;
}>;

/**
Result of writing a terminal frame.
*/
export type WriteFrameResult =
  | Readonly<{ type: "ok" }>
  | Readonly<{ reason: "write-failed" | "write-threw"; type: "error" }>;

const failedWriteResult: WriteFrameResult = {
  reason: "write-failed",
  type: "error",
};

const threwWriteResult: WriteFrameResult = {
  reason: "write-threw",
  type: "error",
};

/**
Render and write a terminal frame to an injected text writer.
*/
export const writeTerminalFrame = (
  writer: TextWriter,
  frame: TerminalFrame,
): WriteFrameResult => {
  const ansiText = encodeAnsiCommands(renderTerminalFrame(frame));

  try {
    return writer.write(ansiText) ? { type: "ok" } : failedWriteResult;
  } catch {
    return threwWriteResult;
  }
};
