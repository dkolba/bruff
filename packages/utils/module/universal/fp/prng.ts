const MULBERRY32_ADDEND = 1_851_936_245;
const MIX_OR_ONE = 1;
const MIX_OR_SIXTY_ONE = 61;
const SHIFT_SEVEN = 7;
const SHIFT_FOURTEEN = 14;
const SHIFT_FIFTEEN = 15;
const UINT32_RANGE = 4_294_967_296;
const ZERO = 0;

/**
 * Immutable PRNG state carrying the current 32-bit Mulberry32 accumulator.
 * Treat as an opaque token — never construct directly, use {@link createPrng}.
 */
export type PrngState = Readonly<{ accumulator: number; type: "prng-state" }>;

/**
 * Seeds a new PRNG from a plain integer. The seed uniquely determines
 * the full output sequence; identical seeds produce identical sequences.
 *
 * @param seed - Any integer seed value
 * @returns A fresh {@link PrngState} anchored to `seed`
 */
export const createPrng = (seed: number): PrngState => ({
  accumulator: seed,
  type: "prng-state",
});

/* eslint-disable no-bitwise -- Mulberry32 PRNG requires bitwise arithmetic for correct 32-bit overflow semantics. No non-bitwise equivalent exists. All bitwise usage is confined to this one function. */
const advanceState = (state: PrngState): number => {
  const added = state.accumulator + MULBERRY32_ADDEND;
  const mixed = Math.imul(
    added ^ (added >>> SHIFT_FIFTEEN),
    added | MIX_OR_ONE,
  );
  const furtherMixed =
    mixed ^
    (mixed +
      Math.imul(mixed ^ (mixed >>> SHIFT_SEVEN), mixed | MIX_OR_SIXTY_ONE));
  return (furtherMixed ^ (furtherMixed >>> SHIFT_FOURTEEN)) >>> ZERO;
};
/* eslint-enable no-bitwise */

/**
 * Advances the PRNG by one step and returns the next float in `[0, 1)` plus
 * the updated state. Never mutates — the old {@link PrngState} remains valid.
 *
 * @param prng - The current PRNG state
 * @returns `{ prng, value }` — `value` in `[0, 1)`, `prng` is the next state
 */
export const nextNumber = (
  prng: PrngState,
): { prng: PrngState; value: number } => {
  const raw = advanceState(prng);
  return {
    prng: { accumulator: raw, type: "prng-state" },
    value: raw / UINT32_RANGE,
  };
};

/**
 * Generates a raw string ID by drawing two consecutive PRNG steps and
 * formatting the two unsigned 32-bit integers as `"<a>-<b>"`. Advances
 * the state twice. Callers brand the returned string at the entity layer.
 * IDs are unique with overwhelming probability across all draws from the
 * same seed.
 *
 * @param prng - The current PRNG state
 * @returns `{ prng, value }` — `value` is the raw ID string, `prng` is the next state
 */
export const nextId = (prng: PrngState): { prng: PrngState; value: string } => {
  const first = nextNumber(prng);
  const second = nextNumber(first.prng);
  const firstPart = first.value * UINT32_RANGE;
  const secondPart = second.value * UINT32_RANGE;
  return {
    prng: second.prng,
    value: `${firstPart}-${secondPart}`,
  };
};
