/**
 * Shared types that align with backend database schema
 * These types are directly derived from the backend models
 * to ensure perfect data consistency across frontend, backend, and contract
 */

/** Pool status enum matching contract and backend */
export type PoolStatus = 'active' | 'resolved' | 'settled' | 'closed'

/** Bet/Prediction status enum matching contract */
export type BetStatus = 'initialized' | 'active' | 'calculated' | 'claimed'

/**
 * Pool model - matches backend Pool.ts interface
 * Represents a prediction pool on the blockchain
 */
export interface Pool {
  id: string // UUID from database
  pool_id: number // BIGINT UNIQUE on-chain identifier
  admin: string // Admin wallet address
  name: string // Pool name
  token_mint: string // SPL token mint address
  start_time: number // Unix timestamp
  end_time: number // Unix timestamp
  vault_balance: number // Current vault balance in lamports
  max_accuracy_buffer: number // Contract parameter
  conviction_bonus_bps: number // Basis points for conviction bonus
  metadata?: string // Additional JSON metadata
  resolution_target?: number // Target price for resolution (if applicable)
  min_prediction: number // Minimum prediction value constraint
  max_prediction: number // Maximum prediction value constraint
  is_resolved: boolean // Whether pool has been resolved
  resolution_ts?: number // Timestamp when resolved
  total_weight?: string // Total calculated weight (stored as string for large numbers)
  weight_finalized?: boolean // Whether weights have been finalized
  total_participants: number // Number of participants
  pool_pubkey: string // On-chain pool account pubkey
  vault_pubkey: string // On-chain vault account pubkey
  status: PoolStatus // Current pool status
  created_at?: string // ISO timestamp
  updated_at?: string // ISO timestamp
}

/**
 * Prediction/UserBet model - matches backend Prediction.ts interface
 * Represents a user's bet/prediction in a pool
 */
export interface Prediction {
  id: string // UUID from database
  user_wallet: string // User's wallet address
  pool_pubkey: string // Associated pool pubkey
  pool_id: number // Associated pool id (for quick lookups)
  deposit: number // Bet deposit amount in lamports
  prediction: number // Predicted value (encrypted on TEE)
  calculated_weight: string // Weight calculated after resolution (stored as string)
  is_weight_added: boolean // Whether weight has been added to pool
  status: BetStatus // Current bet status
  creation_ts: number // Unix timestamp when created
  update_count: number // Number of updates
  end_timestamp: number // Pool end time (denormalized for efficiency)
  bet_pubkey?: string // On-chain bet account pubkey
  reward?: number // Claimed reward amount
  created_at?: string // ISO timestamp
  updated_at?: string // ISO timestamp
}

/**
 * User profile model
 */
export interface User {
  id: string // UUID
  wallet_address: string // Primary wallet
  username?: string // Optional username
  avatar_url?: string // Avatar image URL
  total_bets?: number // Total predictions made
  win_rate?: number // Win percentage
  total_earned?: number // Total rewards earned
  created_at?: string // ISO timestamp
  updated_at?: string // ISO timestamp
}

/**
 * Leaderboard entry model
 */
export interface LeaderboardEntry {
  id: string // UUID
  user_wallet: string // User's wallet
  username?: string // Optional username
  total_earnings: number // Total earnings
  win_rate: number // Win percentage
  active_predictions: number // Current active bets
  rank: number // Current rank
  updated_at: string // Last update timestamp
}

/**
 * API Response wrapper matching backend response format
 */
export interface ApiResponse<T> {
  status: string // 'success' | 'error'
  message: string
  data: T
}

/**
 * Batch API response for arrays
 */
export interface ApiListResponse<T> {
  status: string
  message: string
  data: T[]
}

/**
 * User statistics
 */
export interface UserStats {
  activePredictions: number
  totalStaked: number
  totalRewards: number
  totalClaimed: number
  avgAccuracy?: number
  winRate?: number
}

/**
 * Pool with enriched data (for display)
 */
export interface PoolWithStats extends Pool {
  currentPrice?: number // Latest price (from CoinGecko)
  historicalPrices?: Array<{ timestamp: number; price: number }> // 30-day history
  myPrediction?: Prediction // User's prediction if logged in
  userStats?: UserStats // User's stats in this pool
}

/**
 * Prediction form data
 */
export interface PredictionInput {
  poolId: string // Pool identifier
  prediction: number // Predicted price/value
  deposit: number // Bet amount in lamports or token amount
}

/**
 * Contract resolution data
 */
export interface ResolutionData {
  poolId: number
  finalOutcome: number // Final resolved value from oracle
  timestamp: number
}
