import { SectionHeading } from "./SectionHeading";

const FAQ: { q: string; a: string }[] = [
  {
    q: "What happens if I forget to check in?",
    a: "Nothing is lost right away. After the check-in interval you enter a grace period, and even once your heir starts a claim you have a challenge period to stop it. A single check-in at any point until the challenge period ends puts the will back to Active.",
  },
  {
    q: "Does my heir need a crypto wallet?",
    a: "No wallet or gas is needed to verify. When claiming, your heir only needs an address to receive the funds — the transaction itself can be submitted by anyone, and the payout address is locked into their proof.",
  },
  {
    q: "Could someone else claim my will?",
    a: "Only the World ID you registered as heir can start a claim. The contract checks that the proof's identifier matches the one stored on the will, and World ID's router verifies the proof itself on-chain.",
  },
  {
    q: "What if I lose access to my wallet?",
    a: "Your check-ins are bound to the wallet that created the will, so without it you can no longer check in or cancel — and your heir will eventually inherit. Keep your wallet backed up as you normally would.",
  },
  {
    q: "Can I change my heir or the amount?",
    a: "Cancel the will to get your funds back, then create a new one with the new heir, amount or timing. One wallet can have one active will at a time.",
  },
  {
    q: "Is my identity or my heir's identity public?",
    a: "No names, documents or biometrics ever go on-chain — only anonymous World ID nullifiers scoped to CryptoWill. Note that wills naming the same heir share the same identifier, so it is visible that they have the same heir.",
  },
];

/** Frequently asked questions. */
export function Faq() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading eyebrow="Questions" title="Things people ask" />
      <div className="divide-y divide-line rounded-xl border border-line bg-card">
        {FAQ.map((item) => (
          <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.q}
              <span className="text-brass-deep transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
