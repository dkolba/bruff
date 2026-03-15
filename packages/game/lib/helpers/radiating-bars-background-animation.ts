import {
  BASE_SIZE,
  HALF,
  HUE_MULTIPLIER,
  ONE,
  PULSE_MAGNITUDE,
  PULSE_SPEED,
  RANGE_SCALE,
  ROTATION_SPEED,
  TWO,
  ZERO,
} from "../constants.js";
import { hsla } from "./hsla.js";

/**
 * Draws a single bar with color shifting based on position.
 */
const drawBar = ({
  context,
  index,
  range,
  size,
  timestamp,
}: {
  context: CanvasRenderingContext2D;
  index: number;
  range: number;
  size: number;
  timestamp: number;
}) => {
  context.fillStyle = hsla({
    alpha: ONE,
    hue: (index / range) * HUE_MULTIPLIER + timestamp * ROTATION_SPEED,
    lightness: HALF,
    saturation: ONE,
  });
  context.fillRect(index, -range, size, range * TWO);
  context.fillRect(-index, -range, size, range * TWO);
};

/**
 * Creates an animated background pattern of radiating bars that rotate and pulse.
 * The bars emanate from the center of the canvas in both directions, with colors
 * that shift based on position and time.
 *
 * @param context - The 2D rendering context of the canvas
 * @param timestamp - The current timestamp for animation timing
 * @returns void
 * @remarks
 * The animation uses the following effects:
 * - Rotation: The entire pattern rotates based on the timestamp
 * - Pulsing: The bars' size pulses using a sine wave
 * - Color shifting: Colors transition across the hue spectrum
 * - Symmetry: Bars radiate both left and right from center
 */
export const radiatingBarsBackgroundAnimation = (
  context: CanvasRenderingContext2D,
  timestamp: number,
) => {
  context.save();
  try {
    context.translate(context.canvas.width / TWO, context.canvas.height / TWO);
    context.rotate(timestamp * ROTATION_SPEED);

    const range =
      Math.max(context.canvas.width, context.canvas.height) * RANGE_SCALE;
    const size =
      BASE_SIZE + Math.sin(timestamp * PULSE_SPEED) * PULSE_MAGNITUDE;
    for (let index = 0; index < range; index += size) {
      drawBar({ context, index, range, size, timestamp });
    }
    context.setTransform(ONE, ZERO, ZERO, ONE, ZERO, ZERO);
  } finally {
    context.restore();
  }
};
