import type { Prediction, UserStats, ApiResponse, ApiListResponse } from "@/lib/types/models"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

export interface PlacePredictionRequest {
  poolId: string
  userWallet: string
  deposit: number 
  prediction?: number 
  requestId?: string 
  bet_pubkey?: string
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
  ): Promise<UserPredictionsResponse> => {
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

    const result: UserPredictionsApiResponse = await response.json()
    console.log("Fetched user predictions:", result.data)
    return result.data
  } catch (error) {
    console.error("[predictions] Error fetching user predictions:", error)
    throw error
  }
}

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

export interface ClaimRewardDBRequest {
  predictionId: string
  userWallet: string
  claimTxSignature: string
  rewardAmount: number
}

export const claimRewardDB = async (
  data: ClaimRewardDBRequest,
): Promise<Prediction> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/predictions/${data.predictionId}/claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWallet: data.userWallet,
          claimTxSignature: data.claimTxSignature,
          rewardAmount: data.rewardAmount,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to persist claim record")
    }

    const result: ApiResponse<Prediction> = await response.json()
    return result.data
  } catch (error) {
    console.error("[predictions] Error persisting claim record:", error)
    throw error
  }
}

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