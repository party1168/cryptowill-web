import { HeirLookup } from "@/components/HeirLookup";
import { HomeActions } from "@/components/HomeActions";
import { Eyebrow, Title } from "@/components/ui";

const STEPS = [
  {
    title: "Name your heir",
    body: "Your heir verifies once with World ID. Only an anonymous identifier is stored on-chain — no address, no name.",
  },
  {
    title: "Check in to stay in control",
    body: "Prove you are alive with World ID on your own schedule. Every check-in restarts the timer.",
  },
  {
    title: "If you stop, they inherit",
    body: "After a missed check-in and a grace period, your heir can claim. You still get a challenge window to stop it.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16">
      <section className="flex max-w-2xl flex-col gap-5">
        <Eyebrow>Self-custody inheritance</Eyebrow>
        <Title className="text-5xl">
          Your crypto, passed on —<br className="hidden md:block" />{" "}
          <em className="text-brass-deep">only if you&apos;re gone.</em>
        </Title>
        <p className="text-lg leading-relaxed text-ink-soft">
          CryptoWill is a dead man&apos;s switch secured by World ID. No custodian, no lawyer, no seed phrase handed
          over — just proof that a real person is still here.
        </p>
      </section>

      <section className="grid items-start gap-6 md:grid-cols-2">
        <HomeActions />
        <HeirLookup />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-medium">How it works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2 border-t border-line-strong pt-4">
              <span className="font-display text-3xl text-brass">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-medium">{step.title}</span>
              <span className="text-sm leading-relaxed text-ink-soft">{step.body}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
