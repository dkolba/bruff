import type { LogEvent } from "./log-event";

import { isLogCustomEvent } from "./is-log-custom-event";

const LOG_EVENT_NAME = "bruff:log";

const eventTarget = new EventTarget();

/**
 * Emits a log event to all active subscribers.
 */
export const log = (event: LogEvent): void => {
  eventTarget.dispatchEvent(
    new CustomEvent<LogEvent>(LOG_EVENT_NAME, { detail: event }),
  );
};

/**
 * Registers a log event subscriber and returns a cleanup callback.
 */
export const onLog = (handler: (event: LogEvent) => void): (() => void) => {
  const listener = (event: Event): void => {
    if (isLogCustomEvent(event)) {
      handler(event.detail);
    }
  };

  eventTarget.addEventListener(LOG_EVENT_NAME, listener);

  return (): void => {
    eventTarget.removeEventListener(LOG_EVENT_NAME, listener);
  };
};
