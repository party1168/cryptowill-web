"use client";

import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { config } from "@/lib/config";
import { explainError } from "@/lib/errors";

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const buttonClass =
  "rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-black";

export function ConnectButton() {
  const { address, chainId, status } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();

  const error = connect.error ?? switchChain.error ?? disconnect.error;

  if (status === "connecting" || status === "reconnecting") {
    return <button className={buttonClass} disabled>Connecting…</button>;
  }

  if (!address) {
    const injected = connectors[0];
    return (
      <div className="flex flex-col gap-2">
        <button
          className={buttonClass}
          disabled={!injected || connect.isPending}
          onClick={() => connect.mutate({ connector: injected })}
        >
          Connect Wallet
        </button>
        {error && <p className="text-sm text-red-600">{explainError(error)}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm">{shortAddress(address)}</span>
        {chainId !== config.chain.id && (
          <button
            className={buttonClass}
            disabled={switchChain.isPending}
            onClick={() => switchChain.mutate({ chainId: config.chain.id })}
          >
            Switch to {config.chain.name}
          </button>
        )}
        <button className="text-sm underline" onClick={() => disconnect.mutate()}>
          Disconnect
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{explainError(error)}</p>}
    </div>
  );
}
