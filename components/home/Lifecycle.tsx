import type { WillPhaseName } from "@/lib/phase";
import { PhaseBadge } from "../PhaseBadge";
import { SectionHeading } from "./SectionHeading";

type Stage = {
  phase: WillPhaseName;
  label?: string;
  timer: string;
  body: string;
  owner: string;
  heir: string;
};

const STAGES: Stage[] = [
  {
    phase: "Active",
    timer: "Check-in interval",
    body: "Funds are locked. You prove you are alive with World ID on your own schedule.",
    owner: "Check in · Cancel",
    heir: "Nothing to do",
  },
  {
    phase: "Grace",
    timer: "Grace period",
    body: "You missed a check-in. A buffer for holidays, travel or a lost phone.",
    owner: "Check in · Cancel",
    heir: "Waits",
  },
  {
    phase: "Claimable",
    timer: "Until someone acts",
    body: "Your heir verifies with World ID and names a payout address, locked into their proof.",
    owner: "Check in · Cancel",
    heir: "Start a claim",
  },
  {
    phase: "Challenge",
    timer: "Challenge period",
    body: "A last safeguard: if you are still here, a single check-in voids the claim.",
    owner: "Check in voids it",
    heir: "Waits",
  },
  {
    phase: "Claimed",
    label: "Paid out",
    timer: "Final",
    body: "Anyone can finalize. The funds go to the heir's payout address — no one can redirect them.",
    owner: "—",
    heir: "Receives funds",
  },
];

/** "The life of a will": the five phases, who can act in each, and the check-in loop back to Active. */
export function Lifecycle() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading eyebrow="The life of a will" title="Five phases, enforced on-chain">
        Nothing is stored as “overdue”: the contract derives the phase from your last check-in and the three periods
        you choose, so there is no keeper to trust and nothing to trigger by hand.
      </SectionHeading>

      <div className="relative">
        {/* Check-in loop: from any of the first four phases back to Active (desktop only). */}
        <div className="pointer-events-none hidden md:block" aria-hidden>
          <svg viewBox="0 0 1000 56" preserveAspectRatio="none" className="h-14 w-full overflow-visible">
            <path
              d="M 740 54 C 740 6, 740 6, 690 6 L 150 6 C 100 6, 100 6, 100 44"
              fill="none"
              stroke="var(--brass)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              vectorEffect="non-scaling-stroke"
            />
            <path d="M 93 38 L 100 50 L 107 38" fill="none" stroke="var(--brass)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-3 text-xs font-medium text-brass-deep">
            ↺ Any check-in resets the clock back to Active
          </p>
        </div>

        <p className="mb-4 text-sm font-medium text-brass-deep md:hidden">
          ↺ Any check-in resets the clock back to Active.
        </p>
        <ol className="grid gap-4 md:grid-cols-5 md:gap-3">
          {STAGES.map((s, i) => (
            <li key={s.phase} className="relative flex flex-col gap-3 rounded-xl border border-line bg-card p-4">
              {i < STAGES.length - 1 && (
                <span
                  className="absolute top-7 -right-3 z-10 hidden h-px w-3 bg-line-strong md:block"
                  aria-hidden
                />
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-lg text-brass">{String(i + 1).padStart(2, "0")}</span>
                <PhaseBadge phase={s.phase} label={s.label} />
              </div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">{s.timer}</p>
              <p className="text-sm leading-relaxed text-ink-soft">{s.body}</p>
              <dl className="mt-auto flex flex-col gap-1 border-t border-line pt-3 text-xs">
                <div className="flex justify-between gap-2 md:flex-col md:gap-0">
                  <dt className="text-muted">Owner</dt>
                  <dd className="text-right font-medium md:text-left">{s.owner}</dd>
                </div>
                <div className="flex justify-between gap-2 md:flex-col md:gap-0">
                  <dt className="text-muted">Heir</dt>
                  <dd className="text-right font-medium md:text-left">{s.heir}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-sm text-muted">
        The owner can cancel and withdraw at any point before the challenge period ends. After that, the claim can no
        longer be stopped.
      </p>
    </section>
  );
}
