import { isAddress, type Address } from "viem";
import { worldchainSepolia } from "viem/chains";

// NEXT_PUBLIC_* must be referenced literally so Next.js can inline them into the client bundle.
const appId = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID;
const environment = process.env.NEXT_PUBLIC_WORLD_ID_ENVIRONMENT ?? "staging";
const contractAddress = process.env.NEXT_PUBLIC_CRYPTOWILL_ADDRESS;
const deployBlock = process.env.NEXT_PUBLIC_CRYPTOWILL_DEPLOY_BLOCK;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://worldchain-sepolia.g.alchemy.com/public";

if (!appId?.startsWith("app_")) throw new Error("NEXT_PUBLIC_WORLD_ID_APP_ID missing or invalid");
if (!contractAddress || !isAddress(contractAddress)) {
  throw new Error("NEXT_PUBLIC_CRYPTOWILL_ADDRESS missing or invalid");
}
if (environment !== "staging" && environment !== "production") {
  throw new Error("NEXT_PUBLIC_WORLD_ID_ENVIRONMENT must be staging or production");
}

export const config = {
  chain: worldchainSepolia,
  rpcUrl,
  worldId: {
    appId: appId as `app_${string}`,
    environment: environment as "staging" | "production",
  },
  cryptoWill: {
    address: contractAddress as Address,
    deployBlock: BigInt(deployBlock ?? "0"),
  },
} as const;
