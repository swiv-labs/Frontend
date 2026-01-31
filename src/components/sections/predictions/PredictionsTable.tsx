"use client"

import { motion } from "framer-motion"
import type { Prediction } from "@/lib/store/slices/predictionsSlice"
import { useAppDispatch } from "@/lib/store/hooks"
import { updatePrediction } from "@/lib/store/slices/predictionsSlice"
import Link from "next/link"
import { BarChart } from "lucide-react"
import { useState } from "react"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import { useSignTransaction, useSignMessage } from "@privy-io/react-auth/solana"
import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { claimRewardFlow } from "@/lib/solana/claim-reward"
import { useToast } from "@/lib/hooks/useToast"

interface PredictionsTableProps {
  predictions: Prediction[]
}

export function PredictionsTable({ predictions }: PredictionsTableProps) {
  console.log("PredictionsTable predictions:", predictions)
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { authenticated } = usePrivy()
  const { wallets } = useSolanaWallets()
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
  const { signTransaction } = useSignTransaction()
  const { signMessage } = useSignMessage()

  const wallet = {
    publicKey: embeddedWallet ? new PublicKey(embeddedWallet.address) : null,
    signTransaction: embeddedWallet?.signTransaction.bind(embeddedWallet),
    signAllTransactions: async (txs: Transaction[]) => {
      return Promise.all(txs.map(tx => embeddedWallet?.signTransaction(tx)))
    },
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      active: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      completed: "bg-green-500/10 border-green-500/20 text-green-400",
    }

    const labels = {
      pending: "Pending",
      active: "Active",
      completed: "Completed",
    }

    return (
      <div
        className={`px-3 py-1 rounded-lg border text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}
      >
        {labels[status as keyof typeof labels] || status}
      </div>
    )
  }

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return "text-muted-foreground"
    if (accuracy >= 95) return "text-green-400"
    if (accuracy >= 85) return "text-yellow-400"
    return "text-orange-400"
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const canClaimReward = (prediction: Prediction) => {
    return prediction.status === "calculated" && !prediction.reward
  }

  const handleClaimReward = async (prediction: Prediction) => {
    if (!authenticated || !embeddedWallet) {
      toast.error("Please connect your wallet first")
      return
    }

    setClaimingId(prediction.id)

    try {
      toast.info("Processing claim on blockchain...")

      const usdcMint = new PublicKey(process.env.NEXT_PUBLIC_USDC_TOKEN_MINT!)
      const userTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(embeddedWallet.address))

      await claimRewardFlow({
        userWallet: new PublicKey(embeddedWallet.address),
        userTokenAccount,
        poolId: prediction.pool_id,
        poolPubkey: new PublicKey(prediction.pool_pubkey),
        betPubkey: new PublicKey(prediction.bet_pubkey),
        predictionId: prediction.id,
        signTransaction: async (args: any) => {
          const signed = await signTransaction(args)
          return signed as Transaction
        },
        signMessage: signMessage,
        wallet: wallet,
      })

      // Update Redux store
      dispatch(
        updatePrediction({
          ...prediction,
          status: "claimed",
        }),
      )

      toast.success("Reward claimed successfully!")
    } catch (error: any) {
      console.error("Claim reward error:", error)
      toast.error(error.message || "Failed to claim reward")
    } finally {
      setClaimingId(null)
    }
  }

  // const handleClaimReward = async (prediction: Prediction) => {
  //   console.log(authenticated, embeddedWallet)
  //   if (!authenticated || !embeddedWallet) {
  //     toast.error("Please connect your wallet first")
  //     return
  //   }

  //   setClaimingId(prediction.id)
  //   try {
  //     toast.info("Processing claim on blockchain...")

  //     const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, "confirmed")
  //     const walletPublicKey = new PublicKey(embeddedWallet.address)

  //     console.log("[v0] Claiming reward for prediction:", prediction)
  //     // Call blockchain claim function
  //     const signature = await claimRewards(
  //       connection,
  //       walletPublicKey,
  //       async (tx) => {
  //         const signedTx = await embeddedWallet.signTransaction(tx)
  //         return signedTx
  //       },
  //       {
  //         poolId: prediction.pools.poolid,
  //       },
  //     )

  //     console.log("[v0] Claim transaction confirmed:", signature)
  //     toast.info("Updating backend...")

  //     // Call backend to update claim status
  //     const backendResponse = await claimReward(prediction.id, embeddedWallet.address)

  //     // Update Redux store
  //     dispatch(
  //       updatePrediction({
  //         ...prediction,
  //         status: "completed",
  //       }),
  //     )

  //     toast.success("Reward claimed successfully!")
  //   } catch (error: any) {
  //     console.error("[v0] Claim reward error:", error)
  //     toast.error(error.message || "Failed to claim reward")
  //   } finally {
  //     setClaimingId(null)
  //   }
  // }

  if (predictions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center py-20"
      >
        <div className="w-full flex justify-center mb-4">
          <BarChart size={60} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No predictions yet</h3>
        <p className="text-muted-foreground mb-6">Start making predictions to see them here</p>
        <Link
          href="/pools"
          className="inline-flex px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl transition-smooth hover:shadow-xl hover:shadow-primary/50 hover:scale-105"
        >
          Explore Pools
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl bg-transparent border border-border"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">All Predictions</h2>
        <p className="text-sm text-muted-foreground">Your prediction history and performance</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Asset</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Target Price</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Final Price</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Stake</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Reward</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction, index) => (
              <motion.tr
                key={prediction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-smooth"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/pools/${prediction.pools.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-smooth"
                  >
                    {prediction.pools.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-foreground">
                    {/* ${prediction.pools.target_price.toLocaleString()} */} $20,000
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-foreground">
                    {/* {prediction.pools.final_price ? `$${prediction.pools.final_price.toLocaleString()}` : "-"} */} $50,000
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-foreground">${prediction.deposit.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-semibold text-green-400">
                    {prediction.reward ? `$${prediction.reward.toLocaleString()}` : "-"}
                  </span>
                </td>
                <td className="py-3 px-4">{getStatusBadge(prediction.status)}</td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{formatDate(prediction.created_at)}</span>
                </td>
                <td className="py-3 px-4">
                  {canClaimReward(prediction) ? (
                    <button
                      onClick={() => handleClaimReward(prediction)}
                      disabled={claimingId === prediction.id}
                      className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-smooth hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {claimingId === prediction.id ? "Claiming..." : "Claim"}
                    </button>
                  ) : prediction.status === "claimed" ? (
                    <span className="text-xs font-semibold text-green-400">Claimed ✓</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
