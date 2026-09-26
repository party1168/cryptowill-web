"use client";

import type { EIP1193Provider } from "viem";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { config } from "@/lib/config";
import { explainError } from "@/lib/errors";
import { Button } from "./ui";

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectButton() {
  const { address, chainId, connector, status } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();

  const error = connect.error ?? switchChain.error ?? disconnect.error;

  // wagmi only waits 100ms for wallet_revokePermissions, which MetaMask usually misses, so the site
  // stays authorized in the wallet. Revoke explicitly so the next Connect prompts for an account again
  // (needed to switch between owner / heir / relayer). Wallets without the method just skip this.
  async function disconnectAndRevoke() {
    try {
      const provider = (await connector?.getProvider()) as EIP1193Provider | undefined;
      await provider?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
    } catch {}
    disconnect.mutate();
  }

  let control;
  if (status === "connecting" || status === "reconnecting") {
    control = (
      <Button variant="secondary" disabled>
        Connecting…
      </Button>
    );
  } else if (!address) {
    const injected = connectors[0];
    control = (
      <Button disabled={!injected || connect.isPending} onClick={() => connect.mutate({ connector: injected })}>
        Connect wallet
      </Button>
    );
  } else if (chainId !== config.chain.id) {
    control = (
      <Button
        variant="secondary"
        className="border-warning/40 text-warning"
        disabled={switchChain.isPending}
        onClick={() => switchChain.mutate({ chainId: config.chain.id })}
      >
        Switch to {config.chain.name}
      </Button>
    );
  } else {
    control = (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-sm">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          {shortAddress(address)}
        </span>
        <Button variant="ghost" onClick={disconnectAndRevoke}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {control}
      {error && <p className="max-w-xs text-right text-xs text-danger">{explainError(error)}</p>}
    </div>
  );
}
