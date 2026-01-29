import { PoolResponse } from "@/lib/api/pools"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


export type BetStatus = 'initialized' | 'active' | 'calculated' | 'claimed';

export interface Prediction {
  id: string;
  user_wallet: string;
  pool_pubkey: string;
  pool_id: number;
  deposit: number;
  prediction: number;
  calculated_weight: string;
  is_weight_added: boolean;
  status: BetStatus;
  creation_ts: number;
  update_count: number;
  end_timestamp: number;
  bet_pubkey: string;
  reward?: number;
  created_at: string;
  last_synced_at: string;
  pools: PoolResponse
}

interface PredictionsState {
  predictions: Prediction[]
  stats: {
    activePredictions: number
    totalStaked: number
    totalRewards: number
    avgAccuracy: number
  }
  loading: boolean
  error: string | null
}

const initialState: PredictionsState = {
  predictions: [],
  stats: {
    activePredictions: 0,
    totalStaked: 0,
    totalRewards: 0,
    avgAccuracy: 0,
  },
  loading: false,
  error: null,
}

// Load from localStorage if available
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("predictions")
  if (saved) {
    try {
      Object.assign(initialState, JSON.parse(saved))
    } catch (e) {
      console.error("Failed to parse saved predictions")
    }
  }
}

const predictionsSlice = createSlice({
  name: "predictions",
  initialState,
  reducers: {
    setPredictions: (
      state,
      action: PayloadAction<{
        predictions: Prediction[]
        stats: {
          activePredictions: number
          totalStaked: number
          totalRewards: number
          avgAccuracy: number
        }
      }>,
    ) => {
      state.predictions = action.payload.predictions
      state.stats = action.payload.stats
      state.loading = false
      state.error = null
      if (typeof window !== "undefined") {
        localStorage.setItem("predictions", JSON.stringify(state))
      }
    },
    addPrediction: (state, action: PayloadAction<Prediction>) => {
      state.predictions.unshift(action.payload)
      if (typeof window !== "undefined") {
        localStorage.setItem("predictions", JSON.stringify(state))
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updatePrediction: (state, action: PayloadAction<Prediction>) => {
      const index = state.predictions.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.predictions[index] = action.payload
        if (typeof window !== "undefined") {
          localStorage.setItem("predictions", JSON.stringify(state))
        }
      }
    },
  },
})

export const { setPredictions, addPrediction, setLoading, setError, updatePrediction } = predictionsSlice.actions
export default predictionsSlice.reducer
