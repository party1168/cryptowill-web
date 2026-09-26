"use client";

import { formatEther } from "viem";
import { useConnection } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import type { WillData } from "@/hooks/useWill";
import { useWillTx } from "@/hooks/useWillTx";
import { shortAddress } from "./ConnectButton";

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
    <section className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <h2 className="font-bold">Finalize the payout</h2>
      <p className="text-sm text-zinc-500">
        Sends {formatEther(will.amount)} ETH to {shortAddress(will.payoutAddress)}. Anyone can submit this.
      </p>
      <button
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
        disabled={!address || busy}
        onClick={finalize}
      >
        Finalize
      </button>
      {!address && <p className="text-sm text-zinc-500">Connect a wallet to submit the transaction.</p>}
      <TxStatus status={tx.status} />
    </section>
  );
}
