import { config } from "@/lib/config";

export function SiteFooter() {
  const explorer = config.chain.blockExplorers?.default.url;
  return (
    <footer className="mt-auto border-t border-line/80">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted">
        <span>Secured by World ID · Settled on {config.chain.name}</span>
        {explorer && (
          <a
            className="font-mono underline-offset-4 hover:text-ink hover:underline"
            href={`${explorer}/address/${config.cryptoWill.address}`}
            target="_blank"
            rel="noreferrer"
          >
            Contract {config.cryptoWill.address.slice(0, 6)}…{config.cryptoWill.address.slice(-4)}
          </a>
        )}
      </div>
    </footer>
  );
}
