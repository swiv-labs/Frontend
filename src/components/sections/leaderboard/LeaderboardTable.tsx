"use client"

import { motion } from "framer-motion"
import { Confetti } from "./Confetti"
import { useAppSelector } from "@/lib/store/hooks"
import { LeaderboardEntry } from "@/lib/types/models"
import { formatUsdcBalanceWithDollar } from "@/lib/helpers/formatUsdc"

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { address } = useAppSelector((state) => state.wallet)

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative">
          <Confetti />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl shadow-lg shadow-yellow-500/50">
            🥇
          </div>
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="relative">
          <Confetti />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 text-2xl shadow-lg shadow-gray-400/50">
            🥈
          </div>
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="relative">
          <Confetti />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-2xl shadow-lg shadow-orange-500/50">
            🥉
          </div>
        </div>
      )
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted border border-border text-lg font-bold text-muted-foreground">
        {rank}
      </div>
    )
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "text-green-400"
    if (accuracy >= 90) return "text-yellow-400"
    return "text-orange-400"
  }

  const isCurrentUser = (entryAddress: string) => {
    return address && entryAddress.toLowerCase().includes(address.slice(2, 6).toLowerCase())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {entries.slice(0, 3).map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`relative group ${index === 0 ? "md:order-2" : index === 1 ? "md:order-1" : "md:order-3"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-smooth" />
            <div className="relative p-6 rounded-2xl border-2 border-primary/50 hover:border-primary transition-smooth">
              <div className="flex flex-col items-center text-center">
                {getRankBadge(entry.rank)}
                <div className="mt-4 mb-2">
                  <div className="font-mono text-lg font-bold text-foreground">{entry.user_wallet}</div>
                </div>
                <div className={`text-3xl font-bold mb-1 ${getAccuracyColor(entry.win_rate)}`}>
                  {entry.win_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">Accuracy</div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predictions</span>
                    <span className="font-semibold text-foreground">{entry.active_predictions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rewards</span>
                    <span className="font-semibold text-green-400">{formatUsdcBalanceWithDollar(entry.total_earnings)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl border border-border"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">All Rankings</h2>
          <p className="text-sm text-muted-foreground">Complete leaderboard standings</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Address</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Accuracy</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Predictions</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Total Rewards</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <motion.tr
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className={`border-b border-border/50 transition-smooth ${
                    isCurrentUser(entry.user_wallet) ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted/30"
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {entry.rank <= 3 ? (
                        <div className="text-2xl">{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                          {entry.rank}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{entry.user_wallet}</span>
                      {isCurrentUser(entry.user_wallet) && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/20 border border-primary/30 text-xs font-medium text-primary">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold ${getAccuracyColor(entry.win_rate)}`}>
                      {entry.win_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{entry.active_predictions}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-green-400">{formatUsdcBalanceWithDollar(entry.total_earnings)}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
