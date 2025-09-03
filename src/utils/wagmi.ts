"use client";
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, createConfig } from "wagmi";
import { arbitrumSepolia, gnosisChiado, sepolia } from "wagmi/chains";
import {
  injected,
  walletConnect,
  metaMask,
    coinbaseWallet,
} from "wagmi/connectors";
import type { Config } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const sepoliaRPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC as string;
const arbitrumSepoliaRPC = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC as string;
const gnosisChiadoRPC = process.env.NEXT_PUBLIC_GNOSIS_CHAIDO_RPC as string;

export const chains = [arbitrumSepolia, gnosisChiado, sepolia] as const;

export const config: Config = getDefaultConfig({
  appName: "Hashi Lightbulb",
  projectId,
  chains,
  transports: {
    [arbitrumSepolia.id]: http(arbitrumSepoliaRPC),
    [gnosisChiado.id]: http(gnosisChiadoRPC),
    [sepolia.id]: http(sepoliaRPC),
  },
  ssr: true,
});
