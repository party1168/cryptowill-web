import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { config } from "./config";

export const wagmiConfig = createConfig({
  chains: [config.chain],
  connectors: [injected()],
  transports: { [config.chain.id]: http(config.rpcUrl) },
  ssr: true,
  // Single injected connector only. With EIP-6963 discovery on, the same wallet also shows up as a
  // second connector; after a reload both reconnect, and Disconnect only drops one of them.
  multiInjectedProviderDiscovery: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
