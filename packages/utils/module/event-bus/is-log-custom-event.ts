import type { LogEvent } from "./log-event";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isLogLevel = (level: unknown): level is LogEvent["level"] =>
  level === "debug" ||
  level === "info" ||
  level === "warn" ||
  level === "error";

/**
 * Narrows unknown events into log CustomEvents.
 */
export const isLogCustomEvent = (
  event: Event,
): event is CustomEvent<LogEvent> => {
  if (!(event instanceof CustomEvent) || !isRecord(event.detail)) {
    return false;
  }

  const { level, message } = event.detail;
  return isLogLevel(level) && typeof message === "string";
};
