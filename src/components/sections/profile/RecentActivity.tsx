"use client"

import { motion } from "framer-motion"
import { useAppSelector } from "@/lib/store/hooks"

export default function RecentActivity() {
  const predictions = useAppSelector((state) => state.predictions.predictions)

  const recentPredictions = [...predictions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🔵"
      case "completed":
        return "✅"
      default:
        return "⏳"
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-blue-600 dark:text-blue-400"
      case "completed":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="rounded-2xl p-6 border border-gray-100 dark:border-gray-900"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>

      {recentPredictions.length > 0 ? (
        <div className="space-y-4">
          {recentPredictions.map((prediction) => (
            <div key={prediction.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-900">
              {/* <div className="text-2xl">{getActivityIcon(prediction.status)}</div> */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {prediction.status === "claimed" ? "Claimed" : "Placed"} prediction on {prediction.pools.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(prediction.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getActivityColor(prediction.status)}`}>
                  {prediction.status === "claimed" && prediction.reward
                    ? `+$${(prediction.reward - prediction.deposit).toLocaleString()}`
                    : `$${prediction.deposit.toLocaleString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">No activity yet</div>
      )}
    </motion.div>
  )
}
