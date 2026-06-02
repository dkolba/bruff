/* node:coverage ignore next */
import type { TerminalColor, TerminalPosition } from "./terminal-cell.ts";

const encodeColor = (mode: "38" | "48", color: TerminalColor): string =>
  `\u001B[${mode};2;${color.red};${color.green};${color.blue}m`;

const encodeCursorMove = (position: TerminalPosition): string =>
  `\u001B[${position.row};${position.column}H`;

/**
 * Terminal command encoded as ANSI text before writing.
 */
export type AnsiCommand =
  | Readonly<{ type: "clear-screen" }>
  | Readonly<{ position: TerminalPosition; type: "cursor-move" }>
  | Readonly<{ type: "reset-style" }>
  | Readonly<{ color: TerminalColor; type: "set-background" }>
  | Readonly<{ color: TerminalColor; type: "set-foreground" }>
  | Readonly<{ glyph: string; type: "write-glyph" }>;

/**
 * Encode one terminal command as ANSI text.
 */
export const encodeAnsiCommand = (command: AnsiCommand): string => {
  /* node:coverage ignore next 10 */
  switch (command.type) {
    case "clear-screen": {
      return "\u001B[2J";
    }
    case "cursor-move": {
      return encodeCursorMove(command.position);
    }
    case "reset-style": {
      return "\u001B[0m";
    }
    case "set-background": {
      return encodeColor("48", command.color);
    }
    case "set-foreground": {
      return encodeColor("38", command.color);
    }
    case "write-glyph": {
      return command.glyph;
    }
    /* node:coverage ignore next 5 */
    default: {
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
};

/**
 * Encode terminal commands as one ANSI text chunk.
 */
export const encodeAnsiCommands = (
  commands: ReadonlyArray<AnsiCommand>,
): string => commands.map((command) => encodeAnsiCommand(command)).join("");
