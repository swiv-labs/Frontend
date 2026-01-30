"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import type { Pool, Prediction } from "@/lib/types/models"
import { placeEncryptedBet } from "@/lib/solana/place-bet"
import { useToast } from "@/lib/hooks/useToast"
import { useSignMessage, useSignTransaction } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction } from "@solana/web3.js"
import { BN } from "@coral-xyz/anchor"
import { getAssociatedTokenAddress } from "@solana/spl-token"

interface InlineBettingPanelProps {
  pool: Pool
}

export function InlineBettingPanel({ pool }: InlineBettingPanelProps) {
  const { ready, authenticated } = usePrivy()
  const { signTransaction } = useSignTransaction()
  const { signMessage } = useSignMessage()
  const { wallets } = useSolanaWallets()

  const embeddedWallet = wallets.find(w => w.walletClientType === "privy")

  const wallet = {
    publicKey: embeddedWallet ? new PublicKey(embeddedWallet.address) : null,
    signTransaction: embeddedWallet?.signTransaction.bind(embeddedWallet),
    signAllTransactions: async (txs: Transaction[]) => {
      return Promise.all(txs.map(tx => embeddedWallet?.signTransaction(tx)))
    },
  };

  const toast = useToast()

  const [prediction, setPrediction] = useState<number>(0)
  const [deposit, setDeposit] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedPrediction, setPlacedPrediction] = useState<Prediction | null>(null)

  const solanaWallet = wallets.find((w) => w.walletClientType === "privy")
  const isPoolActive = pool.status === "active"
  const isPoolEnded = new Date().getTime() / 1000 > pool.end_time

  // Use min/max prediction from pool data
  // These are set when pool is created in the backend
  const MIN_PREDICTION = pool.min_prediction || 0
  const MAX_PREDICTION = pool.max_prediction || 1000
  const STEP = (MAX_PREDICTION - MIN_PREDICTION) / 10000000

  const handlePredictionChange = (value: number) => {
    setPrediction(value)
  }

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeposit(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const depositAmount = Number.parseFloat(deposit)

    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid deposit amount")
      return
    }

    // Validate prediction is within range
    if (prediction < MIN_PREDICTION || prediction > MAX_PREDICTION) {
      toast.error(`Prediction must be between ${MIN_PREDICTION.toFixed(2)} and ${MAX_PREDICTION.toFixed(2)}`)
      return
    }

    if (!ready || !authenticated || !solanaWallet) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!isPoolActive || isPoolEnded) {
      toast.error("This pool is not accepting new predictions")
      return
    }

    setIsSubmitting(true)

    const usdcMint = new PublicKey(process.env.NEXT_PUBLIC_USDC_TOKEN_MINT!)
    const userTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(solanaWallet.address))
    const userAta = userTokenAccount.toBase58()

    console.log("Placing encrypted bet with:", pool)

    try {
      const result = await placeEncryptedBet({
        userWallet: new PublicKey(solanaWallet.address),
        userTokenAccount: new PublicKey(userAta),
        poolId: pool.pool_id.toString(),
        poolPubkey: new PublicKey(pool.pool_pubkey),
        prediction: new BN(Math.floor(prediction * 1e6)),
        stakeAmount: new BN(Math.floor(depositAmount * 1000000)),
        requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        signTransaction: async (args: any) => {
          const signed = await signTransaction(args)
          return signed as Transaction
        },
        signMessage: signMessage,
        wallet: wallet
      })

      setPlacedPrediction(result)
      toast.success("Prediction placed successfully")
      setDeposit("")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message ?? "Bet failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isPoolActive || isPoolEnded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 p-6 rounded-2xl bg-card border border-border"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">Pool Closed</p>
          <p className="text-sm text-muted-foreground">New predictions are no longer accepted</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 p-6 rounded-2xl bg-card border border-border shadow-xl space-y-6"
    >
      <div>
        <h3 className="text-xl font-bold text-foreground">Place Prediction</h3>
        <p className="text-sm text-muted-foreground mt-1">Pool {pool.pool_id}</p>
      </div>

      {placedPrediction ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">✓</div>
            <div className="flex-1">
              <p className="font-semibold text-green-600">Prediction Placed!</p>
              <p className="text-sm text-green-600/80 mt-1">Your encrypted prediction has been submitted</p>
              <p className="text-xs text-green-600/60 mt-2 font-mono">ID: {placedPrediction.id}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prediction Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Predicted Value</label>
              <div className="text-lg font-bold text-primary font-mono">{prediction.toFixed(2)}</div>
            </div>

            <input
              type="range"
              min={MIN_PREDICTION}
              max={MAX_PREDICTION}
              step={STEP}
              value={prediction}
              onChange={(e) => handlePredictionChange(Number(e.target.value))}
              disabled={isSubmitting || !authenticated}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
            />

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{MIN_PREDICTION}</span>
              <span>{MAX_PREDICTION}</span>
            </div>
          </div>

          {/* Deposit Amount */}
          <div>
            <label htmlFor="deposit" className="block text-sm font-medium text-foreground mb-2">
              Deposit Amount (USDC)
            </label>
            <input
              id="deposit"
              type="number"
              step="0.01"
              min="0"
              value={deposit}
              onChange={handleDepositChange}
              placeholder="0.00"
              disabled={isSubmitting || !authenticated}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth disabled:opacity-50"
            />
          </div>

          {/* Connection Status */}
          {!authenticated && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-600">Connect your wallet to place predictions</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !authenticated || !solanaWallet}
            className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                Processing...
              </span>
            ) : !authenticated ? (
              "Connect Wallet"
            ) : (
              "Place Prediction"
            )}
          </button>
        </form>
      )}

      {/* Pool Stats */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Participants</span>
          <span className="font-semibold">{pool.total_participants}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Vault Balance</span>
          <span className="font-mono text-xs font-semibold">{(pool.vault_balance / 1_000_000).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary/20 text-primary capitalize">
            {pool.status}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
