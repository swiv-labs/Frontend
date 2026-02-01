"use client"

import { motion } from "framer-motion"
import { useAppSelector } from "@/lib/store/hooks"

export default function PerformanceMetrics() {
  const predictions = useAppSelector((state) => state.predictions.predictions)

  const completedPredictions = predictions.filter((p) => p.status === "claimed")
  const activePredictions = predictions.filter((p) => p.status === "active" || p.status === "calculated")

  // Calculate metrics
  const totalPredictions = predictions.length
  const winRate =
    completedPredictions.length > 0
      ? (completedPredictions.filter((p) => (p.reward || 0) > p.deposit).length / completedPredictions.length) * 100
      : 0

  const avgAccuracy =
    completedPredictions.length > 0
      ? completedPredictions.reduce((sum, p) => sum + (0 || 0), 0) / completedPredictions.length
      : 0

  const bestAccuracy =
    completedPredictions.length > 0 ? Math.max(...completedPredictions.map((p) => 0 || 0)) : 0

  const totalStaked = predictions.reduce((sum, p) => sum + p.deposit, 0)
  const totalRewards = completedPredictions.reduce((sum, p) => sum + (p.reward || 0), 0)
  const roi = totalStaked > 0 ? ((totalRewards - totalStaked) / totalStaked) * 100 : 0

  const metrics = [
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      color: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Avg Accuracy",
      value: `${avgAccuracy.toFixed(1)}%`,
      color: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Best Accuracy",
      value: `${bestAccuracy.toFixed(1)}%`,
      color: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "ROI",
      value: `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`,
      color: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Active Positions",
      value: activePredictions.length.toString(),
      color: "text-gray-600 dark:text-gray-400",
    },
    {
      label: "Completed",
      value: completedPredictions.length.toString(),
      color: "text-gray-600 dark:text-gray-400",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl p-6 border border-gray-100 dark:border-gray-900 h-full"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Metrics</h2>

      <div className="space-y-6">
        {metrics.map((metric, index) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
              <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
            </div>
            {index < metrics.length - 1 && <div className="h-px bg-gray-200 dark:bg-gray-800" />}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
