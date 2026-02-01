"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "../store/store"
import { PrivyProvider } from "@privy-io/react-auth"
import { ThemeProvider } from "../contexts/ThemeContext"
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#9977F7",
          logo: "https://6uiuofhna2a3crqf.public.blob.vercel-storage.com/swiv-white-nobg%20%281%29.png",
          walletChainType: 'solana-only',
          walletList: ['phantom', 'backpack', 'solflare'],
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "all-users",
          },
          requireUserPasswordOnCreate: false,
        },
        externalWallets: {
          solana: {connectors: toSolanaWalletConnectors()}
        },
        loginMethods: ["email"],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
      }}
    >
      <Provider store={store}>
        <ThemeProvider>{children}</ThemeProvider>
      </Provider>
    </PrivyProvider>
  )
}
