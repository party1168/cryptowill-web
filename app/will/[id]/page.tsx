"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { formatEther, toHex } from "viem";
import { FinalizeAction } from "@/components/FinalizeAction";
import { HeirClaim } from "@/components/HeirClaim";
import { OwnerActions } from "@/components/OwnerActions";
import { PhaseBanner } from "@/components/PhaseBanner";
import { Card, CardTitle, Eyebrow, Notice, Title } from "@/components/ui";
import { useWill } from "@/hooks/useWill";
import { formatDuration } from "@/lib/periods";

const formatTime = (unix: number) => new Date(unix * 1000).toLocaleString("en-US", { hour12: false });

export default function WillPage() {
  const { id } = useParams<{ id: string }>();
  const willId = /^\d+$/.test(id) ? BigInt(id) : null;
  const { will, refetch } = useWill(willId);

  const rows: [string, ReactNode][] = will
    ? [
        ["Owner", <span key="o" className="font-mono break-all">{will.owner}</span>],
        ["Heir (World ID)", <span key="h" className="font-mono text-xs break-all">{toHex(will.heirNullifier, { size: 32 })}</span>],
        ["Last check-in", formatTime(will.lastCheckIn)],
        ["Check-in interval", formatDuration(will.checkInInterval)],
        ["Grace period", formatDuration(will.gracePeriod)],
        ["Challenge period", formatDuration(will.challengePeriod)],
      ]
    : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <Link href="/" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
        ← Home
      </Link>

      {willId === null || will === null ? (
        <Notice>No will with this id.</Notice>
      ) : !will ? (
        <p className="text-muted">Loading will…</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Eyebrow>Will #{id}</Eyebrow>
            <Title>
              {/* The contract zeroes `amount` on payout / cancel, so show the outcome instead of "0 ETH". */}
              {will.phase === "Claimed" ? (
                "Paid out"
              ) : will.phase === "Cancelled" ? (
                "Cancelled"
              ) : (
                <>
                  {formatEther(will.amount)} <span className="text-brass-deep">ETH</span>
                </>
              )}
            </Title>
            <p className="text-sm text-muted">
              {will.phase === "Claimed" || will.phase === "Cancelled" ? "Settled" : "Held in the contract"} ·
              owner {will.owner.slice(0, 6)}…{will.owner.slice(-4)}
            </p>
          </div>

          <PhaseBanner will={will} />
          <OwnerActions will={will} onDone={() => refetch()} />
          <HeirClaim will={will} onDone={() => refetch()} />
          <FinalizeAction will={will} onDone={() => refetch()} />

          <Card className="flex flex-col gap-4">
            <CardTitle>Terms</CardTitle>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[max-content_1fr]">
              {rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </>
      )}
    </main>
  );
}
