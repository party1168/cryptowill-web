"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatEther, toHex } from "viem";
import { FinalizeAction } from "@/components/FinalizeAction";
import { HeirClaim } from "@/components/HeirClaim";
import { OwnerActions } from "@/components/OwnerActions";
import { PhaseBanner } from "@/components/PhaseBanner";
import { useWill } from "@/hooks/useWill";
import { formatDuration } from "@/lib/periods";

const formatTime = (unix: number) => new Date(unix * 1000).toLocaleString("en-US", { hour12: false });

export default function WillPage() {
  const { id } = useParams<{ id: string }>();
  const willId = /^\d+$/.test(id) ? BigInt(id) : null;
  const { will, refetch } = useWill(willId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-bold">Will #{id}</h1>
      {willId === null || will === null ? (
        <p>No will with this id.</p>
      ) : will ? (
        <>
          <PhaseBanner will={will} />
          <OwnerActions will={will} onDone={() => refetch()} />
          <HeirClaim will={will} onDone={() => refetch()} />
          <FinalizeAction will={will} onDone={() => refetch()} />
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-zinc-500">Amount</dt>
            <dd>{formatEther(will.amount)} ETH</dd>
            <dt className="text-zinc-500">Owner</dt>
            <dd className="break-all font-mono">{will.owner}</dd>
            <dt className="text-zinc-500">Heir (World ID)</dt>
            <dd className="break-all font-mono text-xs">{toHex(will.heirNullifier, { size: 32 })}</dd>
            <dt className="text-zinc-500">Last check-in</dt>
            <dd>{formatTime(will.lastCheckIn)}</dd>
            <dt className="text-zinc-500">Check-in interval</dt>
            <dd>{formatDuration(will.checkInInterval)}</dd>
            <dt className="text-zinc-500">Grace period</dt>
            <dd>{formatDuration(will.gracePeriod)}</dd>
            <dt className="text-zinc-500">Challenge period</dt>
            <dd>{formatDuration(will.challengePeriod)}</dd>
          </dl>
        </>
      ) : (
        <p>Loading…</p>
      )}
    </main>
  );
}
