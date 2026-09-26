"use client";

import Link from "next/link";
import { useState } from "react";
import { formatEther } from "viem";
import { useHeirWills } from "@/hooks/useHeirWills";
import { useWorldIdProof, WorldIdCancelledError } from "@/hooks/useWorldIdProof";
import { CLAIM_ACTION, HEIR_REGISTER_SIGNAL } from "@/lib/constants";
import { explainError } from "@/lib/errors";
import { setVerifiedHeir, useVerifiedHeir } from "@/lib/heirSession";
import { shortAddress } from "./ConnectButton";
import { PhaseBadge } from "./PhaseBadge";
import { Button, Card, CardTitle, Eyebrow, Notice } from "./ui";

/** Lets an heir find the wills naming them. No wallet needed — the heir is identified by World ID only. */
export function HeirLookup() {
  const worldId = useWorldIdProof();
  const nullifier = useVerifiedHeir();
  const [scanError, setScanError] = useState<string | null>(null);
  const { wills, error } = useHeirWills(nullifier);

  async function lookUp() {
    setScanError(null);
    try {
      // Same text signal as heir registration: this proof can never satisfy initiateClaim.
      const { nullifierHash } = await worldId.request(CLAIM_ACTION, HEIR_REGISTER_SIGNAL);
      setVerifiedHeir(nullifierHash);
    } catch (e) {
      if (!(e instanceof WorldIdCancelledError)) setScanError(explainError(e));
    }
  }

  const forget = () => setVerifiedHeir(null);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Eyebrow>For the heir</Eyebrow>
        <CardTitle>See what was left to you</CardTitle>
      </div>
      <p className="text-sm text-ink-soft">
        Verify with World ID to find the wills that name you. No wallet is needed to look.
      </p>

      {nullifier !== null &&
        (wills === undefined ? (
          <p className="text-sm text-muted">Looking up wills…</p>
        ) : wills.length === 0 ? (
          <Notice>No wills name this World ID as heir.</Notice>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {wills.map((w) => (
              <li key={w.id.toString()}>
                <Link
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-brass-tint/40"
                  href={`/will/${w.id}`}
                >
                  <span className="flex flex-col">
                    <span className="font-medium">
                      Will #{w.id.toString()}
                      {w.amount > 0n && ` · ${formatEther(w.amount)} ETH`}
                    </span>
                    <span className="font-mono text-xs text-muted">from {shortAddress(w.owner)}</span>
                  </span>
                  <PhaseBadge phase={w.phase} />
                </Link>
              </li>
            ))}
          </ul>
        ))}

      {(scanError || error) && <Notice tone="error">{scanError ?? explainError(error)}</Notice>}

      <div className="mt-auto flex items-center gap-3">
        <Button variant={nullifier === null ? "primary" : "secondary"} disabled={worldId.busy} onClick={lookUp}>
          {nullifier === null ? "Find wills that name me" : "Verify again"}
        </Button>
        {nullifier !== null && (
          <Button variant="ghost" onClick={forget}>
            Forget
          </Button>
        )}
      </div>
      {worldId.widget}
    </Card>
  );
}
