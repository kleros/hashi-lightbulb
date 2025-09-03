"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import type { Address } from "viem";
import { arbitrumSepolia, gnosisChiado, sepolia } from "viem/chains";
import type { Chain } from "viem";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

const SUPPORTED_CHAINS: Chain[] = [arbitrumSepolia, gnosisChiado, sepolia];
const CHAIN_OPTIONS = SUPPORTED_CHAINS.map((c) => ({ id: c.id, name: c.name }));

export function Header({
  // account is still accepted for backward-compat, but wagmi is source of truth now.
  account: legacyAccount,
  setAccount: _setAccount,
}: {
  account: Address | null;
  setAccount: (account: Address | null) => void;
}) {
  const chainId = useChainId(); // current active chain (undefined when disconnected) [12]
  const { address } = useAccount(); // connected address (undefined when disconnected) [3]
  const { chains, switchChain } = useSwitchChain(); // for switching networks [13]

  useEffect(() => {
    if (address) {
      _setAccount(address);
    }
  }, [address]);
  const knownChainsById = useMemo(
    () => new Map(SUPPORTED_CHAINS.map((c) => [c.id, c])),
    []
  );

  const onSelectChain = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextId = Number(e.target.value);
      // Only switch if the chain is part of configured wagmi chains
      const target = chains.find((c) => c.id === nextId);
      if (!target) return;
      try {
        switchChain({ chainId: target.id });
      } catch (err) {
        // Some wallets may require user action; RainbowKit modal assists via ConnectButton
        console.error("Failed to switch chain", err);
      }
    },
    [chains, switchChain]
  );

  const currentSelection = chainId ?? SUPPORTED_CHAINS[0].id;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold">Hashi Lightbulb</h1>

      <div className="flex items-center gap-3">
        {/* RainbowKit Connect */}
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
      </div>
    </header>
  );
}
