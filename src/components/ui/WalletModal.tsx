"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePrivy, useFundWallet } from "@privy-io/react-auth"
import { useSolanaWallets } from "@privy-io/react-auth"
import { useAppSelector } from "@/lib/store/hooks"
import { useEffect, useState } from "react"
import { getUsdcBalanceFormatted } from "@/lib/solana/token"
import { formatUsdcBalance } from "@/lib/helpers/formatUsdc"
import { useToast } from "@/lib/hooks/useToast"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { user, logout, ready, authenticated } = usePrivy()
  const { fundWallet } = useFundWallet()
  const { wallets } = useSolanaWallets()
  const { balance: reduxBalance } = useAppSelector((state) => state.wallet)
  const [copying, setCopying] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<number>(0)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const toast = useToast()

  const walletAddress = user?.wallet?.address || ""

  // Get the embedded Solana wallet
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
  const hasEmbeddedWallet = !!embeddedWallet

  // Fetch real USDC balance
  const fetchUsdcBalance = async () => {
    if (!walletAddress) return
    setLoadingBalance(true)
    try {
      const balance = await getUsdcBalanceFormatted(walletAddress)
      setUsdcBalance(balance)
    } catch (error) {
      console.error("Failed to fetch USDC balance:", error)
      toast.error("Failed to fetch balance")
    } finally {
      setLoadingBalance(false)
    }
  }

  // Fetch balance when modal opens or wallet address changes
  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchUsdcBalance()
    }
  }, [isOpen, walletAddress])

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  const handleDepositUsdc = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected")
      return
    }

    setDepositing(true)
    try {
      // fundWallet takes just the address
      await fundWallet(walletAddress)
      toast.success("Deposit initiated")
      // Refresh balance after deposit
      setTimeout(() => fetchUsdcBalance(), 2000)
    } catch (error) {
      console.error("Failed to deposit USDC:", error)
      toast.error("Failed to initiate deposit")
    } finally {
      setDepositing(false)
    }
  }

  const handleExportWallet = async () => {
    if (!embeddedWallet) {
      toast.error("No embedded wallet found")
      return
    }

    setExporting(true)
    try {
      // For Privy, export wallet is typically initiated through the dashboard
      // or by calling a specific method. For embedded wallets, we can initiate
      // a recovery flow or prompt the user to export via the Privy UI
      // This implementation assumes the wallet has a method to trigger the export flow
      
      // Check if wallet has exportWallet capability
      if (typeof embeddedWallet === "object" && "exportWallet" in embeddedWallet) {
        await (embeddedWallet as any).exportWallet()
        toast.success("Wallet exported successfully")
      } else {
        // Fallback: show user the wallet address and guide them to export
        toast.info("Please use Privy's dashboard to export your wallet")
      }
    } catch (error) {
      console.error("Failed to export wallet:", error)
      toast.error("Failed to export wallet")
    } finally {
      setExporting(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Wallet</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-border">
                    <span className="flex-1 text-sm font-mono text-foreground truncate">
                      {formatAddress(walletAddress)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-2 rounded-lg hover:bg-background transition-smooth text-muted-foreground hover:text-foreground"
                      title="Copy address"
                    >
                      {copying ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Balance</label>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                    <div className="flex items-baseline gap-2">
                      {loadingBalance ? (
                        <>
                          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                          <span className="text-lg font-medium text-muted-foreground">USDC</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">
                            {formatUsdcBalance(usdcBalance)}
                          </span>
                          <span className="text-lg font-medium text-muted-foreground">USDC</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Available for predictions</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {/* <div className="space-y-3">
                  {/* Deposit Button */}
                  {/* <button
                    onClick={handleDepositUsdc}
                    disabled={!walletAddress || !authenticated || depositing}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-smooth flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {depositing ? "Processing..." : "Deposit USDC"}
                  </button> */}

                  {/* Export Wallet Button */}
                  {/* <button
                    onClick={handleExportWallet}
                    disabled={!hasEmbeddedWallet || !ready || exporting}
                    className="w-full px-4 py-3 text-foreground font-semibold rounded-xl border border-border hover:border-primary/50 transition-smooth flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {exporting ? "Exporting..." : "Export Wallet"}
                  </button> */}

                  {/* Disconnect Button */}
                  <button
                    onClick={async () => {
                      await logout()
                      onClose()
                    }}
                    className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl border border-red-500/20 hover:border-red-500/50 transition-smooth flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Disconnect Wallet
                  </button>
                {/* </div> */}

                {/* Network Info */}
                {/* <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Network</span>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium text-foreground">Solana</span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
