"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { cryptoWillAbi } from "@/lib/abi";
import { config } from "@/lib/config";
import { phaseName } from "@/lib/phase";

// Placeholder until M3: shows the will's phase and amount so /create has somewhere to land.
export default function WillPage() {
  const { id } = useParams<{ id: string }>();
  const willId = /^\d+$/.test(id) ? BigInt(id) : null;

  const will = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "wills",
    args: willId !== null ? [willId] : undefined,
    query: { enabled: willId !== null },
  });
  const phase = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "currentPhase",
    args: willId !== null ? [willId] : undefined,
    query: { enabled: willId !== null, refetchInterval: 5_000 },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <Link href="/" className="text-sm underline">
        Home
      </Link>
      <h1 className="text-2xl font-bold">Will #{id}</h1>
      {willId === null ? (
        <p>Invalid will id.</p>
      ) : will.data ? (
        <div className="flex flex-col gap-1 font-mono text-sm">
          <div>Phase: {phaseName(phase.data) ?? "…"}</div>
          <div>Owner: {will.data[0]}</div>
          <div>Amount: {formatEther(will.data[3])} ETH</div>
        </div>
      ) : (
        <p>Loading…</p>
      )}
    </main>
  );
}
