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
import { Button, Card, CardTitle, Eyebrow, Field, inputClass, Notice } from "./ui";

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
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Eyebrow>For the heir</Eyebrow>
        <CardTitle>Start a claim</CardTitle>
      </div>
      <p className="text-sm text-ink-soft">
        Verify with the World ID named as heir. After the challenge period, the funds go to the payout address below
        — it is locked into your proof, so make sure you control it.
      </p>
      <Field label="Payout address">
        <input
          className={`${inputClass} font-mono`}
          placeholder="0x…"
          value={payout}
          onChange={(e) => setPayoutInput(e.target.value.trim())}
        />
      </Field>
      <div>
        <Button disabled={!address || !payoutValid || busy} onClick={claim}>
          Verify as heir &amp; claim
        </Button>
      </div>
      {!address && (
        <p className="text-sm text-muted">
          Connect any wallet to submit the transaction — it can be someone else&apos;s, the funds still go to your
          payout address.
        </p>
      )}
      {address && payout !== "" && !payoutValid && <Notice tone="error">Enter a valid address.</Notice>}
      <TxStatus status={tx.status} />
      {scanError && <Notice tone="error">{scanError}</Notice>}
      {worldId.widget}
    </Card>
  );
}
