"use client";

import { useNow } from "@/hooks/useNow";
import type { WillData } from "@/hooks/useWill";
import { formatRemaining } from "@/lib/periods";
import type { WillPhaseName } from "@/lib/phase";
import { shortAddress } from "./ConnectButton";
import { PhaseBadge } from "./PhaseBadge";
import { Card } from "./ui";

// The happy path a will walks through; Cancelled sits outside it.
const TIMELINE: { phase: WillPhaseName; label: string }[] = [
  { phase: "Active", label: "Active" },
  { phase: "Grace", label: "Grace" },
  { phase: "Claimable", label: "Claimable" },
  { phase: "Challenge", label: "Challenge" },
  { phase: "Claimed", label: "Paid out" },
];

function timelineIndex(phase: WillPhaseName) {
  if (phase === "Finalizable") return 3; // still the end of the challenge step
  return TIMELINE.findIndex((s) => s.phase === phase);
}

/** Current phase with a plain-language explanation, countdown and timeline. */
export function PhaseBanner({ will }: { will: WillData }) {
  const now = useNow();
  // Local clock can run slightly ahead of the chain; the phase itself always comes from the contract.
  const until = (t: number) => (t > now ? `in ${formatRemaining(t - now)}` : "any moment now");

  const text: Record<WillPhaseName, string> = {
    None: "This will does not exist.",
    Active: `The owner is checking in on schedule. The next check-in is due ${until(will.graceStartsAt)}.`,
    Grace: `The owner missed a check-in but can still check in. The heir can claim ${until(will.claimableAt)}.`,
    Claimable: "The owner missed the deadline. The heir can now start a claim — the owner can still check in.",
    Challenge: `A claim to ${shortAddress(will.payoutAddress)} is pending. The owner can void it by checking in; the challenge period ends ${until(will.challengeEndsAt ?? 0)}.`,
    Finalizable: `The challenge period is over. Anyone can now finalize the payout to ${shortAddress(will.payoutAddress)}.`,
    Claimed: `The funds were paid out to ${shortAddress(will.payoutAddress)}.`,
    Cancelled: "The owner cancelled this will and withdrew the funds.",
  };

  const current = timelineIndex(will.phase);

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PhaseBadge phase={will.phase} />
        <p className="font-display text-xl leading-snug text-ink">{text[will.phase]}</p>
      </div>

      {will.phase !== "Cancelled" && will.phase !== "None" && (
        <ol className="grid grid-cols-5 gap-2" aria-label="Will timeline">
          {TIMELINE.map((step, i) => {
            const state = i < current ? "past" : i === current ? "current" : "future";
            return (
              <li key={step.phase} className="flex flex-col gap-2">
                <span
                  className={`h-1.5 rounded-full ${
                    state === "past" ? "bg-brass" : state === "current" ? "bg-ink" : "bg-line"
                  }`}
                />
                <span className={`text-xs ${state === "current" ? "font-semibold text-ink" : "text-muted"}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
