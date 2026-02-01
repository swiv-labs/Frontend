// import type { Pool } from "../store/slices/poolsSlice"
// import type { Prediction } from "../store/slices/predictionsSlice"

import { LeaderboardEntry } from "../types/models";

// export const mockPools: Pool[] = [
//   {
//     id: "1",
//     asset: "Bitcoin",
//     symbol: "BTC",
//     poolSize: 125000,
//     participants: 342,
//     deadline: "2025-01-15T23:59:59",
//     status: "ongoing",
//     icon: "₿",
//   },
//   {
//     id: "2",
//     asset: "Ethereum",
//     symbol: "ETH",
//     poolSize: 89000,
//     participants: 256,
//     deadline: "2025-01-12T23:59:59",
//     status: "ongoing",
//     icon: "Ξ",
//   },
//   {
//     id: "3",
//     asset: "Solana",
//     symbol: "SOL",
//     poolSize: 45000,
//     participants: 189,
//     deadline: "2025-01-20T23:59:59",
//     status: "upcoming",
//     icon: "◎",
//   },
//   {
//     id: "4",
//     asset: "Cardano",
//     symbol: "ADA",
//     poolSize: 32000,
//     participants: 145,
//     deadline: "2025-01-18T23:59:59",
//     status: "upcoming",
//     icon: "₳",
//   },
//   {
//     id: "5",
//     asset: "Polkadot",
//     symbol: "DOT",
//     poolSize: 78000,
//     participants: 412,
//     deadline: "2024-12-28T23:59:59",
//     status: "closed",
//     icon: "●",
//   },
// ]

// export const mockPredictions: Prediction[] = [
//   // {
//   //   id: "1",
//   //   poolId: "5",
//   //   asset: "Polkadot",
//   //   predictedPrice: 8.45,
//   //   actualPrice: 8.32,
//   //   stake: 500,
//   //   reward: 1250,
//   //   accuracy: 98.5,
//   //   timestamp: "2024-12-20T10:30:00",
//   //   status: "completed",
//   // },
//   // {
//   //   id: "2",
//   //   poolId: "1",
//   //   asset: "Bitcoin",
//   //   predictedPrice: 105000,
//   //   stake: 1000,
//   //   timestamp: "2025-01-08T14:20:00",
//   //   status: "active",
//   // },
//   // {
//   //   id: "3",
//   //   poolId: "2",
//   //   asset: "Ethereum",
//   //   predictedPrice: 3850,
//   //   stake: 750,
//   //   timestamp: "2025-01-09T09:15:00",
//   //   status: "active",
//   // },
// ]

// export interface LeaderboardEntry {
//   rank: number
//   address: string
//   accuracy: number
//   totalPredictions: number
//   totalRewards: number
// }

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user_wallet: "0x742d...3f8a",
    win_rate: 96.8,
    active_predictions: 45,
    total_earnings: 125000,
    id: "1",
    updated_at: "1"
  },
]
