// import type { Pool } from "../store/slices/poolsSlice"
// import type { Prediction } from "../store/slices/predictionsSlice"

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

// export const mockLeaderboard: LeaderboardEntry[] = [
//   {
//     rank: 1,
//     address: "0x742d...3f8a",
//     accuracy: 96.8,
//     totalPredictions: 45,
//     totalRewards: 125000,
//   },
//   {
//     rank: 2,
//     address: "0x9a3c...7b2e",
//     accuracy: 95.2,
//     totalPredictions: 38,
//     totalRewards: 98000,
//   },
//   {
//     rank: 3,
//     address: "0x1f5d...4c9b",
//     accuracy: 94.7,
//     totalPredictions: 52,
//     totalRewards: 112000,
//   },
//   {
//     rank: 4,
//     address: "0x8e2a...6d1f",
//     accuracy: 93.5,
//     totalPredictions: 41,
//     totalRewards: 87000,
//   },
//   {
//     rank: 5,
//     address: "0x3b7f...9e4c",
//     accuracy: 92.8,
//     totalPredictions: 36,
//     totalRewards: 76000,
//   },
//   {
//     rank: 6,
//     address: "0x6c4e...2a8d",
//     accuracy: 91.9,
//     totalPredictions: 29,
//     totalRewards: 65000,
//   },
//   {
//     rank: 7,
//     address: "0x5d9b...1f3e",
//     accuracy: 90.5,
//     totalPredictions: 33,
//     totalRewards: 58000,
//   },
//   {
//     rank: 8,
//     address: "0x2e8c...7b5a",
//     accuracy: 89.7,
//     totalPredictions: 27,
//     totalRewards: 52000,
//   },
// ]
