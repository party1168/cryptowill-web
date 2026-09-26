import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { HeirLookup } from "@/components/HeirLookup";
import { HomeActions } from "@/components/HomeActions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">CryptoWill</h1>

      <section className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
        <h2 className="font-bold">Your will</h2>
        <ConnectButton />
        <HomeActions />
      </section>

      <HeirLookup />

      <Link href="/dev" className="text-sm underline">
        Dev console →
      </Link>
    </main>
  );
}
