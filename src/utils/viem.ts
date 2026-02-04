// src/utils/viemClient.ts
import { createPublicClient, http } from "viem";
import { CHAIN_BY_ID } from "@/utils/chains";

const _publicClients = new Map<number, ReturnType<typeof createPublicClient>>();

export function getPublicClient(chainId: number) {
  const existing = _publicClients.get(chainId);
  if (existing) return existing;

  const chain = CHAIN_BY_ID.get(chainId);
  if (!chain) throw new Error("Chain not supported" + chainId);
  // Optional: env override per chain
  const envRpcKey = `NEXT_PUBLIC_RPC_${chain.id}`;
  const envRpcUrl = (process.env as Record<string, string | undefined>)[
    envRpcKey
  ];

  const transport = envRpcUrl ? http(envRpcUrl) : http();

  const client = createPublicClient({
    chain,
    transport,
  });

  _publicClients.set(chainId, client);
  return client;
}

export const getPublic = getPublicClient;

