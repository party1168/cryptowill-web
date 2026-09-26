"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatEther, parseEther, parseEventLogs, toHex } from "viem";
import { useBalance, useConnection, useReadContract } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { TxStatus } from "@/components/TxStatus";
import { WillParamsForm } from "@/components/WillParamsForm";
import { useWillTx } from "@/hooks/useWillTx";
import { useWorldIdProof, WorldIdCancelledError } from "@/hooks/useWorldIdProof";
import { cryptoWillAbi } from "@/lib/abi";
import { config } from "@/lib/config";
import { ALIVE_ACTION, CLAIM_ACTION, HEIR_REGISTER_SIGNAL } from "@/lib/constants";
import { explainError } from "@/lib/errors";
import { PERIOD_PRESETS, type Periods } from "@/lib/periods";

function parseAmount(amount: string): bigint | null {
  try {
    const wei = parseEther(amount);
    return wei > 0n ? wei : null;
  } catch {
    return null;
  }
}

export default function CreatePage() {
  const router = useRouter();
  const { address, chainId } = useConnection();
  const worldId = useWorldIdProof();
  const tx = useWillTx();

  const balance = useBalance({ address, query: { enabled: !!address } });
  const activeWill = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "activeWillOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const [heirNullifier, setHeirNullifier] = useState<bigint | null>(null);
  const [amount, setAmount] = useState("0.001");
  const [periods, setPeriods] = useState<Periods>({ ...PERIOD_PRESETS.demo.periods });
  const [scanError, setScanError] = useState<string | null>(null);

  const amountWei = parseAmount(amount);
  const existingWillId = activeWill.data && activeWill.data > 0n ? activeWill.data : null;

  // Everything checkable before the owner scans, so a scan is never wasted on a doomed transaction.
  const blocker = !address
    ? "Connect your wallet."
    : chainId !== config.chain.id
      ? `Switch your wallet to ${config.chain.name}.`
      : heirNullifier === null
        ? "Register your heir first."
        : amountWei === null
          ? "Enter an amount greater than 0."
          : Object.values(periods).some((s) => s <= 0)
            ? "All three periods must be greater than 0."
            : balance.data && balance.data.value < amountWei
              ? "Your wallet balance is too low for this amount."
              : null;

  const busy = worldId.busy || ["simulating", "signing", "confirming"].includes(tx.status.step);

  async function registerHeir() {
    setScanError(null);
    try {
      const { nullifierHash } = await worldId.request(CLAIM_ACTION, HEIR_REGISTER_SIGNAL);
      setHeirNullifier(nullifierHash);
    } catch (e) {
      if (!(e instanceof WorldIdCancelledError)) setScanError(explainError(e));
    }
  }

  async function createWill() {
    if (blocker || !address || heirNullifier === null || amountWei === null) return;
    setScanError(null);
    tx.reset();
    let proof;
    try {
      proof = await worldId.request(ALIVE_ACTION, address);
    } catch (e) {
      if (!(e instanceof WorldIdCancelledError)) setScanError(explainError(e));
      return;
    }
    try {
      // Send immediately after the scan: the proof's root expires (TD-006).
      const receipt = await tx.send(
        "createWill",
        [
          proof.root,
          proof.nullifierHash,
          proof.proof,
          heirNullifier,
          BigInt(periods.checkInInterval),
          BigInt(periods.gracePeriod),
          BigInt(periods.challengePeriod),
        ],
        amountWei,
      );
      const [created] = parseEventLogs({ abi: cryptoWillAbi, eventName: "WillCreated", logs: receipt.logs });
      router.push(`/will/${created.args.willId}`);
    } catch {
      // TxStatus already shows the error.
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create a will</h1>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </div>
      <ConnectButton />

      {existingWillId ? (
        <p>
          This wallet already has an active will.{" "}
          <Link className="underline" href={`/will/${existingWillId}`}>
            View will #{existingWillId.toString()}
          </Link>
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="font-bold">1. Register your heir</h2>
            <p className="text-sm text-zinc-500">
              Your heir scans with their own World ID. Only their anonymous identifier is stored — they will prove
              the same identity later to claim.
            </p>
            {heirNullifier !== null && (
              <p className="break-all font-mono text-xs">Heir: {toHex(heirNullifier, { size: 32 })}</p>
            )}
            <button
              className="self-start rounded border px-3 py-1 disabled:opacity-40"
              disabled={busy}
              onClick={registerHeir}
            >
              {heirNullifier === null ? "Heir: verify with World ID" : "Register a different heir"}
            </button>
          </section>

          <section className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="font-bold">2. Set the terms</h2>
            <WillParamsForm amount={amount} onAmountChange={setAmount} periods={periods} onPeriodsChange={setPeriods} />
            {balance.data && (
              <p className="text-xs text-zinc-500">Wallet balance: {formatEther(balance.data.value)} ETH</p>
            )}
          </section>

          <section className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="font-bold">3. Verify yourself and create</h2>
            <p className="text-sm text-zinc-500">
              Scan with your own World ID. The transaction is sent right after, so keep your wallet open.
            </p>
            <button
              className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-40 dark:bg-white dark:text-black"
              disabled={!!blocker || busy}
              onClick={createWill}
            >
              Verify &amp; create will
            </button>
            {blocker && <p className="text-sm text-zinc-500">{blocker}</p>}
            <TxStatus status={tx.status} />
          </section>

          {scanError && <p className="text-sm text-red-600">{scanError}</p>}
        </>
      )}

      {worldId.widget}
    </main>
  );
}
