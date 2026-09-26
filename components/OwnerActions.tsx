"use client";

import { useState } from "react";
import { formatEther, isAddressEqual } from "viem";
import { useConnection } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import type { WillData } from "@/hooks/useWill";
import { useWillTx } from "@/hooks/useWillTx";
import { useWorldIdProof, WorldIdCancelledError } from "@/hooks/useWorldIdProof";
import { ALIVE_ACTION } from "@/lib/constants";
import { explainError } from "@/lib/errors";
import type { ProofArgs } from "@/lib/worldid";

// TD-009: the owner can check in (or cancel) through every phase until the challenge period ends.
const OWNER_PHASES: WillData["phase"][] = ["Active", "Grace", "Claimable", "Challenge"];

export function OwnerActions({ will, onDone }: { will: WillData; onDone: () => void }) {
  const { address } = useConnection();
  const worldId = useWorldIdProof();
  const tx = useWillTx();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  if (!address || !isAddressEqual(address, will.owner) || !OWNER_PHASES.includes(will.phase)) return null;

  const busy = worldId.busy || ["simulating", "signing", "confirming"].includes(tx.status.step);

  /** Scan as the owner, check it's the identity on this will, then send immediately (TD-006). */
  async function scanAndSend(send: (proof: ProofArgs) => Promise<unknown>) {
    setScanError(null);
    tx.reset();
    let proof: ProofArgs;
    try {
      proof = await worldId.request(ALIVE_ACTION, address!);
    } catch (e) {
      if (!(e instanceof WorldIdCancelledError)) setScanError(explainError(e));
      return;
    }
    if (proof.nullifierHash !== will.ownerNullifier) {
      setScanError("This World ID is not the one that created this will.");
      return;
    }
    try {
      await send(proof);
      onDone();
    } catch {
      // TxStatus shows the error.
    }
  }

  const checkIn = () =>
    scanAndSend((p) => tx.send("checkIn", [will.id, p.root, p.nullifierHash, p.proof]));

  const cancel = () => {
    setConfirmingCancel(false);
    return scanAndSend((p) => tx.send("cancel", [will.id, p.root, p.nullifierHash, p.proof]));
  };

  return (
    <section className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <h2 className="font-bold">You are the owner</h2>
      <p className="text-sm text-zinc-500">
        {will.phase === "Challenge"
          ? "Your heir has started a claim. Check in now to void it."
          : "Check in with World ID to prove you are alive and restart the timer."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
          disabled={busy}
          onClick={checkIn}
        >
          Check in
        </button>
        {!confirmingCancel && (
          <button className="rounded border px-4 py-2 disabled:opacity-40" disabled={busy} onClick={() => setConfirmingCancel(true)}>
            Cancel will
          </button>
        )}
      </div>

      {confirmingCancel && (
        <div className="flex flex-col gap-2 rounded bg-zinc-100 p-3 text-sm dark:bg-zinc-900">
          <p>
            This ends the will and returns {formatEther(will.amount)} ETH to your wallet. Your heir will no longer be
            able to claim.
          </p>
          <div className="flex gap-2">
            <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={cancel}>
              Yes, cancel the will
            </button>
            <button className="rounded border px-3 py-1" onClick={() => setConfirmingCancel(false)}>
              Keep it
            </button>
          </div>
        </div>
      )}

      <TxStatus status={tx.status} />
      {scanError && <p className="text-sm text-red-600">{scanError}</p>}
      {worldId.widget}
    </section>
  );
}
