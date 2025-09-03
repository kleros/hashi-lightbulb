// src/utils/viemClient.ts
import "viem/window";
import { createPublicClient, http, type Chain } from "viem";
import { arbitrumSepolia, gnosisChiado, sepolia } from "viem/chains";

export const SUPPORTED_CHAINS: Chain[] = [
  arbitrumSepolia,
  gnosisChiado,
  sepolia,
];

export const DEFAULT_CHAIN = arbitrumSepolia;
export const CHAIN_BY_ID = Object.fromEntries(
  SUPPORTED_CHAINS.map((c) => [c.id, c])
);

const _publicClients = new Map<number, ReturnType<typeof createPublicClient>>();

export function getPublicClient(chainId: number) {
  const existing = _publicClients.get(chainId);
  if (existing) return existing;
  const chain =
    (CHAIN_BY_ID as Record<number, Chain>)[chainId] ?? DEFAULT_CHAIN;
  const client = createPublicClient({
    chain,
    transport: http(), // consider passing explicit RPC via env for reliability
  });
  _publicClients.set(chain.id, client);
  return client;
}

// Back-compat alias
export function getPublic(chainId: number) {
  return getPublicClient(chainId);
}

/**
 * Requests the injected wallet to switch to `chainId`.
 * If the chain is unknown to the wallet, it will attempt to add it first, then switch.
 * Returns the public client for the target chain.
 *
 * Note: With RainbowKit/wagmi, prefer useSwitchChain for UI-driven switching.
 * This helper is safe to keep for non-React contexts.
 */
export async function ensureChain(chainId: number) {
  const target = (CHAIN_BY_ID as Record<number, Chain>)[chainId];
  if (!target) throw new Error(`Unsupported chain id: ${chainId}`);

  const eth: any =
    typeof window !== "undefined" ? (window as any).ethereum : null;
  if (!eth?.request) {
    throw new Error("No injected Ethereum provider found");
  }

  // Try to switch first
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${target.id.toString(16)}` }],
    });
  } catch {
    // If switch fails (unknown chain), try adding then switching.
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${target.id.toString(16)}`,
          chainName: target.name,
          nativeCurrency: target.nativeCurrency,
          rpcUrls: target.rpcUrls?.default?.http ?? [],
          blockExplorerUrls: target.blockExplorers
            ? [target.blockExplorers.default.url]
            : [],
        },
      ],
    });
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${target.id.toString(16)}` }],
    });
  }

  return { publicClient: getPublicClient(target.id) };
}
