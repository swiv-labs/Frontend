/**
 * Predictions/Bets API integration
 * Directly aligned with backend Prediction model
 * 
 * This API layer is called AFTER on-chain transactions are complete:
 * 1. Frontend: Create UserBet account via init_bet (L1)
 * 2. Frontend: Delegate to TEE via place_bet (Ephemeral RPC)
 * 3. Frontend: Call this API to persist metadata in database
 */

import type { Prediction, UserStats, ApiResponse, ApiListResponse } from "@/lib/types/models"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

/**
 * Place a new prediction/bet on a pool
 * Matches backend PredictionsController.placeBet signature
 */
export interface PlacePredictionRequest {
  poolId: string
  userWallet: string
  deposit: number // Amount in lamports/token units
  prediction?: number // Predicted value, can be encrypted on TEE
  requestId?: string // Unique request ID for bet PDA seed
  bet_pubkey?: string // On-chain bet account pubkey after init_bet
}

export const placePrediction = async (
  data: PlacePredictionRequest,
): Promise<Prediction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to place prediction")
    }

    const result: ApiResponse<Prediction> = await response.json()
    return result.data
  } catch (error) {
    console.error("[predictions] Error placing prediction:", error)
    throw error
  }
}

/**
 * Get user's predictions with stats
 * Matches backend PredictionsController.getUserBets signature
 */
export interface UserPredictionsApiResponse {
  data: {
    stats: UserStats
    predictions: Prediction[]
  }
}

export interface UserPredictionsResponse {
  stats: UserStats
  predictions: Prediction[]
}

export const fetchUserPredictions = async (
  walletAddress: string,
): Promise<UserPredictionsApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/${walletAddress}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch predictions")
    }

    const result: ApiResponse<UserPredictionsApiResponse> = await response.json()
    console.log("Fetched user predictions:", result.data)
    return result.data
  } catch (error) {
    console.error("[predictions] Error fetching user predictions:", error)
    throw error
  }
}

/**
 * Get all predictions for a specific pool
 * Matches backend PredictionsController.getPoolBets signature
 */
export const fetchPoolPredictions = async (poolId: string): Promise<Prediction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/pool/${poolId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch pool predictions")
    }

    const result: ApiListResponse<Prediction> = await response.json()
    return result.data || []
  } catch (error) {
    console.error("[predictions] Error fetching pool predictions:", error)
    throw error
  }
}

/**
 * Claim reward for a prediction
 * Matches backend PredictionsController.claimReward signature
 */
export const claimReward = async (
  predictionId: string,
): Promise<Prediction> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/predictions/${predictionId}/claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to claim reward")
    }

    const result: ApiResponse<Prediction> = await response.json()
    return result.data
  } catch (error) {
    console.error("[predictions] Error claiming reward:", error)
    throw error
  }
}

/**
 * Update a prediction (e.g., change prediction value before pool starts)
 * Matches backend PredictionsController.updateBetPrediction signature
 */
export interface UpdatePredictionRequest {
  prediction: number
}

export const updatePrediction = async (
  predictionId: string,
  data: UpdatePredictionRequest,
): Promise<Prediction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predictions/${predictionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update prediction")
    }

    const result: ApiResponse<Prediction> = await response.json()
    return result.data
  } catch (error) {
    console.error("[predictions] Error updating prediction:", error)
    throw error
  }
}