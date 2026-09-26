import type { WillTxStatus } from "@/hooks/useWillTx";
import { config } from "@/lib/config";
import { Notice } from "./ui";

const LABELS: Record<WillTxStatus["step"], string> = {
  idle: "",
  simulating: "Checking the transaction…",
  signing: "Confirm the transaction in your wallet…",
  confirming: "Waiting for confirmation on-chain…",
  success: "Transaction confirmed.",
  error: "",
};

export function TxStatus({ status }: { status: WillTxStatus }) {
  if (status.step === "idle") return null;
  const hash = "hash" in status ? status.hash : undefined;
  const explorer = config.chain.blockExplorers?.default.url;
  const tone = status.step === "error" ? "error" : status.step === "success" ? "success" : "info";

  return (
    <Notice tone={tone}>
      <div className="flex flex-col gap-1">
        <span>{status.step === "error" ? status.message : LABELS[status.step]}</span>
        {hash && explorer && (
          <a
            className="font-mono text-xs break-all underline underline-offset-2 opacity-80"
            href={`${explorer}/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            View transaction {hash.slice(0, 10)}…
          </a>
        )}
      </div>
    </Notice>
  );
}
