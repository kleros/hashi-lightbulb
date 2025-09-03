"use client";

import { useState } from "react";
import type { Address } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { encodeFunctionData } from "viem";
import { getPublic } from "@/utils/viemClient";
import { SwitchAbi } from "@/utils/abis/switchAbi";
import {
  HashiAddress,
  SWITCH_ADDRESS,
  LIGHTBULB_PER_CHAIN,
} from "@/utils/consts";
import { useWalletClient, useSwitchChain } from "wagmi";

export type TxnStatus = "idle" | "pending" | "success" | "error";

interface UseSwitchReturn {
  turnOnLightBulb: (
    threshold: number,
    HashiAddresses: HashiAddress[],
    account: Address
  ) => Promise<string>;
  txHash?: string;
  error?: string;
  status: TxnStatus;
}

/**
 * Hook to interact with the Switch contract's turnOnLightBulb function.
 *
 * Sends the tx from the connected wallet (via RainbowKit/wagmi).
 */
export function useSwitch(lightbulbChainId: number): UseSwitchReturn {
  const [status, setStatus] = useState<TxnStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();

  const { data: walletClient } = useWalletClient(); // viem WalletClient from wagmi connection [2]
  const { switchChain } = useSwitchChain(); // for network switching [11]

  const turnOnLightBulb = async (
    threshold: number,
    bridges: HashiAddress[],
    account: Address
  ): Promise<string> => {
    if (!walletClient) throw new Error("Wallet not connected");

    const reporters: Address[] = bridges.map((b) => b.reporter);
    const adapters: Address[] = bridges.map((b) => b.adapter);

    try {
      setStatus("pending");
      setError(undefined);

      // Ensure wallet is on Arbitrum Sepolia before sending (your Switch is deployed there)
      try {
        await switchChain({ chainId: arbitrumSepolia.id }); // prompts if needed via RainbowKit [11]
      } catch (e) {
        throw new Error("Please switch to Arbitrum Sepolia and try again");
      }

      // Build calldata for optional external estimate, though writeContract also estimates
      const data = encodeFunctionData({
        abi: SwitchAbi,
        functionName: "turnOnLightBulb",
        args: [
          lightbulbChainId,
          LIGHTBULB_PER_CHAIN[lightbulbChainId],
          threshold,
          reporters,
          adapters,
        ],
      });

      // Estimate gas via public client on Arbitrum Sepolia
      const publicClient = getPublic(arbitrumSepolia.id);
      const estimatedGas = await publicClient.estimateGas({
        account,
        to: SWITCH_ADDRESS,
        data,
        value: BigInt(0),
      });
      [6];

      // Send tx using connected wallet client (wagmi/viem)
      const hash = await walletClient.writeContract({
        address: SWITCH_ADDRESS,
        abi: SwitchAbi,
        functionName: "turnOnLightBulb",
        args: [
          lightbulbChainId,
          LIGHTBULB_PER_CHAIN[lightbulbChainId],
          threshold,
          reporters,
          adapters,
        ],
        value: BigInt(0),
        chain: arbitrumSepolia, // ensure correct chain context for viem [12]
        account,
        gas: estimatedGas,
      });
      [12][4];

      setTxHash(hash);
      setStatus("success");
      return hash;
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus("error");
      throw e;
    }
  };

  return { turnOnLightBulb, txHash, error, status };
}
