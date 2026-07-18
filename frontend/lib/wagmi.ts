"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Monad Testnet chain params — confirm against official Monad docs if they
// ever change (testnets get reset/updated more often than mainnets).
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MONAD_RPC ?? "https://testnet-rpc.monad.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "SplitBill",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "splitbill-dev",
  chains: [monadTestnet],
  ssr: true,
});
