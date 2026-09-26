import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { config } from "./config";

export const wagmiConfig = createConfig({
  chains: [config.chain],
  connectors: [injected()],
  transports: { [config.chain.id]: http(config.rpcUrl) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
