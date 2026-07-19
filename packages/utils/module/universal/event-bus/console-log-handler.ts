import type { LogEvent } from "./log-event.ts";
import type { LogLevel } from "./log-level.ts";

type ConsoleLogSink = (...messages: ReadonlyArray<unknown>) => void;

const consoleMethods = {
  debug: (...messages: ReadonlyArray<unknown>): void => {
    // eslint-disable-next-line no-console -- Debug log events intentionally route to the matching console method.
    console.debug(...messages);
  },
  error: (...messages: ReadonlyArray<unknown>): void => {
    console.error(...messages);
  },
  info: (...messages: ReadonlyArray<unknown>): void => {
    console.info(...messages);
  },
  warn: (...messages: ReadonlyArray<unknown>): void => {
    console.warn(...messages);
  },
} satisfies Readonly<Record<LogLevel, ConsoleLogSink>>;

const getConsoleMethod = (level: LogLevel): ConsoleLogSink =>
  consoleMethods[level];

const getPrefix = (level: LogLevel): string => `[${level}]`;

/** Writes a log event to the browser console. */
export const consoleLogHandler = (event: LogEvent): void => {
  const sink = getConsoleMethod(event.level);
  const prefix = getPrefix(event.level);

  if (event.source === undefined && event.context === undefined) {
    sink(prefix, event.message);
    return;
  }

  sink(prefix, event.message, { context: event.context, source: event.source });
};
