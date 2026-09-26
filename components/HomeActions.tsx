"use client";

import Link from "next/link";
import { useConnection, useReadContract } from "wagmi";
import { cryptoWillAbi } from "@/lib/abi";
import { config } from "@/lib/config";

/** Sends the connected wallet to its will, or to /create if it has none. */
export function HomeActions() {
  const { address } = useConnection();
  const activeWill = useReadContract({
    address: config.cryptoWill.address,
    abi: cryptoWillAbi,
    functionName: "activeWillOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!address || activeWill.data === undefined) return null;
  const linkClass = "self-start rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black";

  return activeWill.data > 0n ? (
    <Link className={linkClass} href={`/will/${activeWill.data}`}>
      View your will #{activeWill.data.toString()}
    </Link>
  ) : (
    <Link className={linkClass} href="/create">
      Create a will
    </Link>
  );
}
