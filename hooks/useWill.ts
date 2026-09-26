"use client";

import { zeroAddress, type Address } from "viem";
import { useReadContracts } from "wagmi";
import { cryptoWillAbi } from "@/lib/abi";
import { config } from "@/lib/config";
import { phaseName, type WillPhaseName } from "@/lib/phase";

export type WillData = {
  id: bigint;
  owner: Address;
  ownerNullifier: bigint;
  heirNullifier: bigint;
  amount: bigint;
  /** Unix seconds. */
  lastCheckIn: number;
  checkInInterval: number;
  gracePeriod: number;
  challengePeriod: number;
  claimInitiatedAt: number;
  payoutAddress: Address;
  /** Derived on-chain by currentPhase (TD-009); authoritative. */
  phase: WillPhaseName;
  /** Phase boundaries in unix seconds, for countdowns. */
  graceStartsAt: number;
  claimableAt: number;
  challengeEndsAt: number | null;
};

export const cryptoWillContract = { address: config.cryptoWill.address, abi: cryptoWillAbi } as const;
const contract = cryptoWillContract;

/** Raw return value of the `wills(id)` getter. */
export type WillTuple = readonly [Address, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, Address, number];

/** Turns `wills(id)` + `currentPhase(id)` into WillData; null when the will doesn't exist. */
export function parseWill(id: bigint, tuple: WillTuple, phase: number): WillData | null {
  const [owner, ownerNullifier, heirNullifier, amount, lastCheckIn, interval, grace, challenge, initiatedAt, payout] = tuple;
  if (owner === zeroAddress) return null;
  const last = Number(lastCheckIn);
  const initiated = Number(initiatedAt);
  return {
    id,
    owner,
    ownerNullifier,
    heirNullifier,
    amount,
    lastCheckIn: last,
    checkInInterval: Number(interval),
    gracePeriod: Number(grace),
    challengePeriod: Number(challenge),
    claimInitiatedAt: initiated,
    payoutAddress: payout,
    phase: phaseName(phase) ?? "None",
    graceStartsAt: last + Number(interval),
    claimableAt: last + Number(interval) + Number(grace),
    challengeEndsAt: initiated > 0 ? initiated + Number(challenge) : null,
  };
}

/** Reads a will plus its derived phase, polling so phase changes show up without a reload. */
export function useWill(willId: bigint | null) {
  const query = useReadContracts({
    contracts:
      willId === null
        ? []
        : [
            { ...contract, functionName: "wills", args: [willId] },
            { ...contract, functionName: "currentPhase", args: [willId] },
          ],
    allowFailure: false,
    query: { enabled: willId !== null, refetchInterval: 5_000 },
  });

  let will: WillData | null | undefined; // undefined = loading, null = no such will
  if (willId !== null && query.data) {
    const [tuple, phase] = query.data as unknown as [WillTuple, number];
    will = parseWill(willId, tuple, phase);
  }

  return { will, error: query.error, refetch: query.refetch };
}
