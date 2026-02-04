"use client";

import { PropsWithChildren } from "react";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiAdapter } from "@/utils/wagmi";

export default function AppkitProvider({ children }: PropsWithChildren) {
const queryClient = new QueryClient();
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
