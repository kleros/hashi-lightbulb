import { useEffect, useState } from "react";
import type { Address } from "viem";
import { encodeFunctionData } from "viem";
import { useSendTransaction } from "wagmi";
import { SwitchAbi } from "@/utils/abis/switchAbi";
import { getSwitch, getLightbulb } from "@/utils/routes/getters";
import type { HashiAddress } from "@/utils/types";
export type TxnStatus = "idle" | "pending" | "success" | "error";

interface UseSwitchReturn {
  /** call this to trigger turnOnLightBulb */
  turnOnLightBulb: (
    threshold: number,
    HashiAddresses: HashiAddress[],
    account: Address
  ) => Promise<void>;
  /** current transaction hash (if any) */
  txHash?: string;
  /** error message (if any) */
  error?: string;
  /** status of the tx */
  status: TxnStatus;
}

/**
 * Hook to interact with the Switch contract's turnOnLightBulb function.
 *
 * @param contractAddress - deployed Switch contract address
 */
export function useSwitch(
  switchChainId: number,
  lightbulbChainId: number,
): UseSwitchReturn {
  const [status, setStatus] = useState<TxnStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const { data: hash, sendTransaction } = useSendTransaction();

  const switchAddress = getSwitch(switchChainId, lightbulbChainId);
  const lightbulbAddress = getLightbulb(switchChainId, lightbulbChainId);
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  const turnOnLightBulb = async (
    threshold: number,
    bridges: HashiAddress[],
  ): Promise<void> => {
    const reporters: Address[] = bridges.map((b) => b.reporter);
    const adapters: Address[] = bridges.map((b) => b.adapter);
    try {
      setStatus("pending");
      setError(undefined);
      // send transaction
      const data = encodeFunctionData({
        abi: SwitchAbi,
        functionName: "turnOnLightBulb",
        args: [
          lightbulbChainId,
          lightbulbAddress,
          threshold,
          reporters,
          adapters,
        ],
      });
      sendTransaction({
        to: switchAddress as Address,
        data,
        value: BigInt(0),
      });
      setStatus("success");
    } catch (e) {
      setError(String(e));
      setStatus("error");
      throw e;
    }
  };

  return { turnOnLightBulb, txHash, error, status };
}
