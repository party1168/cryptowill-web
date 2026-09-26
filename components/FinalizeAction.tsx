"use client";

import { formatEther } from "viem";
import { useConnection } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import type { WillData } from "@/hooks/useWill";
import { useWillTx } from "@/hooks/useWillTx";
import { shortAddress } from "./ConnectButton";
import { Button, Card, CardTitle, Eyebrow } from "./ui";

/** Anyone may finalize once the challenge period is over; no World ID proof needed (TD-009). */
export function FinalizeAction({ will, onDone }: { will: WillData; onDone: () => void }) {
  const { address } = useConnection();
  const tx = useWillTx();

  if (will.phase !== "Finalizable") return null;
  const busy = ["simulating", "signing", "confirming"].includes(tx.status.step);

  async function finalize() {
    tx.reset();
    try {
      await tx.send("finalizeClaim", [will.id]);
      onDone();
    } catch {
      // TxStatus shows the error.
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Eyebrow>Anyone can do this</Eyebrow>
        <CardTitle>Finalize the payout</CardTitle>
      </div>
      <p className="text-sm text-ink-soft">
        Sends {formatEther(will.amount)} ETH to {shortAddress(will.payoutAddress)}..
      </p>
      <div>
        <Button disabled={!address || busy} onClick={finalize}>
          Finalize payout
        </Button>
      </div>
      {!address && <p className="text-sm text-muted">Connect a wallet to submit the transaction.</p>}
      <TxStatus status={tx.status} />
    </Card>
  );
}
