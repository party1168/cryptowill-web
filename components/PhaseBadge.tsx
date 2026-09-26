import type { WillPhaseName } from "@/lib/phase";

const STYLES: Record<WillPhaseName, string> = {
  None: "border-line text-muted",
  Active: "border-success/30 bg-success-tint text-success",
  Grace: "border-warning/30 bg-warning-tint text-warning",
  Claimable: "border-brass/40 bg-brass-tint text-brass-deep",
  Challenge: "border-danger/30 bg-danger-tint text-danger",
  Finalizable: "border-ink/20 bg-ink text-paper",
  Claimed: "border-line bg-paper text-muted",
  Cancelled: "border-line bg-paper text-muted",
};

export function PhaseBadge({ phase, label }: { phase: WillPhaseName; label?: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[phase]}`}>
      {label ?? phase}
    </span>
  );
}
