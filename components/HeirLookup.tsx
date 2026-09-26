"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { formatEther } from "viem";
import { useHeirWills } from "@/hooks/useHeirWills";
import { useWorldIdProof, WorldIdCancelledError } from "@/hooks/useWorldIdProof";
import { CLAIM_ACTION, HEIR_REGISTER_SIGNAL } from "@/lib/constants";
import { explainError } from "@/lib/errors";
import { shortAddress } from "./ConnectButton";

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
    <section className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <h2 className="font-bold">Are you an heir?</h2>
      <p className="text-sm text-zinc-500">
        Verify with World ID to see the wills that name you. No wallet is needed.
      </p>
      <div className="flex gap-3">
        <button
          className="rounded border px-3 py-1 disabled:opacity-40"
          disabled={worldId.busy}
          onClick={lookUp}
        >
          {nullifier === null ? "Find wills that name me" : "Verify again"}
        </button>
        {nullifier !== null && (
          <button className="text-sm underline" onClick={forget}>
            Forget
          </button>
        )}
      </div>

      {nullifier !== null &&
        (wills === undefined ? (
          <p className="text-sm">Loading…</p>
        ) : wills.length === 0 ? (
          <p className="text-sm">No wills name this World ID as heir.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {wills.map((w) => (
              <li key={w.id.toString()}>
                <Link
                  className="flex flex-wrap justify-between gap-2 rounded border px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  href={`/will/${w.id}`}
                >
                  <span className="font-medium">Will #{w.id.toString()}</span>
                  <span>{w.phase}</span>
                  <span>{formatEther(w.amount)} ETH</span>
                  <span className="font-mono text-zinc-500">from {shortAddress(w.owner)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ))}

      {(scanError || error) && <p className="text-sm text-red-600">{scanError ?? explainError(error)}</p>}
      {worldId.widget}
    </section>
  );
}
