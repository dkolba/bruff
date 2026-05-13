export type Clock = Readonly<
  { type: "wall" } | { nowMs: number; type: "manual" }
>;

export const wallClock = (): Clock => ({ type: "wall" });

export const manualClock = (nowMs: number): Clock => ({
  nowMs,
  type: "manual",
});

export const advanceManualClock = (clock: Clock, deltaMs: number): Clock =>
  clock.type === "manual"
    ? { nowMs: clock.nowMs + deltaMs, type: "manual" }
    : clock;

export const readClock = (clock: Clock): number =>
  clock.type === "manual" ? clock.nowMs : performance.now();
