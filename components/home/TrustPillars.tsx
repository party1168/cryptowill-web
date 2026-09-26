import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

const icon = "h-6 w-6 stroke-brass-deep";
const stroke = { fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const PILLARS: { icon: ReactNode; title: string; body: string; detail: string }[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
        <path d="M3 12h4l2-5 4 10 2-5h6" />
      </svg>
    ),
    title: "Liveness, not a password",
    body: "Checking in means proving you are a unique, living person with World ID. Every check-in and cancel needs your World ID proof, and the proof is bound to your wallet address — it can't be used from anyone else's wallet.",
    detail: "Proof signal = owner wallet address",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5" />
        <path d="M3 3l18 18" />
      </svg>
    ),
    title: "An heir without an address",
    body: "Your heir is stored only as an anonymous World ID nullifier — no name, no wallet, nothing that links to their other apps. They choose where the money goes only when they claim.",
    detail: "On-chain: one nullifier, scoped to CryptoWill",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
        <rect x="5" y="10.5" width="14" height="10" rx="2" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        <path d="M12 14.5v2.5" />
      </svg>
    ),
    title: "No custodian, no keeper",
    body: "The funds sit in a smart contract, not with a company or a lawyer. The rules are code: no admin key, no upgrade path, and the phase is derived from timestamps, so nobody has to trigger anything.",
    detail: "Anyone can submit the final payout",
  },
];

/** "Why you can trust it": the three properties that make the switch safe. */
export function TrustPillars() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading eyebrow="Why you can trust it" title="Proof of life, not proof of password">
        A normal dead man&apos;s switch trusts whoever holds a key. CryptoWill asks for something a thief can&apos;t
        fake: a real human proving they are still here.
      </SectionHeading>
      <ul className="grid gap-4 md:grid-cols-3">
        {PILLARS.map((p) => (
          <li key={p.title} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass-tint">{p.icon}</span>
            <h3 className="font-display text-lg font-medium">{p.title}</h3>
            <p className="text-sm leading-relaxed text-ink-soft">{p.body}</p>
            <p className="mt-auto border-t border-line pt-3 font-mono text-xs text-muted">{p.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
