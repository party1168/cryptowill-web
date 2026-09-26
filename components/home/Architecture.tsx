import { SectionHeading } from "./SectionHeading";

type Box = { x: number; y: number; title: string; sub: string; accent?: boolean };

const W = 200;
const H = 76;
const BOXES: Record<string, Box> = {
  app: { x: 20, y: 132, title: "CryptoWill app", sub: "Next.js · wagmi · IDKit" },
  worldid: { x: 350, y: 20, title: "World ID", sub: "World App · scan & prove" },
  api: { x: 350, y: 244, title: "Signing API", sub: "server-only RP key" },
  contract: { x: 680, y: 80, title: "CryptoWill contract", sub: "World Chain", accent: true },
  router: { x: 680, y: 244, title: "WorldIDRouter", sub: "verifyProof()", accent: true },
};

// [from, to, step, label]: arrows go from the edge of one box to the edge of another.
const ARROWS: { d: string; step: number; lx: number; ly: number }[] = [
  { d: "M 220 160 C 285 160, 285 282, 350 282", step: 1, lx: 285, ly: 230 },
  { d: "M 220 150 C 285 150, 285 58, 350 58", step: 2, lx: 285, ly: 96 },
  { d: "M 220 184 C 450 184, 450 118, 680 118", step: 3, lx: 450, ly: 160 },
  { d: "M 780 156 L 780 244", step: 4, lx: 800, ly: 200 },
];

const STEPS = [
  "The app asks the signing API to sign the World ID request. The RP key never leaves the server.",
  "You scan with World App. It returns a zero-knowledge proof bound to a signal: your wallet (owner) or your payout address (heir).",
  "The app checks the proof matches what the contract expects, simulates the transaction, then your wallet sends it.",
  "CryptoWill checks the World ID matches the one on the will, then asks WorldIDRouter to verify the proof.",
  "Only then does the state change or money move — the contract enforces every rule on its own.",
];

function DiagramBox({ box }: { box: Box }) {
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={W}
        height={H}
        rx={12}
        fill="var(--card)"
        stroke={box.accent ? "var(--brass)" : "var(--line-strong)"}
        strokeWidth={box.accent ? 1.6 : 1.2}
      />
      <text x={box.x + W / 2} y={box.y + 33} textAnchor="middle" className="fill-ink font-display" fontSize={17}>
        {box.title}
      </text>
      <text x={box.x + W / 2} y={box.y + 55} textAnchor="middle" className="fill-muted" fontSize={12}>
        {box.sub}
      </text>
    </g>
  );
}

/** "Under the hood": architecture diagram plus the step-by-step flow of a single action. */
export function Architecture() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading eyebrow="Under the hood" title="From a scan to an on-chain rule">
        Every owner and heir action follows the same path. The browser never decides anything on its own — it only
        carries a proof to a contract that checks it.
      </SectionHeading>

      <div className="overflow-x-auto rounded-xl border border-line bg-paper/60 p-4">
        <svg viewBox="0 0 900 340" className="h-auto w-full min-w-[640px]" role="img" aria-label="CryptoWill architecture">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--brass-deep)" />
            </marker>
          </defs>
          {ARROWS.map((a) => (
            <g key={a.step}>
              <path
                d={a.d}
                fill="none"
                stroke="var(--brass-deep)"
                strokeWidth={1.4}
                markerEnd="url(#arrow)"
                markerStart={a.step === 2 ? "url(#arrow)" : undefined}
              />
              <circle cx={a.lx} cy={a.ly} r={12} fill="var(--ink)" />
              <text x={a.lx} y={a.ly + 4} textAnchor="middle" fontSize={12} className="fill-paper">
                {a.step}
              </text>
            </g>
          ))}
          {Object.entries(BOXES).map(([key, box]) => (
            <DiagramBox key={key} box={box} />
          ))}
        </svg>
      </div>

      <ol className="grid gap-3 md:grid-cols-5">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3 md:flex-col md:gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-paper">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-ink-soft">{step}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-brass-deep uppercase">Owner proof</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Bound to the owner&apos;s <strong className="font-medium text-ink">wallet address</strong>. A proof copied
            from the mempool is useless from any other wallet.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-brass-deep uppercase">Heir proof</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Bound to the <strong className="font-medium text-ink">payout address</strong>. Anyone can relay the claim,
            but no relayer or front-runner can change where the money goes.
          </p>
        </div>
      </div>
    </section>
  );
}
