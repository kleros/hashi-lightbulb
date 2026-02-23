import React, { useState, useEffect } from "react";
import { useLightBulb } from "@/hooks/useLigthBulb";
import { Address } from "viem";
import { useAppKitAccount } from "@reown/appkit/react";
import { useChains } from "@/context/ChainContext";
import { getDestinationChainsForSourceChain } from "@/utils/chains";


/**
 * Always-visible dialog to check and display lightbulb on/off status.
 */
export function LightbulbStatusDialog() {
  const { address } = useAppKitAccount();
  const {
    sourceChainId: switchChainId,
    destinationChainId: lightbulbChainId,
    setDestinationChainId,
  } = useChains();
  const lightbulbChains = getDestinationChainsForSourceChain(
    switchChainId,
  ).filter((c) => typeof c === "object" && c !== null);
  // optional override input
  const [inputAddress, setInputAddress] = useState<string>("");
  // current lightbulb status
  const { isOn, loading, refetch } = useLightBulb(
    switchChainId,
    lightbulbChainId,
    address as Address,
  );

  // fetch connected address on mount
  useEffect(() => {
    refetch(lightbulbChainId);
  }, [switchChainId, lightbulbChainId, refetch]);

  /**
   * Trigger a status check for the given address (or connected address if none)
   */
  const handleCheckStatus = async () => {
    const addrToCheck = address;
    if (!addrToCheck) {
      alert("Please connect your wallet or enter an address");
      return;
    }
    try {
      refetch();
    } catch (err) {
      console.error("Failed to fetch status", err);
      alert("Error checking lightbulb status");
    }
  };

  const handleLightbulbChain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = Number(e.target.value);
    if (Number.isFinite(nextId)) {
      setDestinationChainId(nextId);
    }
  };

  return (
    <div className="bg-black border-2 border-white rounded-lg shadow-lg w-1/2 p-6 mx-auto flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lightbulb Status</h2>

          {/* Lightbulb Chain Selector */}
          <label className="block text-sm">
            Lightbulb chain
            <select
              value={lightbulbChainId}
              onChange={handleLightbulbChain}
              className="ml-2 px-2 py-1 border rounded"
            >
              {lightbulbChains.length > 0 &&
                lightbulbChains.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {/* Address Input */}
        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder={address || "Connect wallet to auto-fill"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
        </div>

        {/* Check Status Button */}
        <div className="mb-4">
          <button
            onClick={handleCheckStatus}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </div>
      </div>
      {/* Status Display */}
      {!loading && (
        <p
          className={`text-4xl font-large ${
            isOn === null
              ? "text-gray-400"
              : isOn
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {isOn === null
            ? "No Status"
            : isOn
            ? "The lightbulb is ON"
            : "The lightbulb is OFF"}
        </p>
      )}
    </div>
  );
}
