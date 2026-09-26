"use client";

import { useConnection, useReadContract } from "wagmi";
import { cryptoWillAbi } from "@/lib/abi";
import { config } from "@/lib/config";
import { ButtonLink, Card, CardTitle, Eyebrow } from "./ui";

/** Owner entry point: sends the connected wallet to its will, or to /create if it has none. */
export function HomeActions() {
  const { address } = useConnection();
  const activeWill = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "activeWillOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  let action;
  if (!address) {
    action = <p className="text-sm text-muted">Connect your wallet (top right) to get started.</p>;
  } else if (activeWill.data === undefined) {
    action = <p className="text-sm text-muted">Loading…</p>;
  } else if (activeWill.data > 0n) {
    action = <ButtonLink href={`/will/${activeWill.data}`}>View your will #{activeWill.data.toString()}</ButtonLink>;
  } else {
    action = <ButtonLink href="/create">Create a will</ButtonLink>;
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Eyebrow>For the owner</Eyebrow>
        <CardTitle>Leave your crypto to someone</CardTitle>
      </div>
      <p className="text-sm text-ink-soft">
        Lock funds for an heir you name with their World ID. As long as you keep checking in, nothing happens — and
        you can cancel any time.
      </p>
      <div className="mt-auto">{action}</div>
    </Card>
  );
}
