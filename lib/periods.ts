/** Time parameters for createWill, in seconds (TD-009). */
export type Periods = {
  checkInInterval: number;
  gracePeriod: number;
  challengePeriod: number;
};

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const PERIOD_PRESETS = {
  // Short enough to run create → miss check-in → claim → finalize in one demo recording.
  demo: { label: "Demo", periods: { checkInInterval: 2 * MINUTE, gracePeriod: MINUTE, challengePeriod: MINUTE } },
  realistic: { label: "Realistic", periods: { checkInInterval: 30 * DAY, gracePeriod: 7 * DAY, challengePeriod: 3 * DAY } },
} as const satisfies Record<string, { label: string; periods: Periods }>;

export const DURATION_UNITS = [
  { label: "minutes", seconds: MINUTE },
  { label: "hours", seconds: HOUR },
  { label: "days", seconds: DAY },
] as const;

/** Largest unit that divides the value evenly, so presets round-trip into the form cleanly. */
export function splitDuration(seconds: number): { value: number; unitSeconds: number } {
  const unit = [...DURATION_UNITS].reverse().find((u) => seconds % u.seconds === 0) ?? DURATION_UNITS[0];
  return { value: seconds / unit.seconds, unitSeconds: unit.seconds };
}

export function formatDuration(seconds: number): string {
  const { value, unitSeconds } = splitDuration(seconds);
  const unit = DURATION_UNITS.find((u) => u.seconds === unitSeconds)!.label;
  return `${value} ${value === 1 ? unit.slice(0, -1) : unit}`;
}
