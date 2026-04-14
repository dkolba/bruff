/**
 * Clamps a value between a minimum and maximum.
 *
 * @param value - The number to clamp
 * @param min - The lower bound
 * @param max - The upper bound
 * @returns The clamped value
 */
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
