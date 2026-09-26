"use client";

import { useNow } from "@/hooks/useNow";
import type { WillData } from "@/hooks/useWill";
import { formatRemaining } from "@/lib/periods";
import { shortAddress } from "./ConnectButton";

/** Explains the current phase and counts down to the next boundary. */
export function PhaseBanner({ will }: { will: WillData }) {
  const now = useNow();
  // Local clock can run slightly ahead of the chain; the phase itself always comes from the contract.
  const until = (t: number) => (t > now ? `in ${formatRemaining(t - now)}` : "any moment now");

  const text: Record<WillData["phase"], string> = {
    None: "This will does not exist.",
    Active: `The owner is checking in on schedule. Next check-in due ${until(will.graceStartsAt)}.`,
    Grace: `The owner missed a check-in but can still check in. The heir can claim ${until(will.claimableAt)}.`,
    Claimable: "The owner missed the deadline. The heir can now start a claim; the owner can still check in.",
    Challenge: `A claim to ${shortAddress(will.payoutAddress)} is pending. The owner can void it by checking in — the challenge period ends ${until(will.challengeEndsAt ?? 0)}.`,
    Finalizable: `The challenge period is over. Anyone can finalize the payout to ${shortAddress(will.payoutAddress)}.`,
    Claimed: `Paid out to ${shortAddress(will.payoutAddress)}.`,
    Cancelled: "The owner cancelled this will and withdrew the funds.",
  };

  return (
    <div className="flex flex-col gap-1 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <span className="text-xs uppercase tracking-wide text-zinc-500">Phase</span>
      <span className="text-lg font-bold">{will.phase}</span>
      <p className="text-sm">{text[will.phase]}</p>
    </div>
  );
}
