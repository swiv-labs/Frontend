"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import type { Pool, Prediction } from "@/lib/types/models"
import { placeEncryptedBet } from "@/lib/solana/place-bet"
import { claimRewardFlow } from "@/lib/solana/claim-reward"
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
  const [inputPrediction, setInputPrediction] = useState<string>("0")
  const [predictionError, setPredictionError] = useState<string>("")
  const [deposit, setDeposit] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placedPrediction, setPlacedPrediction] = useState<Prediction | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)

  const solanaWallet = wallets.find((w) => w.walletClientType === "privy")
  const isPoolActive = pool.status === "active"
  const isPoolEnded = new Date().getTime() / 1000 > pool.end_time
  const isPoolResolved = pool.status === "resolved"

  // Use min/max prediction from pool data
  // These are set when pool is created in the backend
  const MIN_PREDICTION = pool.min_prediction || 0
  const MAX_PREDICTION = pool.max_prediction || 1000
  // Determine step / rounding behavior from MIN_PREDICTION length
  const computeStepFromMin = () => {
    const absInt = Math.floor(Math.abs(MIN_PREDICTION))
    const len = absInt === 0 ? 1 : String(absInt).length
    // If min prediction integer length is less than 3 -> use 0.1 steps, otherwise integers
    return len < 3 ? 0.1 : 1
  }

  const INPUT_STEP = computeStepFromMin()
  const DISPLAY_DECIMALS = INPUT_STEP < 1 ? 1 : 0

  const clampPrediction = (value: number) => {
    if (Number.isNaN(value)) return MIN_PREDICTION
    return Math.max(MIN_PREDICTION, Math.min(MAX_PREDICTION, value))
  }

  const handlePredictionChange = (value: number) => {
    setPrediction(clampPrediction(value))
  }

  const formatPrediction = (v: number) => DISPLAY_DECIMALS > 0 ? v.toFixed(DISPLAY_DECIMALS) : String(Math.round(v))

  const handlePredictionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputPrediction(val)
    if (val === "" || val === "-" || val === ".") {
      setPredictionError("")
      return
    }
    const v = Number(val)
    if (Number.isNaN(v)) {
      setPredictionError("Invalid number")
      return
    }
    if (v < MIN_PREDICTION || v > MAX_PREDICTION) {
      setPredictionError(`Prediction must be between ${MIN_PREDICTION} and ${MAX_PREDICTION}`)
      return
    }
    setPredictionError("")
    setPrediction(clampPrediction(v))
  }

  const incrementPrediction = (delta: number) => {
    setPrediction(prev => {
      const next = clampPrediction(Number((prev + delta).toFixed(DISPLAY_DECIMALS)))
      setInputPrediction(formatPrediction(next as number))
      setPredictionError("")
      return next
    })
  }

  const incrementDeposit = (delta: number) => {
    const cur = Number.parseFloat(deposit || "0")
    const next = Math.max(0, cur + delta)
    setDeposit(String(next))
  }

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeposit(e.target.value)
  }

  useEffect(() => {
    setInputPrediction(formatPrediction(prediction))
  }, [prediction, DISPLAY_DECIMALS])

  const handleClaimReward = async () => {
    if (!ready || !authenticated || !solanaWallet || !placedPrediction) {
      toast.error("Please connect your wallet and place a prediction first")
      return
    }

    setIsClaiming(true)

    try {
      const usdcMint = new PublicKey(pool.token_mint)
      console.log("usdcMint: ", usdcMint)
      const userTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(solanaWallet.address))

      await claimRewardFlow({
        userWallet: new PublicKey(solanaWallet.address),
        userTokenAccount,
        poolId: pool.pool_id,
        poolPubkey: new PublicKey(pool.pool_pubkey),
        betPubkey: new PublicKey(placedPrediction.bet_pubkey!),
        predictionId: placedPrediction.id,
        signTransaction: async (args: any) => {
          const signed = await signTransaction(args)
          return signed as Transaction
        },
        signMessage: signMessage,
        wallet: wallet,
      })

      toast.success("Reward claimed successfully!")
      setPlacedPrediction(null)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message ?? "Claim failed")
    } finally {
      setIsClaiming(false)
    }
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
      toast.error(`Prediction must be between ${MIN_PREDICTION.toFixed(DISPLAY_DECIMALS)} and ${MAX_PREDICTION.toFixed(DISPLAY_DECIMALS)}`)
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
          {isPoolResolved ? (
            <>
              <p className="text-muted-foreground mb-2">Pool Resolved</p>
              <p className="text-sm text-muted-foreground mb-4">Weights have been calculated. Claim your reward!</p>
              <button
                onClick={handleClaimReward}
                disabled={isClaiming || !authenticated}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    Claiming...
                  </span>
                ) : (
                  "Claim"
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-2">Pool Closed</p>
              <p className="text-sm text-muted-foreground">New predictions are no longer accepted</p>
            </>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 p-6 rounded-2xl bg-card/20 border border-border shadow-xl space-y-6"
    >
      <div>
        <h3 className="text-base md:text-lg font-bold text-foreground">Place Prediction</h3>
        {/* <p className="text-xs md:text-sm text-muted-foreground mt-1">Pool {pool.pool_id}</p> */}
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
              <label className="text-xs md:text-sm font-medium text-foreground">Prediction</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-border rounded-md bg-muted/10 px-2">
                      <input
                        type="number"
                        min={MIN_PREDICTION}
                        max={MAX_PREDICTION}
                        step={INPUT_STEP}
                        value={inputPrediction}
                        onChange={handlePredictionInputChange}
                        onBlur={() => {
                          if (inputPrediction === "" || inputPrediction === "-" || inputPrediction === ".") {
                            setInputPrediction(formatPrediction(prediction))
                            setPredictionError("")
                            return
                          }
                          const v = Number(inputPrediction)
                          if (Number.isNaN(v)) {
                            setInputPrediction(formatPrediction(prediction))
                            setPredictionError("")
                            return
                          }
                          const clamped = clampPrediction(v)
                          setPrediction(clamped)
                          setInputPrediction(formatPrediction(clamped))
                          setPredictionError("")
                        }}
                        disabled={isSubmitting || !authenticated}
                        className="no-spinner flex-1 px-2 py-1 bg-transparent border-0 text-right font-mono text-base md:text-lg font-bold text-primary focus:outline-none"
                      />

                      <div className="flex flex-col ml-2">
                        <button
                          type="button"
                          aria-label="increase"
                          onClick={() => incrementPrediction(INPUT_STEP)}
                          disabled={isSubmitting || !authenticated}
                          className="bg-transparent rounded text-primary hover:bg-muted/20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-up h-3.5 w-3.5" aria-hidden="true"><path d="m18 15-6-6-6 6"></path></svg>
                        </button>
                        <button
                          type="button"
                          aria-label="decrease"
                          onClick={() => incrementPrediction(-INPUT_STEP)}
                          disabled={isSubmitting || !authenticated}
                          className=" bg-transparent rounded text-primary hover:bg-muted/20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {pool.name && pool.name.toLowerCase().includes("price") && (
                    <span className="text-xs text-muted-foreground">USD</span>
                  )}
                </div>
              </div>
            </div>

            <input
              type="range"
              min={MIN_PREDICTION}
              max={MAX_PREDICTION}
              step={INPUT_STEP}
              value={prediction}
              onChange={(e) => handlePredictionChange(Number(e.target.value))}
              disabled={isSubmitting || !authenticated}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
            />

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{MIN_PREDICTION}</span>
              <span>{MAX_PREDICTION}</span>
            </div>
            {predictionError && (
              <p className="text-xs text-red-500 mt-2">{predictionError}</p>
            )}
          </div>

          {/* Stake Amount */}
          <div>
            <label htmlFor="deposit" className="block text-xs md:text-sm font-medium text-foreground mb-2">
              Stake Amount (USDC)
            </label>
            <div className="w-full flex items-center gap-2">
              <div className="w-full flex items-center border border-border rounded-md bg-muted/10 px-2">
                <input
                  id="deposit"
                  type="number"
                  step="1"
                  min="1"
                  value={deposit}
                  onChange={handleDepositChange}
                  placeholder="100"
                  disabled={isSubmitting || !authenticated}
                  className="no-spinner flex-1 px-2 py-3 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 transition-smooth disabled:opacity-50"
                />
                <div className="flex flex-col ml-2">
                  <button
                    type="button"
                    aria-label="increase deposit"
                    onClick={() => incrementDeposit(1)}
                    disabled={isSubmitting || !authenticated}
                    className="p-1 bg-transparent rounded text-foreground hover:bg-muted/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-up h-3.5 w-3.5" aria-hidden="true"><path d="m18 15-6-6-6 6"></path></svg>
                  </button>
                  <button
                    type="button"
                    aria-label="decrease deposit"
                    onClick={() => incrementDeposit(-1)}
                    disabled={isSubmitting || !authenticated}
                    className="p-1 bg-transparent rounded text-foreground hover:bg-muted/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down h-3.5 w-3.5" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                </div>
              </div>
            </div>
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
            className="w-full py-3 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Participants</span>
          <span className="font-semibold">{pool.total_participants}</span>
        </div>
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Vault Balance</span>
          <span className="font-mono text-xs font-semibold">${(pool.vault_balance / 1_000_000).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary/20 text-primary capitalize">
            {pool.status}
          </span>
        </div>
      </div>
      <style jsx>{`
        input.no-spinner::-webkit-outer-spin-button,
        input.no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
    </motion.div>
  )
}
