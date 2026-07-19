import type { LogEvent } from "./log-event";

type LogHandler = (event: LogEvent) => void;

const subscribers = new Set<LogHandler>();

/** Emits a log event to all active subscribers. */
export const log = (event: LogEvent): void => {
  for (const handler of subscribers) {
    handler(event);
  }
};

/** Registers a log event subscriber and returns a cleanup callback. */
export const onLog = (handler: LogHandler): (() => void) => {
  subscribers.add(handler);

  return (): void => {
    subscribers.delete(handler);
  };
};
