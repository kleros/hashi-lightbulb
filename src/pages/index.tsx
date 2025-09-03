"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { useEffect, useState } from "react";
import { Address } from "viem";
import { gnosisChiado } from "viem/chains";
import { Header } from "@/components/Header";
import { LightbulbControls } from "@/components/LightBulbControls";
import { HistoryTable, HistoryEntry } from "@/components/HistoryDialog";
import { LightbulbStatusDialog } from "@/components/LightBulbStatus";
import { Geist, Geist_Mono as GeistMono } from "next/font/google";

import { WagmiProvider } from "wagmi";
import { useChainId } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/utils/wagmi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = GeistMono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

function PageBody() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [account, setAccount] = useState<Address | null>(null);
  const chainId = useChainId(); // active chain from wagmi/RainbowKit [10]
  const [lightbulbChainId, setLightbulbChainId] = useState<number>(
    gnosisChiado.id
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(`lightbulbHistory`);
    if (stored) {
      try {
        const parsed: HistoryEntry[] = JSON.parse(stored);
        setHistory(parsed);
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
      }
    }
  }, [setHistory, chainId]);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans grid grid-rows-[20px_1fr_20px] items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
    >
      {isMounted && (
        <>
          {/* Header is expected to include RainbowKit's <ConnectButton /> */}
          <Header {...{ account, setAccount }} />

          <div className="flex w-full justify-around">
            <LightbulbControls
              {...{
                account,
                setHistory,
                lightbulbChainId,
              }}
            />
            <LightbulbStatusDialog
              address={account}
              lightbulbChainId={lightbulbChainId}
              setLightbulbChainId={setLightbulbChainId}
            />
          </div>

          {history.length > 0 && (
            <HistoryTable {...{ chainId, account, history }} />
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <PageBody />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
