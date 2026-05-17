import type { BruffTestApi } from "@bruff/game/test-api";

declare global {
  interface Window {
    __bruffTestApi?: BruffTestApi;
  }
}
