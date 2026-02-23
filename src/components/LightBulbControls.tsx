// src/components/LightbulbControls.tsx
import React, { useEffect, useState } from "react";
import { type Address } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";
import { useSwitch } from "@/hooks/useSwitch";
import { getPublicClient } from "@/utils/viem";
import type { HashiAddress } from "@/utils/types";
import { getRoute, getAvailableBridges } from "@kleros/veashi-sdk";
import { getAllSourceChains } from "@/utils/chains";
import { useChains } from "@/context/ChainContext";
import { useAppKitNetwork } from "@reown/appkit/react";
import { CHAIN_BY_ID } from "@/utils/chains";


/* --------------------------------------------------
   Bridge metadata
-------------------------------------------------- */

type BridgeKey = "lz" | "ccip" | "vea";

const BRIDGE_LABELS: Record<BridgeKey, string> = {
  lz: "LayerZero",
  ccip: "CCIP",
  vea: "Vea",
};

/* --------------------------------------------------
   Component
-------------------------------------------------- */

export function LightbulbControls() {
  const { address: account } = useAppKitAccount();
  const { switchNetwork } = useAppKitNetwork();
  const {
    sourceChainId: switchChainId,
    destinationChainId: lightbulbChainId,
    setSourceChainId,
  } = useChains();
  const { turnOnLightBulb, txHash, status } = useSwitch(
    switchChainId,
    lightbulbChainId,
  );
  const switchChains = getAllSourceChains();
  const [threshold, setThreshold] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBridges, setSelectedBridges] = useState<
    Record<BridgeKey, boolean>
  >({} as any);

  /* --------------------------------------------------
     Route + available bridges (FROM GETTER)
  -------------------------------------------------- */
  const route = getRoute(switchChainId, lightbulbChainId);

  const availableBridges = getAvailableBridges(
    switchChainId,
    lightbulbChainId,
  ) as BridgeKey[];

  // Initialize selection state whenever route changes
  useEffect(() => {
    const initial: Record<BridgeKey, boolean> = {
      lz: false,
      ccip: false,
      vea: false,
    };
    availableBridges.forEach((b) => (initial[b] = false));
    setSelectedBridges(initial);
  }, [lightbulbChainId, switchChainId]);

  /* --------------------------------------------------
     Handlers
  -------------------------------------------------- */

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setThreshold("");
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0) setThreshold(num);
    }
  };

  const handleSubmit = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (threshold === "" || Number(threshold) < 0) {
      alert("Please enter a valid non-negative threshold value");
      return;
    }

    if (!route) {
      alert("No route available for this chain pair");
      return;
    }

    const chosen = (Object.keys(selectedBridges) as BridgeKey[]).filter(
      (b) => selectedBridges[b],
    );

    if (chosen.length === 0) {
      alert("Please select at least one bridge");
      return;
    }

    const selectedHashiAddresses: HashiAddress[] = chosen.map((b) => ({
      reporter: route[`${b}Reporter` as keyof typeof route] as Address,
      adapter: route[`${b}Adapter` as keyof typeof route] as Address,
    }));

    await turnOnLightBulb(
      threshold,
      selectedHashiAddresses,
      account as Address,
    );
  };

  const handleSwitchChain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = Number(e.target.value);
    if (Number.isFinite(nextId)) {
      const chain = CHAIN_BY_ID.get(nextId);
      if (!chain) throw new Error("Chain not supported" + nextId);
      switchNetwork(chain);
      setSourceChainId(nextId);
    }
  };

  useEffect(() => {
    setIsLoading(status === "pending");
  }, [status]);

  /* --------------------------------------------------
     History handling
  -------------------------------------------------- */

  useEffect(() => {
    if (!txHash) return;

    (async () => {
      try {
        const publicClient = getPublicClient(switchChainId);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });
        alert("Transaction confirmed! " + receipt.transactionHash);
      } catch (err) {
        console.error("Transaction confirmation failed:", err);
      }
    })();
  }, [txHash]);

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */

  return (
    <div className="w-1/2 mx-auto bg-black border-2 border-white p-6 rounded-lg">
      {/* Threshold */}
      <div className="flex justify-between mb-6">
        <div>
          <label className="block text-lg font-medium mb-2">
            Set Threshold Value
          </label>
          <input
            type="number"
            min="0"
            value={threshold}
            onChange={handleThresholdChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <label className="block text-sm">
          Switch chain
          <select
            value={switchChainId}
            onChange={handleSwitchChain}
            className="ml-2 px-2 py-1 border rounded"
          >
            {switchChains.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Bridges */}
      <div className="mb-6">
        <span className="block text-lg font-medium mb-2">Select Bridge</span>

        {availableBridges.length === 0 && (
          <p className="text-sm text-gray-400">
            No bridges available for this route
          </p>
        )}

        {availableBridges.map((b) => (
          <label key={b} className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={!!selectedBridges[b]}
              onChange={() =>
                setSelectedBridges((prev) => ({
                  ...prev,
                  [b]: !prev[b],
                }))
              }
              className="h-5 w-5"
            />
            <span className="ml-3">{BRIDGE_LABELS[b]}</span>
          </label>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isLoading ? "Turning On Lightbulb..." : "Turn On Lightbulb"}
      </button>
    </div>
  );
}
