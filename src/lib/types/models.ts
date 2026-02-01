export type PoolStatus = 'active' | 'resolved' | 'settled' | 'closed'

export type BetStatus = 'initialized' | 'active' | 'calculated' | 'claimed'

export interface Pool {
  id: string
  pool_id: number
  admin: string 
  name: string 
  token_mint: string
  start_time: number 
  end_time: number 
  vault_balance: number 
  max_accuracy_buffer: number 
  conviction_bonus_bps: number
  metadata?: string 
  resolution_target?: number 
  min_prediction: number
  max_prediction: number 
  is_resolved: boolean
  resolution_ts?: number 
  total_weight?: string 
  weight_finalized?: boolean 
  total_participants: number
  pool_pubkey: string 
  vault_pubkey: string
  status: PoolStatus 
  created_at?: string 
  updated_at?: string
}
export interface Prediction {
  id: string 
  user_wallet: string 
  pool_pubkey: string 
  pool_id: number 
  deposit: number
  prediction: number 
  calculated_weight: string 
  is_weight_added: boolean
  status: BetStatus 
  creation_ts: number 
  update_count: number 
  end_timestamp: number 
  bet_pubkey?: string 
  reward?: number 
  created_at?: string
  updated_at?: string
  last_synced_at?: string 
  pools: Pool[]
}

export interface User {
  id: string 
  wallet_address: string 
  username?: string
  avatar_url?: string 
  total_bets?: number 
  win_rate?: number 
  total_earned?: number 
  created_at?: string
  updated_at?: string
}

export interface LeaderboardEntry {
  id: string 
  user_wallet: string 
  username?: string
  total_earnings: number
  win_rate: number 
  active_predictions: number
  rank: number 
  updated_at: string 
}

export interface ApiResponse<T> {
  status: string 
  message: string
  data: T
}

export interface ApiListResponse<T> {
  status: string
  message: string
  data: T[]
}

export interface UserStats {
  activePredictions: number
  totalStaked: number
  totalRewards: number
  totalClaimed: number
  avgAccuracy?: number
  winRate?: number
}

export interface PoolWithStats extends Pool {
  currentPrice?: number 
  historicalPrices?: Array<{ timestamp: number; price: number }>
  myPrediction?: Prediction 
  userStats?: UserStats 
}

export interface PredictionInput {
  poolId: string 
  prediction: number
  deposit: number 
}

export interface ResolutionData {
  poolId: number
  finalOutcome: number 
  timestamp: number
}
