"use client";

import { IDKitRequestWidget, orbLegacy, type RpContext } from "@worldcoin/idkit";
import { useCallback, useRef, useState } from "react";
import type { Address } from "viem";
import { config } from "@/lib/config";
import { HEIR_REGISTER_SIGNAL, type WorldIdAction } from "@/lib/constants";
import { toProofArgs, type ProofArgs } from "@/lib/worldid";

/** Only addresses (owner / payout) or the heir-registration marker are ever valid signals. */
export type WorldIdSignal = Address | typeof HEIR_REGISTER_SIGNAL;

type Pending = {
  action: WorldIdAction;
  signal: WorldIdSignal;
  rpContext: RpContext;
  resolve: (args: ProofArgs) => void;
  reject: (err: Error) => void;
};

export class WorldIdCancelledError extends Error {
  constructor() {
    super("已取消 World ID 驗證");
  }
}

/**
 * Promise-style wrapper around IDKitRequestWidget. Render `widget` somewhere in the tree, then
 * `await request(action, signal)`. The resolved proof must be sent immediately — roots expire (TD-006).
 */
export function useWorldIdProof() {
  const [pending, setPending] = useState<Pending | null>(null);
  const settled = useRef(true);

  const request = useCallback(async (action: WorldIdAction, signal: WorldIdSignal) => {
    if (!settled.current) throw new Error("已有一個 World ID 驗證進行中");
    // Fresh RP signature every time: it carries its own expires_at.
    const res = await fetch("/api/rp-signature", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `rp-signature HTTP ${res.status}`);

    settled.current = false;
    return new Promise<ProofArgs>((resolve, reject) => {
      setPending({ action, signal, rpContext: data.rp_context, resolve, reject });
    });
  }, []);

  const settle = useCallback((fn: () => void) => {
    if (settled.current) return;
    settled.current = true;
    fn();
    setPending(null);
  }, []);

  const widget = pending && (
    <IDKitRequestWidget
      key={pending.rpContext.nonce}
      app_id={config.worldId.appId}
      action={pending.action}
      rp_context={pending.rpContext}
      allow_legacy_proofs={true}
      environment={config.worldId.environment}
      preset={orbLegacy({ signal: pending.signal })}
      open={true}
      onOpenChange={(open) => {
        if (!open) settle(() => pending.reject(new WorldIdCancelledError()));
      }}
      onSuccess={(result) =>
        settle(() => {
          try {
            pending.resolve(toProofArgs(result, pending.action, pending.signal));
          } catch (e) {
            pending.reject(e instanceof Error ? e : new Error(String(e)));
          }
        })
      }
      onError={(code) => settle(() => pending.reject(new Error(`World ID 錯誤：${code}`)))}
    />
  );

  return { request, widget, busy: pending !== null };
}
