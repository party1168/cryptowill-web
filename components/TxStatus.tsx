import type { WillTxStatus } from "@/hooks/useWillTx";
import { config } from "@/lib/config";

const LABELS: Record<WillTxStatus["step"], string> = {
  idle: "",
  simulating: "Checking the transaction…",
  signing: "Confirm the transaction in your wallet…",
  confirming: "Waiting for confirmation…",
  success: "Transaction confirmed.",
  error: "",
};

export function TxStatus({ status }: { status: WillTxStatus }) {
  if (status.step === "idle") return null;
  const hash = "hash" in status ? status.hash : undefined;
  const explorer = config.chain.blockExplorers?.default.url;

  return (
    <div className="flex flex-col gap-1 text-sm">
      {status.step === "error" ? (
        <p className="text-red-600">{status.message}</p>
      ) : (
        <p>{LABELS[status.step]}</p>
      )}
      {hash && explorer && (
        <a className="break-all font-mono text-xs underline" href={`${explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
          {hash}
        </a>
      )}
    </div>
  );
}
