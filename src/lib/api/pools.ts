import type { Pool, PoolStatus, ApiResponse, ApiListResponse } from "@/lib/types/models"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

export const getAllPools = async (status?: PoolStatus): Promise<Pool[]> => {
  try {
    const url = status ? `${API_BASE_URL}/api/pools?status=${status}` : `${API_BASE_URL}/api/pools`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch pools: ${response.statusText}`)
    }

    const result: ApiListResponse<Pool> = await response.json()
    return result.data || []
  } catch (error) {
    console.error("[pools] Error fetching pools:", error)
    throw error
  }
}

export const getPoolById = async (poolId: string): Promise<Pool> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch pool: ${response.statusText}`)
    }

    const result: ApiResponse<Pool> = await response.json()
    return result.data
  } catch (error) {
    console.error("[pools] Error fetching pool:", error)
    throw error
  }
}

export const getPoolsByAdmin = async (adminWallet: string): Promise<Pool[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pools?admin=${adminWallet}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch pools: ${response.statusText}`)
    }

    const result: ApiListResponse<Pool> = await response.json()
    return result.data || []
  } catch (error) {
    console.error("[pools] Error fetching pools by admin:", error)
    throw error
  }
}

export const getPoolsByStatus = async (status: PoolStatus): Promise<Pool[]> => {
  return getAllPools(status)
}

export const finalizePoolWeights = async (poolId: string): Promise<Pool> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}/finalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to finalize pool weights")
    }

    const result: ApiResponse<Pool> = await response.json()
    return result.data
  } catch (error) {
    console.error("[pools] Error finalizing pool weights:", error)
    throw error
  }
}