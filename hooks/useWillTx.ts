"use client";

import { useCallback, useState } from "react";
import type { ContractFunctionArgs, ContractFunctionName, Hash, TransactionReceipt } from "viem";
import { useConnection, usePublicClient, useWriteContract } from "wagmi";
import { config } from "@/lib/config";
import { cryptoWillAbiWithRouterErrors, explainError } from "@/lib/errors";

type Abi = typeof cryptoWillAbiWithRouterErrors;
type Mutability = "nonpayable" | "payable";
export type WillWriteFunction = ContractFunctionName<Abi, Mutability>;

export type WillTxStatus =
  | { step: "idle" }
  | { step: "simulating" }
  | { step: "signing" }
  | { step: "confirming"; hash: Hash }
  | { step: "success"; hash: Hash }
  | { step: "error"; message: string; hash?: Hash };

/**
 * Sends a CryptoWill transaction: simulate first (so reverts surface before the wallet prompt and
 * before the user pays gas), then sign, then wait for the receipt. Call `send` right after getting a
 * World ID proof — the proof's root expires (TD-006).
 */
export function useWillTx() {
  const { address, chainId } = useConnection();
  const publicClient = usePublicClient();
  const { mutateAsync: writeContract } = useWriteContract();
  const [status, setStatus] = useState<WillTxStatus>({ step: "idle" });

  const send = useCallback(
    async <fn extends WillWriteFunction>(
      functionName: fn,
      args: ContractFunctionArgs<Abi, Mutability, fn>,
      value?: bigint,
    ): Promise<TransactionReceipt> => {
      let hash: Hash | undefined;
      try {
        if (!address || !publicClient) throw new Error("Connect your wallet first.");
        if (chainId !== config.chain.id) throw new Error(`Switch your wallet to ${config.chain.name} first.`);

        const request = {
          address: config.cryptoWill.address,
          abi: cryptoWillAbiWithRouterErrors,
          functionName,
          args,
          value,
          account: address,
        } as never;

        setStatus({ step: "simulating" });
        await publicClient.simulateContract(request);

        setStatus({ step: "signing" });
        hash = await writeContract({ ...(request as object), chainId: config.chain.id } as never);

        setStatus({ step: "confirming", hash });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success") throw new Error("The transaction reverted on-chain.");

        setStatus({ step: "success", hash });
        return receipt;
      } catch (e) {
        setStatus({ step: "error", message: explainError(e), hash });
        throw e;
      }
    },
    [address, chainId, publicClient, writeContract],
  );

  const reset = useCallback(() => setStatus({ step: "idle" }), []);

  return { send, status, reset };
}
