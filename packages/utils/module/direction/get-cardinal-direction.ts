import {
  EIGHT,
  EIGHTH_CIRCLE_DEGREES,
  HALF_CIRCLE_DEGREES,
} from "../constants.js";

/**
 * Returns the cardinal or intercardinal direction string for a given 2D delta.
 *
 * @param dx - The horizontal component of the direction vector
 * @param dy - The vertical component of the direction vector
 * @returns One of: "NORTH", "NORTHEAST", "EAST", "SOUTHEAST", "SOUTH", "SOUTHWEST", "WEST", "NORTHWEST"
 */
export const getCardinalDirection = (dx: number, dy: number) => {
  const angle = (Math.atan2(dy, dx) * HALF_CIRCLE_DEGREES) / Math.PI;
  const directions = [
    "WEST",
    "NORTHWEST",
    "NORTH",
    "NORTHEAST",
    "EAST",
    "SOUTHEAST",
    "SOUTH",
    "SOUTHWEST",
  ];

  const normalized = (angle + HALF_CIRCLE_DEGREES) / EIGHTH_CIRCLE_DEGREES;
  const rounded = Math.round(normalized);
  const index = rounded % EIGHT;
  return directions[index]!;
};
