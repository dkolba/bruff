import { HUE_DEGREES, PERCENTAGE } from "../constants.js";

/**
 * Converts an HSLA object to a CSS hsla() string.
 *
 * @param props - The HSLA color values object with alpha, hue, lightness, and saturation values between 0-1
 * @returns The CSS hsla() color string
 */
export const hsla = ({
  alpha,
  hue,
  lightness,
  saturation,
}: {
  alpha: number;
  hue: number;
  lightness: number;
  saturation: number;
}) =>
  `hsla(${Math.round(hue * HUE_DEGREES)}, ${saturation * PERCENTAGE}%, ${
    lightness * PERCENTAGE
  }%, ${alpha})`;
