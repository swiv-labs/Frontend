/**
 * Prediction/Bet placement
 * This now delegates to the backend API which handles all contract interaction
 * Frontend only submits the prediction and amount, backend manages encryption and TEE flow
 */

import { placePrediction, claimReward } from "@/lib/api/predictions"
import type { Prediction } from "@/lib/types/models"

export interface PlaceBetParams {
  poolId: string
  predictedPrice: number
  stakeAmount: number // In lamports or base token units
  userWallet: string
}

export interface ClaimRewardsParams {
  predictionId: string
}

/**
 * Place a bet/prediction on a pool
 * Backend handles all Solana contract interaction and TEE encryption
 */
export async function placeEncryptedBet(params: PlaceBetParams): Promise<Prediction> {
  try {
    console.log("[placeEncryptedBet] Placing prediction via backend API...", {
      poolId: params.poolId,
      userWallet: params.userWallet,
      amount: params.stakeAmount,
    })

    const prediction = await placePrediction({
      poolId: params.poolId,
      userWallet: params.userWallet,
      deposit: params.stakeAmount,
      prediction: params.predictedPrice,
    })

    console.log("[placeEncryptedBet] Prediction placed successfully:", prediction.id)
    return prediction
  } catch (error) {
    console.error("[placeEncryptedBet] Failed to place prediction:", error)
    throw error
  }
}

/**
 * Claim reward for a prediction
 */
export async function claimPredictionReward(
  params: ClaimRewardsParams,
): Promise<Prediction> {
  try {
    console.log("[claimPredictionReward] Claiming reward for prediction:", params.predictionId)

    const updatedPrediction = await claimReward(params.predictionId)

    console.log("[claimPredictionReward] Reward claimed successfully")
    return updatedPrediction
  } catch (error) {
    console.error("[claimPredictionReward] Failed to claim reward:", error)
    throw error
  }
}