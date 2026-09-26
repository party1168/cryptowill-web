"use client";

import { useState } from "react";
import { isAddress, toHex, type Address } from "viem";
import { useConnection, usePublicClient, useReadContract } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { useWorldIdProof } from "@/hooks/useWorldIdProof";
import { cryptoWillAbi } from "@/lib/abi";
import { config } from "@/lib/config";
import { ALIVE_ACTION, CLAIM_ACTION, HEIR_REGISTER_SIGNAL } from "@/lib/constants";
import { cryptoWillAbiWithRouterErrors, explainError } from "@/lib/errors";

/**
 * M1 integration console: exercises wallet + World ID + contract wiring end to end.
 * Nothing here sends a transaction — createWill is only simulated (eth_call).
 */
export default function DevPage() {
  const { address, chainId } = useConnection();
  const publicClient = usePublicClient();
  const worldId = useWorldIdProof();
  const onChain = chainId === config.chain.id;

  const nextWillId = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "nextWillId",
  });
  const activeWill = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "activeWillOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const [heirNullifier, setHeirNullifier] = useState<bigint | null>(null);
  const [payout, setPayout] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const append = (line: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-US", { hour12: false })}  ${line}`, ...l]);

  async function run(label: string, fn: () => Promise<void>) {
    append(`${label}: started`);
    try {
      await fn();
    } catch (e) {
      append(`${label}: FAILED — ${explainError(e)}`);
    }
  }

  const registerHeir = () =>
    run("Heir registration", async () => {
      const { nullifierHash } = await worldId.request(CLAIM_ACTION, HEIR_REGISTER_SIGNAL);
      setHeirNullifier(nullifierHash);
      append(`Heir registration: nullifier ${toHex(nullifierHash, { size: 32 })}`);
    });

  const simulateCreateWill = (owner: Address, heir: bigint) =>
    run("Simulate createWill", async () => {
      const { root, nullifierHash, proof } = await worldId.request(ALIVE_ACTION, owner);
      append(`Owner proof ok (signal_hash matches), nullifier ${toHex(nullifierHash, { size: 32 })}`);
      // Simulate right away: the proof's root expires (TD-006).
      const { result } = await publicClient!.simulateContract({
        address: config.cryptoWill.address,
        abi: cryptoWillAbiWithRouterErrors,
        functionName: "createWill",
        args: [root, nullifierHash, proof, heir, 300n, 300n, 300n],
        account: owner,
        value: 1n,
      });
      append(`Simulate createWill: OK — would create willId ${result} (no transaction sent)`);
    });

  const heirClaimProof = (to: Address) =>
    run("Heir claim proof", async () => {
      const { nullifierHash } = await worldId.request(CLAIM_ACTION, to);
      append(`Heir claim proof ok (signal_hash matches payout ${to})`);
      if (heirNullifier !== null) {
        append(
          nullifierHash === heirNullifier
            ? "Heir claim nullifier MATCHES the registered heir nullifier"
            : "Heir claim nullifier DOES NOT match the registered one (different simulator identity?)",
        );
      }
    });

  const busy = worldId.busy;
  const ready = !!address && onChain && !busy;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8 text-sm">
      <h1 className="text-xl font-bold">CryptoWill — dev console</h1>
      <ConnectButton />

      <section className="flex flex-col gap-1 font-mono">
        <div>contract: {config.cryptoWill.address}</div>
        <div>World ID: {config.worldId.appId} ({config.worldId.environment})</div>
        <div>nextWillId: {nextWillId.data?.toString() ?? "…"}</div>
        <div>activeWillOf(me): {address ? (activeWill.data?.toString() ?? "…") : "—"}</div>
      </section>

      <section className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="font-bold">1. Heir registration (use the heir&apos;s simulator identity)</h2>
        <button className="self-start rounded border px-3 py-1 disabled:opacity-40" disabled={busy} onClick={registerHeir}>
          Scan as heir
        </button>
        <div className="break-all font-mono">heirNullifier: {heirNullifier !== null ? toHex(heirNullifier, { size: 32 }) : "—"}</div>
      </section>

      <section className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="font-bold">2. Simulate createWill (use the owner&apos;s simulator identity)</h2>
        <button
          className="self-start rounded border px-3 py-1 disabled:opacity-40"
          disabled={!ready || heirNullifier === null}
          onClick={() => simulateCreateWill(address!, heirNullifier!)}
        >
          Scan as owner &amp; simulate
        </button>
      </section>

      <section className="flex flex-col gap-2 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="font-bold">3. Heir claim proof (heir&apos;s identity, signal = payout address)</h2>
        <input
          className="rounded border px-2 py-1 font-mono dark:bg-zinc-900"
          placeholder="payout address 0x…"
          value={payout}
          onChange={(e) => setPayout(e.target.value.trim())}
        />
        <button
          className="self-start rounded border px-3 py-1 disabled:opacity-40"
          disabled={busy || !isAddress(payout)}
          onClick={() => heirClaimProof(payout as Address)}
        >
          Scan as heir
        </button>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-bold">Log</h2>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded bg-zinc-100 p-3 font-mono dark:bg-zinc-900">
          {log.join("\n") || "—"}
        </pre>
      </section>

      {worldId.widget}
    </main>
  );
}
