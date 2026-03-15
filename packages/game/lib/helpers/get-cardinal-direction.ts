import {
  EIGHT,
  EIGHTH_CIRCLE_DEGREES,
  HALF_CIRCLE_DEGREES,
} from "../constants.js";

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

  const index =
    Math.round((angle + HALF_CIRCLE_DEGREES) / EIGHTH_CIRCLE_DEGREES) % EIGHT;
  return directions[index]!;
};

export default getCardinalDirection;
