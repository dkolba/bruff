import { none, type Option, some } from "@bruff/utils";
import type { InputAction } from "../core/actions.ts";

/**
 * Normalises a raw key name (or cardinal direction emitted by the
 * touch shell) into an {@link InputAction}. Accepts arrow keys,
 * WASD, and `north`/`south`/`east`/`west`, all case-insensitive.
 * Returns `none` for unrecognised inputs so the caller can drop
 * them without branching on `undefined`.
 *
 * @param key - The raw key string to normalise
 * @returns `some(InputAction)` for known inputs, `none` otherwise
 */
export const normaliseKey = (key: string): Option<InputAction> => {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "north":
    case "w": {
      return some({ type: "move-up" });
    }
    case "arrowdown":
    case "s":
    case "south": {
      return some({ type: "move-down" });
    }
    case "a":
    case "arrowleft":
    case "west": {
      return some({ type: "move-left" });
    }
    case "arrowright":
    case "d":
    case "east": {
      return some({ type: "move-right" });
    }
    default: {
      return none;
    }
  }
};
