import {
  createHeadlessGame,
  type GameState,
  normaliseKey,
  projectHeadlessFrame,
  stepHeadlessGame,
} from "@bruff/game/headless";
import {
  type TextWriter,
  type WriteFrameResult,
  writeTerminalFrame,
} from "../module/write-frame.ts";
import { gameFrameToTerminalFrame } from "../module/game-frame.ts";
import { pathToFileURL } from "node:url";

const controlCShortcut = "\u0003";
const lowercaseQuitShortcut = "q";
const uppercaseQuitShortcut = "Q";
const headlessCanvas = { height: 7, width: 7 };
const headlessSeed = 1;

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
 * Process stdin shape adapted into the CLI text input port.
 */
export type ProcessTextInput = Readonly<{
  /**
   * Whether the process input supports terminal behaviour.
   */
  isTTY?: boolean;
  /**
   * Remove an input listener.
   */
  off: (
    eventName: "data",
    listener: (chunk: TextInputChunk) => void,
  ) => unknown;
  /**
   * Register an input listener.
   */
  on: (eventName: "data", listener: (chunk: TextInputChunk) => void) => unknown;
  /**
   * Stop reading input.
   */
  pause: () => unknown;
  /**
   * Start reading input.
   */
  resume: () => unknown;
  /**
   * Enable or disable terminal raw mode.
   */
  setRawMode?: (enabled: boolean) => unknown;
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

/**
 * Process input and output ports used by the executable CLI wrapper.
 */
export type BruffCliProcessPorts = Readonly<{
  /**
   * Process terminal input.
   */
  input: ProcessTextInput;
  /**
   * Process terminal output.
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

const writeGameFrame = (
  writer: TextWriter,
  state: GameState,
): WriteFrameResult =>
  writeTerminalFrame(
    writer,
    gameFrameToTerminalFrame(projectHeadlessFrame(state)),
  );

const releaseCliInput = (
  input: TextInput,
  listener: (chunk: TextInputChunk) => void,
): TextInput => disableRawMode(input.off("data", listener));

/**
 * Adapt a process-like input stream into the CLI text input port.
 */
export const createTextInput = (source: ProcessTextInput): TextInput => {
  const input: TextInput = {
    isTTY: source.isTTY,
    off: (
      eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      source.off(eventName, listener);
      return input;
    },
    on: (
      eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      source.on(eventName, listener);
      return input;
    },
    pause: (): TextInput => {
      source.pause();
      return input;
    },
    resume: (): TextInput => {
      source.resume();
      return input;
    },
    setRawMode: (enabled: boolean): TextInput => {
      if (source.isTTY === true && source.setRawMode !== undefined) {
        source.setRawMode(enabled);
      }

      return input;
    },
  };

  return input;
};

/**
 * Render the deterministic game scene and wait for input.
 */
export const runBruffCli = (ports: BruffCliPorts): WriteFrameResult => {
  let currentState = createHeadlessGame({
    canvas: headlessCanvas,
    seed: headlessSeed,
  });
  const writeResult = writeGameFrame(ports.writer, currentState);

  if (writeResult.type === "error") {
    return writeResult;
  }

  const handleInput = (chunk: TextInputChunk): void => {
    const text = chunk.toString();

    if (isQuitShortcut(text)) {
      releaseCliInput(ports.input, handleInput);
      return;
    }

    const input = normaliseKey(text);

    if (input.type === "none") {
      return;
    }

    currentState = stepHeadlessGame(currentState, [input.value]);

    if (writeGameFrame(ports.writer, currentState).type === "error") {
      releaseCliInput(ports.input, handleInput);
    }
  };

  enableRawMode(ports.input).on("data", handleInput);

  return writeResult;
};

/**
 * Determine whether this module is being executed as the process entrypoint.
 */
export const isCliEntryPoint = (
  argv: ReadonlyArray<string>,
  moduleUrl: string,
): boolean => {
  const [, entryPath] = argv;

  return entryPath === undefined
    ? false
    : pathToFileURL(entryPath).href === moduleUrl;
};

/**
 * Render the CLI using process-like ports.
 */
export const runBruffCliWithProcess = (
  ports: BruffCliProcessPorts,
): WriteFrameResult =>
  runBruffCli({
    input: createTextInput(ports.input),
    writer: ports.writer,
  });

/* node:coverage ignore next 10 */
if (isCliEntryPoint(process.argv, import.meta.url)) {
  const writeResult = runBruffCliWithProcess({
    input: process.stdin,
    writer: process.stdout,
  });

  if (writeResult.type === "error") {
    process.exitCode = 1;
  }
}
