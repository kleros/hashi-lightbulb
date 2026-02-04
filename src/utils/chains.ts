// src/utils/chains.ts
import * as chains from "viem/chains";

export type UIChain = {
  id: number;
  name: string;
};

export const CHAIN_BY_ID = new Map<number, chains.Chain>(
  Object.values(chains)
    .filter((c: chains.Chain) => typeof c?.id === "number")
    .map((c: chains.Chain) => [c.id, c]),
);


export function resolveChain(chainId: number): UIChain {
  const chain = CHAIN_BY_ID.get(chainId);
  if (chain) {
    return {
      id: chain.id,
      name: chain.name,
    };
  }

  return { id: chainId, name: `Chain ${chainId}` };
}


