"use client"

import { motion } from "framer-motion"
import { useAppSelector } from "@/lib/store/hooks"
import Link from "next/link"
import { ChartArea } from "lucide-react"

export default function ActivePositions() {
  const predictions = useAppSelector((state) => state.predictions.predictions)
  const pools = useAppSelector((state) => state.pools.pools)

  const activePredictions = predictions.filter((p) => p.status === "pending" || p.status === "resolved")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="rounded-2xl p-6 border border-gray-100 dark:border-gray-900"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Positions</h2>
        <Link
          href="/predictions"
          className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition-colors"
        >
          View All →
        </Link>
      </div>

      {activePredictions.length > 0 ? (
        <div className="space-y-4">
          {activePredictions.slice(0, 5).map((prediction) => {
            const pool = pools.find((p) => p.id === prediction.pool_id)
            return (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-900 hover:border-gray-100 dark:hover:border-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg">
                    {pool?.icon || "₿"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{prediction.pools.asset_symbol}</p>
                    {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                      Predicted: ${prediction.predictedPrice.toLocaleString()}
                    </p> */}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${prediction.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Staked</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 w-full justify-center flex"><ChartArea/></div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No active positions</p>
          <Link
            href="/pools"
            className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
          >
            Browse Pools
          </Link>
        </div>
      )}
    </motion.div>
  )
}
