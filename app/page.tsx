import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { HomeActions } from "@/components/HomeActions";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">CryptoWill</h1>
      <ConnectButton />
      <HomeActions />
      <Link href="/dev" className="text-sm underline">
        Dev console →
      </Link>
    </main>
  );
}
