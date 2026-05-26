import type { BruffTestApi } from "@bruff/game/test-api";

declare global {
  var __bruffTestApi: BruffTestApi | undefined;

  interface Window {
    __bruffTestApi?: BruffTestApi;
  }
}
