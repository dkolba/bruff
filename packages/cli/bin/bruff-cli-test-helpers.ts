/* node:coverage ignore next */
import type {
  ProcessTextInput,
  TextInput,
  TextInputChunk,
} from "./bruff-cli.ts";

/** Fake stdin-like input used by CLI tests. */
export type FakeInput = TextInput &
  Readonly<{
    emit: (chunk: TextInputChunk) => void;
    hasListener: () => boolean;
    isPaused: () => boolean;
    rawModes: () => ReadonlyArray<boolean>;
  }>;

/** Fake process input used by process-port tests. */
export type FakeProcessInput = ProcessTextInput &
  Readonly<{
    eventLog: () => ReadonlyArray<string>;
    rawModes: () => ReadonlyArray<boolean>;
  }>;

/** Data listener placeholder for fake inputs. */
export const ignoreInput = (chunk: TextInputChunk): void => {
  chunk.toString();
};

/** Create a fake CLI text input port. */
export const createFakeInput = (
  isTTY: boolean,
  hasRawMode = true,
): FakeInput => {
  const rawModeLog: Array<boolean> = [];
  let dataListener: (chunk: TextInputChunk) => void = ignoreInput;
  let isPaused = true;
  const input: FakeInput = {
    emit: (chunk: TextInputChunk): void => {
      dataListener(chunk);
    },
    hasListener: (): boolean => dataListener !== ignoreInput,
    isPaused: (): boolean => isPaused,
    isTTY,
    off: (
      _eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      if (dataListener === listener) {
        dataListener = ignoreInput;
      }
      return input;
    },
    on: (
      _eventName: "data",
      listener: (chunk: TextInputChunk) => void,
    ): TextInput => {
      dataListener = listener;
      return input;
    },
    pause: (): TextInput => {
      isPaused = true;
      return input;
    },
    rawModes: (): ReadonlyArray<boolean> => rawModeLog,
    resume: (): TextInput => {
      isPaused = false;
      return input;
    },
    setRawMode: hasRawMode
      ? (isEnabled: boolean): TextInput => {
          rawModeLog.push(isEnabled);
          return input;
        }
      : undefined,
  };
  return input;
};

/** Create a fake process input port. */
export const createFakeProcessInput = (
  isTTY: boolean | undefined,
  hasRawMode = true,
): FakeProcessInput => {
  const eventLog: Array<string> = [];
  const rawModeLog: Array<boolean> = [];

  return {
    eventLog: (): ReadonlyArray<string> => eventLog,
    isTTY,
    off: (eventName: "data"): unknown => {
      eventLog.push(`off:${eventName}`);
      return undefined;
    },
    on: (eventName: "data"): unknown => {
      eventLog.push(`on:${eventName}`);
      return undefined;
    },
    pause: (): unknown => {
      eventLog.push("pause");
      return undefined;
    },
    rawModes: (): ReadonlyArray<boolean> => rawModeLog,
    resume: (): unknown => {
      eventLog.push("resume");
      return undefined;
    },
    setRawMode: hasRawMode
      ? (isEnabled: boolean): unknown => {
          rawModeLog.push(isEnabled);
          return undefined;
        }
      : undefined,
  };
};
