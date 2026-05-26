import {
  type TextWriter,
  type WriteFrameResult,
  writeTerminalFrame,
} from "../module/write-frame.ts";
import { createMockTerminalFrame } from "../module/mock-scene.ts";
import { pathToFileURL } from "node:url";

const controlCShortcut = "\u0003";
const lowercaseQuitShortcut = "q";
const uppercaseQuitShortcut = "Q";

/**
 * Text input chunk received from the terminal.
 */
export type TextInputChunk = Buffer | string;

/**
 * Minimal stdin-like input used by the CLI session.
 */
export type TextInput = Readonly<{
  /**
   * Whether the input supports terminal raw mode.
   */
  isTTY?: boolean;
  /**
   * Stop reading input.
   */
  pause: () => TextInput;
  /**
   * Start reading input.
   */
  resume: () => TextInput;
  /**
   * Enable or disable terminal raw mode.
   */
  setRawMode?: (enabled: boolean) => TextInput;
  /**
   * Register an input listener.
   */
  on: (
    eventName: "data",
    listener: (chunk: TextInputChunk) => void,
  ) => TextInput;
  /**
   * Remove an input listener.
   */
  off: (
    eventName: "data",
    listener: (chunk: TextInputChunk) => void,
  ) => TextInput;
}>;

/**
 * Input and output ports for the CLI session.
 */
export type BruffCliPorts = Readonly<{
  /**
   * Terminal input.
   */
  input: TextInput;
  /**
   * Terminal output.
   */
  writer: TextWriter;
}>;

const isQuitShortcut = (text: string): boolean =>
  text.includes(lowercaseQuitShortcut) ||
  text.includes(uppercaseQuitShortcut) ||
  text.includes(controlCShortcut);

const enableRawMode = (input: TextInput): TextInput =>
  input.isTTY === true && input.setRawMode !== undefined
    ? input.setRawMode(true).resume()
    : input.resume();

const disableRawMode = (input: TextInput): TextInput =>
  input.isTTY === true && input.setRawMode !== undefined
    ? input.setRawMode(false).pause()
    : input.pause();

const createProcessInput = (): TextInput => {
  const input: TextInput = {
    isTTY: process.stdin.isTTY,
    off: (
      eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      process.stdin.off(eventName, listener);
      return input;
    },
    on: (
      eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      process.stdin.on(eventName, listener);
      return input;
    },
    pause: (): TextInput => {
      process.stdin.pause();
      return input;
    },
    resume: (): TextInput => {
      process.stdin.resume();
      return input;
    },
    setRawMode: (enabled: boolean): TextInput => {
      if (process.stdin.isTTY === true) {
        process.stdin.setRawMode(enabled);
      }

      return input;
    },
  };

  return input;
};

/**
 * Render the deterministic mock scene and wait for a quit shortcut.
 */
export const runBruffCli = (ports: BruffCliPorts): WriteFrameResult => {
  const writeResult = writeTerminalFrame(
    ports.writer,
    createMockTerminalFrame(),
  );

  if (writeResult.type === "error") {
    return writeResult;
  }

  const handleInput = (chunk: TextInputChunk): void => {
    if (isQuitShortcut(chunk.toString())) {
      ports.input.off("data", handleInput);
      disableRawMode(ports.input);
    }
  };

  enableRawMode(ports.input).on("data", handleInput);

  return writeResult;
};

const isCliEntryPoint = (
  argv: ReadonlyArray<string>,
  moduleUrl: string,
): boolean => {
  const [, entryPath] = argv;

  return entryPath === undefined
    ? false
    : pathToFileURL(entryPath).href === moduleUrl;
};

if (isCliEntryPoint(process.argv, import.meta.url)) {
  const writeResult = runBruffCli({
    input: createProcessInput(),
    writer: process.stdout,
  });

  if (writeResult.type === "error") {
    process.exitCode = 1;
  }
}
