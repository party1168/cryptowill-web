"use client";

import { useState } from "react";
import { isAddress, zeroAddress, type Address } from "viem";
import { useConnection } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import type { WillData } from "@/hooks/useWill";
import { useWillTx } from "@/hooks/useWillTx";
import { useWorldIdProof, WorldIdCancelledError } from "@/hooks/useWorldIdProof";
import { CLAIM_ACTION } from "@/lib/constants";
import { explainError } from "@/lib/errors";

/**
 * Heir starts a claim. The proof's signal is the payout address, so whoever relays the transaction
 * (the connected wallet — any wallet) cannot redirect the funds (TD-007).
 */
export function HeirClaim({ will, onDone }: { will: WillData; onDone: () => void }) {
  const { address } = useConnection();
  const worldId = useWorldIdProof();
  const tx = useWillTx();
  const [payoutInput, setPayoutInput] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  if (will.phase !== "Claimable") return null;

  // Default to the connected wallet until the heir types something else.
  const payout = payoutInput ?? address ?? "";
  const payoutValid = isAddress(payout) && payout !== zeroAddress;
  const busy = worldId.busy || ["simulating", "signing", "confirming"].includes(tx.status.step);

  async function claim() {
    if (!payoutValid) return;
    setScanError(null);
    tx.reset();
    let proof;
    try {
      proof = await worldId.request(CLAIM_ACTION, payout as Address);
    } catch (e) {
      if (!(e instanceof WorldIdCancelledError)) setScanError(explainError(e));
      return;
    }
    if (proof.nullifierHash !== will.heirNullifier) {
      setScanError("This World ID is not the heir named in this will.");
      return;
    }
    try {
      // Send immediately: the proof's root expires (TD-006).
      await tx.send("initiateClaim", [will.id, payout as Address, proof.root, proof.nullifierHash, proof.proof]);
      onDone();
    } catch {
      // TxStatus shows the error.
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <h2 className="font-bold">For the heir: start a claim</h2>
      <p className="text-sm text-zinc-500">
        Verify with the World ID named as heir. After the challenge period, the funds go to the payout address below
        — it is locked into your proof, so make sure you control it.
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Payout address</span>
        <input
          className="rounded border px-2 py-1 font-mono text-sm dark:bg-zinc-900"
          placeholder="0x…"
          value={payout}
          onChange={(e) => setPayoutInput(e.target.value.trim())}
        />
      </label>
      <button
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
        disabled={!address || !payoutValid || busy}
        onClick={claim}
      >
        Verify as heir &amp; claim
      </button>
      {!address && (
        <p className="text-sm text-zinc-500">
          Connect any wallet to submit the transaction — it can be someone else&apos;s, the funds still go to your
          payout address.
        </p>
      )}
      {address && payout !== "" && !payoutValid && <p className="text-sm text-red-600">Enter a valid address.</p>}
      <TxStatus status={tx.status} />
      {scanError && <p className="text-sm text-red-600">{scanError}</p>}
      {worldId.widget}
    </section>
  );
}
