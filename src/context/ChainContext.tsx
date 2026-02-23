"use client";

import React, { createContext, useContext, useState } from "react";
import { UIChain, getDestinationChainsForSourceChain } from "@/utils/chains";

type ChainsContextType = {
  sourceChainId: number;
  destinationChainId: number;
  setSourceChainId: (id: number) => void;
  setDestinationChainId: (id: number) => void;
};

const ChainsContext = createContext<ChainsContextType | undefined>(undefined);

export function ChainsProvider({ children }: { children: React.ReactNode }) {
  const [sourceChainId, _setSourceChainId] = useState<number>(421614); 
    const [destinationChainId, _setDestinationChainId] = useState<number>(11155111);
    const setSourceChainId = (id: number) => {
      _setSourceChainId(id);

      // Get valid destinations for this source
      const destinations = getDestinationChainsForSourceChain(id);

      if (destinations.length > 0) {
        _setDestinationChainId(
          typeof destinations[0] === "number"
            ? destinations[0]
            : (destinations[0] as any).id ?? (destinations[0] as any).chainId
        );
      } else {
        throw new Error("No destination chain for source chain.")
      }
    };

    const setDestinationChainId = (id: number) => {
      _setDestinationChainId(id);
    };


  return (
    <ChainsContext.Provider
      value={{
        sourceChainId,
        destinationChainId,
        setSourceChainId,
        setDestinationChainId,
      }}
    >
      {children}
    </ChainsContext.Provider>
  );
}

export function useChains() {
  const ctx = useContext(ChainsContext);
  if (!ctx) {
    throw new Error("useChains must be used within a ChainsProvider");
  }
  return ctx;
}
