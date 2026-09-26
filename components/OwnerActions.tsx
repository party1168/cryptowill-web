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
import { Button, Card, CardTitle, Eyebrow, Notice } from "./ui";
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
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Eyebrow>You are the owner</Eyebrow>
        <CardTitle>{will.phase === "Challenge" ? "Stop the claim" : "Check in"}</CardTitle>
      </div>
      <p className="text-sm text-ink-soft">
        {will.phase === "Challenge"
          ? "Your heir has started a claim. Check in now to void it."
          : "Check in with World ID to prove you are alive and restart the timer."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={checkIn}>
          Check in with World ID
        </Button>
        {!confirmingCancel && (
          <Button variant="secondary" disabled={busy} onClick={() => setConfirmingCancel(true)}>
            Cancel will
          </Button>
        )}
      </div>

      {confirmingCancel && (
        <div className="flex flex-col gap-3 rounded-md border border-danger/30 bg-danger-tint p-4 text-sm text-ink">
          <p>
            This ends the will and returns {formatEther(will.amount)} ETH to your wallet. Your heir will no longer be
            able to claim.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={cancel}>
              Yes, cancel the will
            </Button>
            <Button variant="secondary" onClick={() => setConfirmingCancel(false)}>
              Keep it
            </Button>
          </div>
        </div>
      )}

      <TxStatus status={tx.status} />
      {scanError && <Notice tone="error">{scanError}</Notice>}
      {worldId.widget}
    </Card>
  );
}
