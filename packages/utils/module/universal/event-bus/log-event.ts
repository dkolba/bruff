import type { LogLevel } from "./log-level";

/**
Payload emitted through the log event bus.
*/
export type LogEvent = Readonly<{
  level: LogLevel;
  message: string;
  source?: string;
  context?: Readonly<Record<string, unknown>>;
}>;
