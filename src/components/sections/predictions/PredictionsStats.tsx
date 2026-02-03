"use client"

import { Prediction } from "@/lib/types/models"
import { motion } from "framer-motion"
import { Lock, PiggyBank, Trophy, TrendingUp } from "lucide-react"
import { formatUsdcBalanceWithDollar } from "@/lib/helpers/formatUsdc"

interface PredictionsStatsProps {
  predictions: Prediction[]
  stats: {
    activePredictions: number
    totalStaked: number
    totalRewards: number
    totalClaimed: number
  }
}

export function PredictionsStats({ predictions, stats }: PredictionsStatsProps) {
  console.log("PredictionsStats props:", { predictions, stats })  
  const statsList = [
    {
      label: "Active Predictions",
      value: stats.activePredictions.toString(),
      icon: <Lock size={30} />,
      color: "text-blue-400",
    },
    {
      label: "Total Volume",
      value: formatUsdcBalanceWithDollar(stats.totalStaked),
      icon: <PiggyBank size={30} />,
      color: "text-green-400",
    },
    {
      label: "PnL",
      value: `+$780.89`,
      icon: <Trophy size={30} />,
      color: "text-yellow-400",
    },
    {
      label: "Avg. Accuracy",
      value: `$78.90%`,
      icon: <TrendingUp size={30} />,
      color: "text-primary",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {statsList.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          className="relative group"
        >
          {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-smooth" /> */}
          <div className="relative p-6 rounded-2xl bg-transparent border border-border hover:border-primary/50 transition-smooth">
            {/* <div className={`mb-5 ${stat.color}`}>{stat.icon}</div> */}
            <div className={`text-2xl font-bold mb-1 text-primary`}>{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
