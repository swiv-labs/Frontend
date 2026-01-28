import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Pool, PoolStatus } from "@/lib/types/models"

interface PoolsState {
  pools: Pool[]
  currentPool: Pool | null
  loading: boolean
  error: string | null
}

const initialState: PoolsState = {
  pools: [],
  currentPool: null,
  loading: false,
  error: null,
}

const poolsSlice = createSlice({
  name: "pools",
  initialState,
  reducers: {
    setPools: (state, action: PayloadAction<Pool[]>) => {
      state.pools = action.payload
      state.error = null
    },
    setCurrentPool: (state, action: PayloadAction<Pool | null>) => {
      state.currentPool = action.payload
    },
    updatePool: (state, action: PayloadAction<Pool>) => {
      const index = state.pools.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.pools[index] = action.payload
      }
      if (state.currentPool?.id === action.payload.id) {
        state.currentPool = action.payload
      }
    },
    addPool: (state, action: PayloadAction<Pool>) => {
      state.pools.push(action.payload)
    },
    removePool: (state, action: PayloadAction<string>) => {
      state.pools = state.pools.filter((p) => p.id !== action.payload)
      if (state.currentPool?.id === action.payload) {
        state.currentPool = null
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setPools,
  setCurrentPool,
  updatePool,
  addPool,
  removePool,
  setLoading,
  setError,
  clearError,
} = poolsSlice.actions

export default poolsSlice.reducer

// Export type for use in components
export type { Pool }
