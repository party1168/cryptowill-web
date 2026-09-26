"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatEther } from "viem";
import { useWill } from "@/hooks/useWill";

// Placeholder until the rest of M3 lands: phase, owner and amount.
export default function WillPage() {
  const { id } = useParams<{ id: string }>();
  const willId = /^\d+$/.test(id) ? BigInt(id) : null;
  const { will } = useWill(willId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-bold">Will #{id}</h1>
      {willId === null || will === null ? (
        <p>No will with this id.</p>
      ) : will ? (
        <div className="flex flex-col gap-1 font-mono text-sm">
          <div>Phase: {will.phase}</div>
          <div>Owner: {will.owner}</div>
          <div>Amount: {formatEther(will.amount)} ETH</div>
        </div>
      ) : (
        <p>Loading…</p>
      )}
    </main>
  );
}
