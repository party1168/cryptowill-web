/** Mirrors the contract's WillPhase enum order (currentPhase return value). */
export const WILL_PHASES = [
  "None",
  "Active",
  "Grace",
  "Claimable",
  "Challenge",
  "Finalizable",
  "Claimed",
  "Cancelled",
] as const;
export type WillPhaseName = (typeof WILL_PHASES)[number];

export function phaseName(phase: number | undefined): WillPhaseName | undefined {
  return phase === undefined ? undefined : WILL_PHASES[phase];
}
