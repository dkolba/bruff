import type { LogEvent } from "./log-event";
import type { LogLevel } from "./log-level";

const getConsoleMethod = (level: LogLevel): typeof console.debug => {
  switch (level) {
    case "debug":
      return console.debug;
    case "info":
      return console.info;
    case "warn":
      return console.warn;
    case "error":
      return console.error;
  }
};

const getPrefix = (level: LogLevel): string => `[${level}]`;

/**
 * Writes a log event to the browser console.
 */
export const consoleLogHandler = (event: LogEvent): void => {
  const sink = getConsoleMethod(event.level);
  const prefix = getPrefix(event.level);

  if (event.source === undefined && event.context === undefined) {
    sink(prefix, event.message);
    return;
  }

  sink(prefix, event.message, { source: event.source, context: event.context });
};
