/* node:coverage ignore file */
import { isCliEntryPoint, runBruffCliWithProcess } from "./bruff-cli.ts";

if (isCliEntryPoint(process.argv, import.meta.url)) {
  const writeResult = runBruffCliWithProcess({
    input: process.stdin,
    writer: process.stdout,
  });

  if (writeResult.type === "error") {
    process.exitCode = 1;
  }
}
