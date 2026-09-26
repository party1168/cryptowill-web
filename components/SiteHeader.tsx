import Link from "next/link";
import { ConnectButton } from "./ConnectButton";

export function SiteHeader() {
  return (
    <header className="border-b border-line/80 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl text-brass" aria-hidden>
            ❖
          </span>
          <span className="font-display text-xl font-medium tracking-tight">CryptoWill</span>
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}
