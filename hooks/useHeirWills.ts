"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { cryptoWillContract, parseWill, type WillData, type WillTuple } from "./useWill";

/**
 * Every will naming this heir, looked up by World ID nullifier via the contract's heir index
 * (the heir has no address on-chain, so activeWillOf can't find them). Newest first.
 */
export function useHeirWills(heirNullifier: bigint | null) {
  const ids = useReadContract({
    ...cryptoWillContract,
    functionName: "willIdsOfHeir",
    args: heirNullifier !== null ? [heirNullifier] : undefined,
    query: { enabled: heirNullifier !== null },
  });

  const willIds = ids.data ?? [];
  const details = useReadContracts({
    contracts: willIds.flatMap((id) => [
      { ...cryptoWillContract, functionName: "wills", args: [id] } as const,
      { ...cryptoWillContract, functionName: "currentPhase", args: [id] } as const,
    ]),
    allowFailure: false,
    query: { enabled: willIds.length > 0, refetchInterval: 5_000 },
  });

  let wills: WillData[] | undefined;
  if (heirNullifier !== null && ids.data) {
    if (willIds.length === 0) {
      wills = [];
    } else if (details.data) {
      const data = details.data as unknown[];
      wills = willIds
        .map((id, i) => parseWill(id, data[2 * i] as WillTuple, data[2 * i + 1] as number))
        .filter((w): w is WillData => w !== null)
        .reverse();
    }
  }

  return { wills, error: ids.error ?? details.error };
}
