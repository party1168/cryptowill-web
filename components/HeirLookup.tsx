"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { formatEther } from "viem";
import { useHeirWills } from "@/hooks/useHeirWills";
import { useWorldIdProof, WorldIdCancelledError } from "@/hooks/useWorldIdProof";
import { CLAIM_ACTION, HEIR_REGISTER_SIGNAL } from "@/lib/constants";
import { explainError } from "@/lib/errors";
import { shortAddress } from "./ConnectButton";
import { PhaseBadge } from "./PhaseBadge";
import { Button, Card, CardTitle, Eyebrow, Notice } from "./ui";

const STORAGE_KEY = "cryptowill.heirNullifier";

// The looked-up nullifier, remembered for this tab so going back from a will page doesn't need a
// re-scan. Kept in memory too, so lookups still work when sessionStorage is blocked.
let savedNullifier: string | null | undefined;
const listeners = new Set<() => void>();

function readSaved(): string | null {
  if (savedNullifier === undefined) {
    try {
      savedNullifier = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      savedNullifier = null;
    }
  }
  return savedNullifier;
}

function save(value: string | null) {
  savedNullifier = value;
  try {
    if (value === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, value);
  } catch {}
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/** Lets an heir find the wills naming them. No wallet needed — the heir is identified by World ID only. */
export function HeirLookup() {
  const worldId = useWorldIdProof();
  const saved = useSyncExternalStore(subscribe, readSaved, () => null);
  const nullifier = saved === null ? null : BigInt(saved);
  const [scanError, setScanError] = useState<string | null>(null);
  const { wills, error } = useHeirWills(nullifier);

  async function lookUp() {
    setScanError(null);
    try {
      // Same text signal as heir registration: this proof can never satisfy initiateClaim.
      const { nullifierHash } = await worldId.request(CLAIM_ACTION, HEIR_REGISTER_SIGNAL);
      save(nullifierHash.toString());
    } catch (e) {
      if (!(e instanceof WorldIdCancelledError)) setScanError(explainError(e));
    }
  }

  const forget = () => save(null);

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
