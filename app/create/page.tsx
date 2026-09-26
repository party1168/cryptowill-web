"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatEther, parseEther, parseEventLogs, toHex } from "viem";
import { useBalance, useConnection, useReadContract } from "wagmi";
import { TxStatus } from "@/components/TxStatus";
import { StepCard } from "@/components/StepCard";
import { Button, Eyebrow, Notice, Title } from "@/components/ui";
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
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-3">
        <Eyebrow>New will</Eyebrow>
        <Title>Create a will</Title>
        <p className="text-ink-soft">
          Three steps: your heir verifies, you set the terms, then you verify yourself and lock the funds.
        </p>
      </div>

      {!address ? (
        <Notice>Connect your wallet (top right) to create a will.</Notice>
      ) : existingWillId ? (
        <Notice>
          This wallet already has an active will.{" "}
          <Link className="font-medium underline underline-offset-2" href={`/will/${existingWillId}`}>
            View will #{existingWillId.toString()}
          </Link>
        </Notice>
      ) : (
        <>
          <StepCard
            n={1}
            title="Register your heir"
            done={heirNullifier !== null}
            description="Hand the device to your heir so they can verify with their own World ID. Only an anonymous identifier is stored — they prove the same identity later to claim."
          >
            {heirNullifier !== null && (
              <p className="text-xs text-muted">
                Heir ID <span className="font-mono break-all text-ink-soft">{toHex(heirNullifier, { size: 32 })}</span>
              </p>
            )}
            <div>
              <Button variant={heirNullifier === null ? "primary" : "secondary"} disabled={busy} onClick={registerHeir}>
                {heirNullifier === null ? "Heir: verify with World ID" : "Register a different heir"}
              </Button>
            </div>
          </StepCard>

          <StepCard n={2} title="Set the terms" done={amountWei !== null && heirNullifier !== null}>
            <WillParamsForm amount={amount} onAmountChange={setAmount} periods={periods} onPeriodsChange={setPeriods} />
            {balance.data && (
              <p className="text-xs text-muted">Wallet balance: {formatEther(balance.data.value)} ETH</p>
            )}
          </StepCard>

          <StepCard
            n={3}
            title="Verify yourself and create"
            description="Verify with your own World ID. The transaction is sent right after, so keep your wallet open."
          >
            <div>
              <Button disabled={!!blocker || busy} onClick={createWill}>
                Verify &amp; create will
              </Button>
            </div>
            {blocker && <p className="text-sm text-muted">{blocker}</p>}
            <TxStatus status={tx.status} />
          </StepCard>

          {scanError && <Notice tone="error">{scanError}</Notice>}
        </>
      )}

      {worldId.widget}
    </main>
  );
}
